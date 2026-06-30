import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private apiUrl = 'https://progra-iv-tp-2-six.vercel.app/dashboard/estadisticas'; 

    private obtenerHeaders() {
        const token = this.authService.getToken(); 
        return {
            headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` })
        };  
    }

    getPublicacionesPorUsuario(desde: string, hasta: string) {
        let params = new HttpParams().set('desde', desde).set('hasta', hasta);
        return this.http.get<any[]>(`${this.apiUrl}/publicaciones-por-usuario`, { params, ...this.obtenerHeaders() });
    }

    getComentariosTotales(desde: string, hasta: string) {
        let params = new HttpParams().set('desde', desde).set('hasta', hasta);
        return this.http.get<any[]>(`${this.apiUrl}/comentarios-totales`, { params, ...this.obtenerHeaders() });
    }

    getComentariosPorPublicacion(desde: string, hasta: string) {
        let params = new HttpParams().set('desde', desde).set('hasta', hasta);
        return this.http.get<any[]>(`${this.apiUrl}/comentarios-por-publicacion`, { params, ...this.obtenerHeaders() });
    }
}