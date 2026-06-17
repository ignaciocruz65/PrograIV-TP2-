import { Routes } from '@angular/router';

export const routes: Routes = [

    { path: 'login', loadComponent: () => import('./paginas/login/login').then(c => c.Login) },
    { path: 'registro', loadComponent: () => import('./paginas/registro/registro').then(c => c.Registro) },
    { path: 'publicaciones', loadComponent: () => import('./paginas/publicaciones/publicaciones').then(c => c.Publicaciones) },    
    { path: 'mi-perfil', loadComponent: () => import('./paginas/mi-perfil/mi-perfil').then(c => c.MiPerfil) },
    { path: '', pathMatch: 'full', redirectTo: 'login' },
    { path: '**', redirectTo: 'login' },
];
