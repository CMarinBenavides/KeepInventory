/**
 * Modelos que reflejan los DTOs del backend.
 *
 * Son solo interfaces de TypeScript: no generan código en el navegador,
 * sirven para que el editor autocomplete y avise si usamos un campo que no existe.
 */

/** Lo que se envía a POST /api/auth/login (LoginRequest.java) */
export interface LoginRequest {
  username: string;
  password: string;
}

/** Lo que responde /api/auth/login y /api/auth/register (AuthResponse.java) */
export interface AuthResponse {
  id: number;
  nombre: string;
  username: string;
  role: string;
  token: string;
}

/** Lo que responde GET /api/users/me (UserResponse.java) */
export interface User {
  id: number;
  nombre: string;
  username: string;
  role: string;
  active: boolean;
}

/**
 * Formato de error que devuelve el backend (ProblemDetail, RFC 7807),
 * generado por GlobalExceptionHandler.
 */
export interface ApiError {
  status: number;
  title: string;
  detail: string;
  errors?: Record<string, string>;
}
