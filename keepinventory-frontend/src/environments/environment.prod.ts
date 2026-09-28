/**
 * Configuración del entorno de PRODUCCIÓN.
 *
 * Al ejecutar "ng build" (configuración production), Angular reemplaza
 * environment.ts por este archivo (ver "fileReplacements" en angular.json).
 *
 * Cambiar apiUrl por la URL pública que asigne Render al backend.
 */
export const environment = {
  apiUrl: 'https://keepinventory-api.onrender.com/api',
};
