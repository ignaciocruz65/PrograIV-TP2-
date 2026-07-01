import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type Publicacion = {
  id: string;
  titulo: string;
  descripcion: string;
  imagenUrl?: string | null;
  usuarioAvatarUrl?: string;
  usuarioId: string;
  nombreUsuario: string;
  likes: string[];
  comentarios: { id?: string, nombreUsuario: string, texto: string,fecha: string, modificado?: boolean }[];
  createdAt: string;
};

@Injectable({
  providedIn: 'root'
})
export class PublicacionesService {
  private http = inject(HttpClient);
  private apiUrl = 'https://progra-iv-tp-2-six.vercel.app/publicaciones';

  publicaciones = signal<Publicacion[]>([]);

  cargarPublicaciones(limit: number = 10, offset: number = 0, sort: string = 'fecha', usuarioId?: string) {
    let urlCompleta = `${this.apiUrl}?limit=${limit}&offset=${offset}&sort=${sort}`;
    if (usuarioId) urlCompleta += `&usuarioId=${usuarioId}`;

    this.http.get<Publicacion[]>(urlCompleta).subscribe({
      next: (data) => this.publicaciones.set(data),
      error: (err) => console.error('Error al cargar publicaciones:', err)
    });
  }

  crearPublicacion(formData: FormData) {
    return this.http.post(this.apiUrl, formData);
  }

  eliminarPublicacion(id: string, miId: string, miPerfil: string) {
    return this.http.delete(`${this.apiUrl}/${id}`, { body: { usuarioId: miId, perfil: miPerfil } });
  }

  toggleLike(id: string, yaTieneLike: boolean, miId: string) {
    if (yaTieneLike) {
      return this.http.delete(`${this.apiUrl}/${id}/like`, { body: { usuarioId: miId } });
    } else {
      return this.http.post(`${this.apiUrl}/${id}/like`, { usuarioId: miId });
    }
  }

  comentar(id: string, nombreUsuario: string, texto: string) {
    return this.http.post(`${this.apiUrl}/${id}/comentarios`, { nombreUsuario, texto });
  }
}