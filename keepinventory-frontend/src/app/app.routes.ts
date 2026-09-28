import { Routes } from '@angular/router';

import { adminGuard, authGuard, guestGuard } from './core/guards/auth.guard';

/**
 * Rutas de la aplicación.
 *
 * loadComponent carga cada página de forma "perezosa" (lazy loading): su código
 * se descarga solo cuando el usuario navega a ella, así la carga inicial es más liviana.
 */
export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
    title: 'Iniciar sesión | KeepInventory',
  },
  {
    // Páginas privadas: comparten MainLayout (barra superior) y se dibujan en su <router-outlet>
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
        title: 'Inicio | KeepInventory',
      },
      {
        // CRUD de usuarios: solo administradores (el guard aplica a todas las rutas hijas)
        path: 'usuarios',
        canActivate: [adminGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/users/user-list/user-list').then((m) => m.UserList),
            title: 'Usuarios | KeepInventory',
          },
          {
            path: 'nuevo',
            loadComponent: () =>
              import('./features/users/user-form/user-form').then((m) => m.UserForm),
            title: 'Nuevo usuario | KeepInventory',
          },
          {
            // :id es un parámetro; llega al componente como input (withComponentInputBinding)
            path: ':id/editar',
            loadComponent: () =>
              import('./features/users/user-form/user-form').then((m) => m.UserForm),
            title: 'Editar usuario | KeepInventory',
          },
        ],
      },
    ],
  },
  // Cualquier otra URL redirige al inicio (y el authGuard decide si va al login)
  { path: '**', redirectTo: '' },
];
