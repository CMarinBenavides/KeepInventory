import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor HTTP: se ejecuta en TODAS las peticiones que hace HttpClient.
 *
 * 1. Agrega el header "Authorization: Bearer <token>" si hay sesión.
 * 2. Si el backend responde 401 en una ruta protegida (token vencido, alterado
 *    o usuario desactivado), cierra la sesión y manda al login.
 *
 * Es un interceptor "funcional" (una función, no una clase): la forma
 * recomendada en Angular moderno. Se registra en app.config.ts.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Solo se envía el token a NUESTRA API, nunca a otros dominios (evita filtrarlo)
  const isApiRequest = req.url.startsWith(environment.apiUrl);

  // Las peticiones son inmutables: para agregar un header hay que clonarlas
  const request =
    token && isApiRequest ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // En /auth/login un 401 significa "credenciales incorrectas": eso lo muestra
      // el formulario, no es motivo para cerrar sesión
      const isAuthEndpoint = req.url.startsWith(`${environment.apiUrl}/auth/`);

      if (error.status === 401 && isApiRequest && !isAuthEndpoint) {
        authService.logout('expirada');
      }

      // Se relanza el error para que quien hizo la petición también pueda manejarlo
      return throwError(() => error);
    }),
  );
};
