import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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

  // señal reactiva para almacenar el usuario actual
  usuarioActual = signal<UsuarioPublico | null>(null);

  constructor() {
    const userJson = localStorage.getItem('');
    if (userJson) {
      this.usuarioActual.set(JSON.parse(userJson));
    }
  }

  login(usuarioOCorreo: string, password: string): Promise<UsuarioPublico> {
    return new Promise((resolve, reject) => {
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { usuarioOCorreo, password })
        .subscribe({
          next: (response) => {
            this.usuarioActual.set(response.usuario);
            
            // guardado de token y datos en el navegador
            localStorage.setItem('usuario', JSON.stringify(response.usuario));
            localStorage.setItem('token', response.token); 
            
            
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
          next: (response) => {
            resolve(response);
          },
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
    this.router.navigate(['/login']);
  }

  estaLogueado(): boolean {
    // revisa que exista el usuario y exista el token
    return this.usuarioActual() !== null && localStorage.getItem('token') !== null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}