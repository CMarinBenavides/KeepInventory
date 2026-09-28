/**
 * Punto de entrada de la aplicación: es el primer archivo que se ejecuta en el navegador.
 *
 * bootstrapApplication arranca Angular usando:
 *  - App: el componente raíz, que se dibuja en la etiqueta <app-root> de index.html.
 *  - appConfig: los "providers" globales (router, HttpClient, interceptores...).
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Si algo falla al arrancar (por ejemplo, un provider mal configurado), se muestra en la consola
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
