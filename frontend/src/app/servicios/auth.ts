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

// Interfaz para la respuesta de NestJS (Usuario + Token JWT)
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

  // señal reactiva para almacenar el usuario actual
  usuarioActual = signal<UsuarioPublico | null>(null);

  constructor() {
    // Al recargar la página, verificamos si ya estaba logueado
    const userJson = localStorage.getItem('');
    if (userJson) {
      this.usuarioActual.set(JSON.parse(userJson));
    }
  }

  // Usamos Promesas nativas y el .subscribe() que ya dominás
  login(usuarioOCorreo: string, password: string): Promise<UsuarioPublico> {
    return new Promise((resolve, reject) => {
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { usuarioOCorreo, password })
        .subscribe({
          next: (response) => {
            // 1. Guardamos el usuario en la señal
            this.usuarioActual.set(response.usuario);
            
            // 2. Guardamos datos y TOKEN en el navegador (Requisito del TP)
            localStorage.setItem('usuario', JSON.stringify(response.usuario));
            localStorage.setItem('token', response.token); 
            
            // 3. Resolvemos la promesa indicando que todo salió bien
            resolve(response.usuario);
          },
          error: (err) => {
            console.error('Error en el login:', err);
            reject(err); // Rechazamos la promesa si falla (ej: mala contraseña)
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