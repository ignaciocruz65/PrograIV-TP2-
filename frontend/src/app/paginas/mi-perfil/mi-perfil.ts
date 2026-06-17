import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../servicios/auth';
import { PublicacionesService } from '../../servicios/publicaciones';
import { Postear } from '../../componentes/postear/postear';


@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [Postear],
  templateUrl: './mi-perfil.html'
})
export class MiPerfil implements OnInit {
  servicioAuth = inject(AuthService);
  servicioPub = inject(PublicacionesService);

  ngOnInit() {
    const miId = this.servicioAuth.usuarioActual()?.id;
    if (miId) {
      //  ultimas 3 publicaciones
      this.servicioPub.cargarPublicaciones(3, 0, 'fecha', miId);
    }
  }
}