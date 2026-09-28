import { HttpErrorResponse } from '@angular/common/http';

import { ApiError } from '../models/auth.models';

/**
 * Traduce un error HTTP en un mensaje entendible para el usuario.
 * Se comparte entre todas las pantallas para que los mensajes sean consistentes.
 */
export function toErrorMessage(error: HttpErrorResponse): string {
  // status 0: la petición ni siquiera llegó (backend apagado, sin red o CORS)
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.';
  }

  // 403: hay sesión, pero el rol no tiene permiso para esta acción
  if (error.status === 403) {
    return 'No tienes permiso para realizar esta acción.';
  }

  // El backend responde con ProblemDetail; "detail" trae el mensaje (ej. 400, 401, 404, 409)
  const apiError = error.error as ApiError | null;
  return apiError?.detail ?? 'Ocurrió un error inesperado. Intenta de nuevo.';
}

/**
 * Errores de validación por campo que devuelve el backend en un 400,
 * ej. { password: 'La contraseña debe tener entre 8 y 72 caracteres' }.
 */
export function toFieldErrors(error: HttpErrorResponse): Record<string, string> {
  const apiError = error.error as ApiError | null;
  return error.status === 400 && apiError?.errors ? apiError.errors : {};
}
