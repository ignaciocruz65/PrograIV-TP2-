import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { environment } from '../../../environments/environment'; // Ideal para no hardcodear la URL

export type Publicacion = {
  id: string;
  titulo: string;
  mensaje: string;
  imagenUrl?: string | null;
  usuarioId: string;
  nombreUsuario: string;
  likes: string[]; // IDs de usuarios que dieron like
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
            
            // Datos de prueba (Fallback) por si el backend de NestJS todavía no está levantado
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
            
            // Resolvemos igual para que la pantalla no se quede cargando infinitamente
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
            // Si se creó bien, recargamos la lista para que aparezca el nuevo post
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
            // Si se eliminó bien, actualizamos la lista visual
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
            // Refrescamos para ver el corazoncito actualizado
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