import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private apiUrl = 'https://progra-iv-tp-2-six.vercel.app/usuarios'; 

    private obtenerHeaders() {
    const token = this.authService.getToken(); 
    return {
        headers: new HttpHeaders({
            'Authorization': `Bearer ${token}`
            })
        };  
    }

    
    listar() {
        return this.http.get<any[]>(this.apiUrl, this.obtenerHeaders());
    }

    crear(datos: any) {
        return this.http.post(`${this.apiUrl}/alta`, datos, this.obtenerHeaders());
    }

    deshabilitar(id: string) {
        return this.http.delete(`${this.apiUrl}/${id}`, this.obtenerHeaders());
    }

    habilitar(id: string) {
        return this.http.post(`${this.apiUrl}/${id}/rehabilitar`, {}, this.obtenerHeaders());
    }
}