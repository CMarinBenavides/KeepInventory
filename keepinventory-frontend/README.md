# KeepInventory — Frontend

Aplicación web de KeepInventory, hecha con [Angular](https://angular.dev) 22.

La documentación general del proyecto (funcionalidades, arquitectura, API y despliegue) está en el [README principal](../README.md).

## Comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala las dependencias |
| `npm start` | Servidor de desarrollo en `http://localhost:4200` (se recarga al guardar) |
| `npm run build` | Compila para producción en `dist/keepinventory-frontend/browser` |
| `npm test` | Ejecuta las pruebas unitarias con Vitest |

El backend debe estar corriendo en `http://localhost:8080` (ver `src/environments/environment.ts`).

## Entornos

| Archivo | Se usa en | URL de la API |
|---|---|---|
| `src/environments/environment.ts` | `npm start` | `http://localhost:8080/api` |
| `src/environments/environment.prod.ts` | `npm run build` | `https://keepinventory.onrender.com/api` |

Angular reemplaza un archivo por el otro al compilar para producción (`fileReplacements` en `angular.json`).

## Despliegue

Cloudflare compila y publica el sitio automáticamente con cada push a `main`, usando la configuración de `wrangler.jsonc`.
