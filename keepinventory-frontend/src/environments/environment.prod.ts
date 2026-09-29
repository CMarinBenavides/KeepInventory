/**
 * Configuración del entorno de PRODUCCIÓN.
 *
 * Al ejecutar "ng build" (configuración production), Angular reemplaza
 * environment.ts por este archivo (ver "fileReplacements" en angular.json).
 *
 * apiUrl apunta al backend desplegado en Render.
 */
export const environment = {
  apiUrl: 'https://keepinventory.onrender.com/api',
  // Minutos sin actividad (mouse, teclado, scroll, toque) antes de cerrar la sesión
  sessionIdleMinutes: 15,
};
