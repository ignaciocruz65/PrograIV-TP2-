import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs';
import { AuthService } from './servicios/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    return next(req).pipe(
        catchError((error) => {
        // si 401 - cerramos - login
        if (error.status === 401) {
            authService.cerrarSesion();
        }
        throw error;
        })
    );
};