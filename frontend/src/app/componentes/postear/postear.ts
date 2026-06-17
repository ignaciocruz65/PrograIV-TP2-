import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../servicios/auth';
import { PublicacionesService, Publicacion } from '../../servicios/publicaciones';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-postear',
  imports: [CommonModule],
  templateUrl: './postear.html',
  styleUrl: './postear.css',
})
export class Postear {
  @Input({ required: true }) post!: Publicacion;

  servicioAuth = inject(AuthService);
  servicioPub = inject(PublicacionesService);

  get soyDuenio(): boolean {
    return this.post.usuarioId === this.servicioAuth.usuarioActual()?.id;
  }

  get yaLeDiLike(): boolean {
    const miId = this.servicioAuth.usuarioActual()?.id;
    return miId ? this.post.likes.includes(miId) : false;
  }

  darQuitarLike() {
    const miId = this.servicioAuth.usuarioActual()?.id;
    if (!miId) return; 

    this.servicioPub.toggleLike(this.post.id, this.yaLeDiLike, miId).subscribe(() => {
      this.servicioPub.cargarPublicaciones(); 
    });
  }

  borrarPost() {
    const usuario = this.servicioAuth.usuarioActual();
    if (!usuario) return;

    Swal.fire({
      title: '¿Borrar publicación?', text: 'Esto no se puede deshacer',
      icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, borrar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.servicioPub.eliminarPublicacion(this.post.id, usuario.id, usuario.perfil).subscribe(() => {
          Swal.fire('Borrado', 'Tu publicación ha sido borrada.',  'success');
          this.servicioPub.cargarPublicaciones();
        });
      }
    });
  }

  // NUEVA FUNCIÓN PARA COMENTAR (KISS total)
  escribirComentario() {
    const usuario = this.servicioAuth.usuarioActual();
    if (!usuario) return;

    Swal.fire({
      title: 'Dejá un comentario',
      input: 'text',
      inputPlaceholder: 'Escribí acá...',
      showCancelButton: true,
      confirmButtonText: 'Comentar'
    }).then((result) => {
      // Si escribió algo y le dio a confirmar
      if (result.isConfirmed && result.value) {
        this.servicioPub.comentar(this.post.id, usuario.nombreUsuario, result.value).subscribe(() => {
          this.servicioPub.cargarPublicaciones(); // Recarga para mostrar el comentario
        });
      }
    });
  }
}