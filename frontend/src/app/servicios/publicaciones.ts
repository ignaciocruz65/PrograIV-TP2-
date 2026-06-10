import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';


export type Publicacion = {
  id: string;
  titulo: string;
  mensaje: string;
  imagenUrl?: string | null;
  usuarioId: string;
  nombreUsuario: string;
  likes: string[];
  createdAt: string;
};

@Injectable({
  providedIn: 'root'
})
export class PublicacionesService {
  private http = inject(HttpClient);
  
  // Reemplazá esto con environment.apiUrl cuando lo tengas configurado
  private apiUrl = 'http://localhost:3000/publicaciones';

  publicaciones = signal<Publicacion[]>([]);

  cargarPublicaciones(sort: 'fecha' | 'likes' = 'fecha'): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<Publicacion[]>(`${this.apiUrl}?sort=${sort}`)
        .subscribe({
          next: (data) => {
            this.publicaciones.set(data);
            resolve();
          },
          error: (err) => {
            console.error('Error al cargar publicaciones:', err);
            
            this.publicaciones.set([
              {
                id: '1',
                titulo: '¡Bienvenidos a mi red social!',
                mensaje: 'Este es el primer post de prueba para el Sprint 1.',
                nombreUsuario: 'admin',
                usuarioId: 'admin-id',
                likes: [],
                createdAt: new Date().toISOString()
              }
            ]);
            
            resolve(); 
          }
        });
    });
  }

  crearPublicacion(formData: FormData): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post<Publicacion>(this.apiUrl, formData)
        .subscribe({
          next: () => {
            this.cargarPublicaciones().then(() => resolve());
          },
          error: (err) => {
            console.error('Error al crear publicación:', err);
            reject(err);
          }
        });
    });
  }

  eliminarPublicacion(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.delete(`${this.apiUrl}/${id}`)
        .subscribe({
          next: () => {
            this.cargarPublicaciones().then(() => resolve());
          },
          error: (err) => {
            console.error('Error al eliminar publicación:', err);
            reject(err);
          }
        });
    });
  }

  toggleLike(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.apiUrl}/${id}/like`, {})
        .subscribe({
          next: () => {
            this.cargarPublicaciones().then(() => resolve());
          },
          error: (err) => {
            console.error('Error al dar like:', err);
            reject(err);
          }
        });
    });
  }
}