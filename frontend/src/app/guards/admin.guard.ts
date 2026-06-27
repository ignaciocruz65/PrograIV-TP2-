import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../servicios/auth';

export const adminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    const usuario = authService.usuarioActual();

    if (usuario && usuario.perfil === 'administrador') {
        return true; // al dashboard
    } else {
        router.navigate(['/publicaciones']);
        return false;
    }
};