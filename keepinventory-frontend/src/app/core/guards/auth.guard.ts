import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

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

/**
 * Rutas de administrador: solo con rol ADMIN; con otro rol redirige al inicio.
 *
 * Si se recargó la página, el usuario aún no está en memoria: se pide al backend
 * (GET /api/users/me) y se decide cuando llega la respuesta. Un guard puede
 * devolver un Observable: el router espera su valor antes de navegar.
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const home = router.createUrlTree(['/']);

  const user = authService.currentUser();
  if (user) {
    return user.role === 'ADMIN' ? true : home;
  }

  return authService.loadCurrentUser().pipe(
    map((loaded) => (loaded.role === 'ADMIN' ? true : home)),
    // Token inválido: el interceptor ya cerró la sesión; por si acaso, al login
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};
