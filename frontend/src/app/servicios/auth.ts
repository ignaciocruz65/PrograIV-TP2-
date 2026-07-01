import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

export type UsuarioPublico = {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcionBreve: string;
  perfil: 'usuario' | 'administrador';
  imagenPerfilUrl: string | null;
  createdAt: string;
};

export interface AuthResponse {
  usuario: UsuarioPublico;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'https://progra-iv-tp-2-six.vercel.app';
  
  private intervalo: any; 

  // señal reactiva para almacenar el usuario actual
  usuarioActual = signal<UsuarioPublico | null>(null);
  cargandoGlobal = signal<boolean>(true);
  private readonly DURACION_SESION = 300;
  tiempoRestante = signal<number>(this.DURACION_SESION); 

  constructor() {
    const userJson = localStorage.getItem('usuario');
    if (userJson) {
      this.usuarioActual.set(JSON.parse(userJson));
    }
    this.cargandoGlobal.set(false);
  }

  validarTokenInicial() {
    const token = this.getToken();
    if (!token){
      this.cargandoGlobal.set(false);
      return;
    }

    this.http.post<{usuario: UsuarioPublico}>(`${this.apiUrl}/auth/autorizar`, { token })
      .subscribe({
        next: (res) => {
          this.usuarioActual.set(res.usuario);
          this.iniciarTemporizador(false); 
          this.cargandoGlobal.set(false);
        },
        error: () => {
          this.cargandoGlobal.set(false);
          this.cerrarSesion(); 
        }
      });
  }

  iniciarTemporizador(reset: boolean = true) {
    clearInterval(this.intervalo); // limpiar reloj anterior
    
    let inicioSesionStr = sessionStorage.getItem('inicioSesion');
    let inicioSesion: number;

    if (!inicioSesionStr || reset) {
      // es una nueva sesión
      inicioSesion = Date.now();
      sessionStorage.setItem('inicioSesion', inicioSesion.toString());
      this.tiempoRestante.set(this.DURACION_SESION);
    } else {
      // sí hay inicio guardado calculamos el tiempo transcurrido
      inicioSesion = parseInt(inicioSesionStr, 10);
      const transcurrido = Math.floor((Date.now() - inicioSesion) / 1000);
      const restante = this.DURACION_SESION - transcurrido;

      if (restante <= 0) {
        this.cerrarSesion();
        return;
      }

      //  tiempo real
      this.tiempoRestante.set(restante);
    }

    // iniciamos el intervalo para actualizar cada segundo
    this.intervalo = setInterval(() => {
      const actual = this.tiempoRestante() - 1;
      this.tiempoRestante.set(actual);

      if (actual === 150) {
        Swal.fire({
          title: 'Tu sesión casi expira',
          text: 'Te quedan 2.5 minutos. ¿Querés extender tu sesión?',
          showCancelButton: true,
          confirmButtonText: 'Sí, extender',
          cancelButtonText: 'No'
        }).then((result) => {
          if (result.isConfirmed) {
            this.refrescarToken();
          } else {
            this.cerrarSesion();
          }
        });
      }

      // no tiempo, cerramos sesión
      if (actual <= 0) {
        this.cerrarSesion();
      }
    }, 1000);
  }

  refrescarToken() {
    const tokenViejo = this.getToken();
    if (!tokenViejo) return;

    this.http.post<{token: string}>(`${this.apiUrl}/auth/refrescar`, { token: tokenViejo })
      .subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token); // reescribimos el viejo token 
          this.iniciarTemporizador(true); 
        },
        error: (err) => {
          console.error('Error en el refrescar token:', err);
          this.cerrarSesion();
        }
      });
  }

  login(usuarioOCorreo: string, password: string): Promise<UsuarioPublico> {
    return new Promise((resolve, reject) => {
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { usuarioOCorreo, password })
        .subscribe({
          next: (response) => {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            this.usuarioActual.set(response.usuario);
            localStorage.setItem('usuario', JSON.stringify(response.usuario));
            localStorage.setItem('token', response.token); 

            this.iniciarTemporizador(true);
            
            resolve(response.usuario);
          },
          error: (err) => {
            console.error('Error en el login:', err);
            reject(err);
          }
        });
    });
  }

  registrar(formData: FormData): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/registro`, formData)
        .subscribe({
          next: (response) => resolve(response),
          error: (err) => {
            console.error('Error en el registro:', err);
            reject(err);
          }
        });
    });
  }

  cerrarSesion(): void {
    this.usuarioActual.set(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token'); 
    
    clearInterval(this.intervalo); 
    this.tiempoRestante.set(0);
    
    this.router.navigate(['/login']);
  }

  estaLogueado(): boolean {
    return this.usuarioActual() !== null && localStorage.getItem('token') !== null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}