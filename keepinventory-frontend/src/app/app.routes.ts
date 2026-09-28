import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/guards/auth.guard';

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
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
    title: 'Inicio | KeepInventory',
  },
  // Cualquier otra URL redirige al inicio (y el authGuard decide si va al login)
  { path: '**', redirectTo: '' },
];
