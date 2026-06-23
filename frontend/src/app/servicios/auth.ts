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
  private apiUrl = 'http://localhost:3000'; 
  private temporizador: any;
  
  // señal reactiva para almacenar el usuario actual
  usuarioActual = signal<UsuarioPublico | null>(null);

  constructor() {
    const userJson = localStorage.getItem('usuario');
    if (userJson) {
      this.usuarioActual.set(JSON.parse(userJson));
    }
  }

  validarTokenInicial() {
    const token = this.getToken();
    if (!token) return; 

    // preguntamos en el back
    this.http.post<{usuario: UsuarioPublico}>(`${this.apiUrl}/auth/autorizar`, { token })
      .subscribe({
        next: (res) => {
          this.usuarioActual.set(res.usuario);
          this.iniciarTemporizador(); // empieza reloj
        },
        error: () => this.cerrarSesion() // cerrado
      });
  }

  iniciarTemporizador() {
    clearTimeout(this.temporizador); // limpiar reloj anterior
    
    // 600000 milisegundos = 10 minutos
    this.temporizador = setTimeout(() => {
      Swal.fire({
        title: 'Tu sesión casi expira',
        text: 'Te quedan 5 minutos. ¿Querés extender tu sesión?',
        showCancelButton: true,
        confirmButtonText: 'Sí, extender',
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.isConfirmed) {
          this.refrescarToken();
        }else{
          this.cerrarSesion();
        }
      });
    }, 6000); 
  }


  refrescarToken() {
    const tokenViejo = this.getToken();
    if (!tokenViejo) return;

    this.http.post<{token: string}>(`${this.apiUrl}/auth/refrescar`, { token: tokenViejo })
      .subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token); // reescribimos el viejo token 
          this.iniciarTemporizador(); 
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
    clearTimeout(this.temporizador);
    
    this.router.navigate(['/login']);
  }

  estaLogueado(): boolean {
    return this.usuarioActual() !== null && localStorage.getItem('token') !== null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
