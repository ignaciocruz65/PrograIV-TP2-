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
  
  // NUEVO: señal para el reloj de la pantalla
  tiempoRestante = signal<number>(0); 

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
          this.iniciarTemporizador(); 
          this.cargandoGlobal.set(false);
        },
        error: () => {
          this.cargandoGlobal.set(false);
          this.cerrarSesion(); 
        }
      });
  }

  iniciarTemporizador() {
    clearInterval(this.intervalo); // limpiar reloj anterior
    
    // Seteamos la sesión en 5 minutos (300 segundos)
    this.tiempoRestante.set(300); 

    this.intervalo = setInterval(() => {
      const actual = this.tiempoRestante() - 1;
      this.tiempoRestante.set(actual);

      // Cuando queden 150 segundos (2.5 minutos), tiramos la alerta
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

      // Si el reloj llega a 0, lo echamos
      if (actual <= 0) {
        this.cerrarSesion();
      }
    }, 1000); // Se ejecuta cada 1 segundo
  }

  refrescarToken() {
    const tokenViejo = this.getToken();
    if (!tokenViejo) return;

    this.http.post<{token: string}>(`${this.apiUrl}/auth/refrescar`, { token: tokenViejo })
      .subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token); // reescribimos el viejo token 
          this.iniciarTemporizador(); // Esto reinicia el reloj a 300 de nuevo
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

            this.iniciarTemporizador();
            
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
    
    // FUNDAMENTAL: Apagamos el reloj al cerrar sesión
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