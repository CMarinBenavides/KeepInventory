import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Guards: funciones que el router ejecuta ANTES de entrar a una ruta.
 * Si devuelven true se permite la navegación; si devuelven un UrlTree
 * (router.createUrlTree), el router redirige a esa ruta.
 *
 * Importante: los guards solo mejoran la experiencia de usuario. La seguridad
 * real está en el backend, que rechaza cualquier petición sin token válido.
 */

/** Rutas privadas: solo con sesión iniciada; si no, redirige a /login */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

/** Rutas de invitado (login): si ya hay sesión, no tiene sentido mostrarla */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn() ? router.createUrlTree(['/']) : true;
};
