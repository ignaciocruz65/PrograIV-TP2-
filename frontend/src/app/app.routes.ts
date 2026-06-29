import { Routes } from '@angular/router'
import { adminGuard } from './guards/admin.guard'

export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./paginas/login/login').then(c => c.Login) },
    {
        path: 'registro',
        loadComponent: () => import('./paginas/registro/registro').then(c => c.Registro)
    },
    {
        path: 'publicaciones',
        loadComponent: () => import('./paginas/publicaciones/publicaciones').then(c => c.Publicaciones)
    },
    {
        path: 'mi-perfil',
        loadComponent: () => import('./paginas/mi-perfil/mi-perfil').then(c => c.MiPerfil)
    },
    {
        path: 'publicacion/:id',
        loadComponent: () =>
        import('./paginas/pagina-publicacion/pagina-pub').then(c => c.PaginaPublicacionComponent)
    },
    {
    path: 'dashboard/usuarios',
    loadComponent: () => import('./paginas/dashboard/dash-usuarios/dash-usuarios').then(c => c.DashUsuariosComponent),
    canActivate: [adminGuard]
    },
    // {
    // path: 'dashboard/estadisticas',
    // loadComponent: () => import('./paginas/dashboard/dashboard-estadisticas/dash-estadisticas').then(c => c.DashboardEstadisticas),
    // canActivate: [adminGuard]
    // },

    { path: '', pathMatch: 'full', redirectTo: 'login' },
    { path: '**', redirectTo: 'login' }
]
