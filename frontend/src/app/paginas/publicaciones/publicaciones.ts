import { Component, inject } from '@angular/core';
import { AuthService } from '../../servicios/auth';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones {
  // inyectamos serviceauth para que publicaciones pueda usarlo 
  public readonly servicioAuth = inject(AuthService);
}