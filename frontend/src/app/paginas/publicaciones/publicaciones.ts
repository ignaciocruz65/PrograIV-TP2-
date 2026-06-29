import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../servicios/auth';
import { PublicacionesService } from '../../servicios/publicaciones';
import { Postear } from '../../componentes/postear/postear';
// import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [Postear], 
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  
  public readonly servicioAuth = inject(AuthService);
  public readonly servicioPub = inject(PublicacionesService);

  limite = 10;
  salto = 0;
  ordenActual = 'fecha';

  ngOnInit() {
    // pedir los posts apenas iniciamos el componente para que se muestren en la pantalla
    this.consultarServidor();
  }

  consultarServidor() {
    this.servicioPub.cargarPublicaciones(this.limite, this.salto, this.ordenActual);
  }
  paginaSiguiente() {
    this.salto += this.limite;
    this.consultarServidor();
  }	
  paginaAnterior() {
    this.salto -= this.limite;
    this.consultarServidor();
  }

  enviarPublicacion(evento: Event) {
    evento.preventDefault();
    const formulario = evento.target as HTMLFormElement;
    const formData = new FormData(formulario);
    
    const titulo = formData.get('titulo') as string;
    const descripcion = formData.get('descripcion') as string;
    
    if (!titulo.trim() || !descripcion.trim()) {
      Swal.fire('Banca', 'Tirate un chiste en el título y en la descripción o algo.', 'warning');
      return;
    }

    // datos usuario que publica
    const usuario = this.servicioAuth.usuarioActual();
    if (usuario) {
      formData.append('usuarioId', usuario.id);
      formData.append('nombreUsuario', usuario.nombreUsuario);
      formData.append('usuarioAvatarUrl', usuario.imagenPerfilUrl || ''); 
    }

    // enviado publicación
    this.servicioPub.crearPublicacion(formData).subscribe(() => {
      Swal.fire('¡Publicado!', 'Ya publicaste en tu muro', 'success');
      this.consultarServidor(); 
      formulario.reset();       
    });
  }

  // ordenar por fecha o por likes 
  cambiarOrden(evento: any) {
    this.ordenActual = evento.target.value;
    this.salto = 0;
    this.consultarServidor();
  }

}