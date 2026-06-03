import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil {
  public readonly servicioAuth = inject(AuthService);
}
