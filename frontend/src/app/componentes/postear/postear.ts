import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth';
import { PublicacionesService, Publicacion } from '../../servicios/publicaciones';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-postear',
  imports: [CommonModule, RouterLink],
  templateUrl: './postear.html',
  styleUrl: './postear.css',
})
export class Postear implements OnInit {
  @Input({ required: true }) post!: Publicacion;

  servicioAuth = inject(AuthService);
  servicioPub = inject(PublicacionesService);
  soyAdmin = false;

  ngOnInit(): void {
    const usuario = this.servicioAuth.usuarioActual();
    this.soyAdmin = usuario?.perfil === 'administrador';
  }

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

  escribirComentario(texto: string) {
    if (!texto.trim()) return;

    const usuario = this.servicioAuth.usuarioActual();
    if (!usuario) return;

    this.servicioPub.comentar(this.post.id, usuario.nombreUsuario, texto).subscribe(() => {
      this.servicioPub.cargarPublicaciones();
    });
  }
}