import { Routes } from '@angular/router'
import { adminGuard } from './guards/admin.guard'
import { guestGuard } from './guards/guest.guard'
import { authGuard } from './guards/auth.guard'

export const routes: Routes = [
    {   path: 'login', 
        loadComponent: () => import('./paginas/login/login').then(c => c.Login),
        canActivate: [guestGuard]
    },
    {
        path: 'registro',
        loadComponent: () => import('./paginas/registro/registro').then(c => c.Registro),
        canActivate: [guestGuard]
    },
    {
        path: 'publicaciones',
        loadComponent: () => import('./paginas/publicaciones/publicaciones').then(c => c.Publicaciones),
        canActivate: [authGuard]
    },
    {
        path: 'mi-perfil',
        loadComponent: () => import('./paginas/mi-perfil/mi-perfil').then(c => c.MiPerfil),
        canActivate: [authGuard]
    },
    {
        path: 'publicacion/:id',
        loadComponent: () =>
        import('./paginas/pagina-publicacion/pagina-pub').then(c => c.PaginaPublicacionComponent),
        canActivate: [authGuard]
    },
    {
        path: 'dashboard/usuarios',
        loadComponent: () => import('./paginas/dashboard/dash-usuarios/dash-usuarios').then(c => c.DashUsuariosComponent),
        canActivate: [adminGuard]
    },
    {
        path: 'dashboard/estadisticas',
        loadComponent: () => import('./paginas/dashboard/dash-estadisticas/dash-estadisticas').then(c => c.DashEstadisticasComponent),
        canActivate: [adminGuard]
    },

    { path: '', pathMatch: 'full', redirectTo: 'publicaciones' },
    { path: '**', redirectTo: 'publicaciones' }
]
