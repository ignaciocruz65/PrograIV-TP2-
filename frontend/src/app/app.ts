import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './servicios/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
})
export class App implements OnInit {
  // publico para que el app.html pueda usar servicioAuth.estaLogueado()
  public readonly servicioAuth = inject(AuthService);

  cargando = true; 

  ngOnInit() {
    this.servicioAuth.validarTokenInicial();
  }

  async confirmarCerrarSesion(): Promise<void> {
    const resultado = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Vas a tener que volver a ingresar tus credenciales para acceder.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545', 
      cancelButtonColor: '#6c757d',  
      background: '#0a0f1e',         
      color: '#ffffff'               
    });

    if (resultado.isConfirmed) {
      this.servicioAuth.cerrarSesion();
    }
  }
}