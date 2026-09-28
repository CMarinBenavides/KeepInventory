import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

/**
 * Configuración global de la aplicación (se usa en main.ts al arrancar).
 *
 * Los "providers" registran servicios y funcionalidades disponibles en toda la app.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Captura errores no manejados del navegador y los reporta a Angular
    provideBrowserGlobalErrorListeners(),
    // Activa el router con las rutas definidas en app.routes.ts.
    // withComponentInputBinding: los parámetros de la URL (ej. :id) llegan como input() al componente
    provideRouter(routes, withComponentInputBinding()),
    // Habilita HttpClient y registra el interceptor que agrega el token JWT
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
