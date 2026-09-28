/**
 * Modelos del CRUD de usuarios (reflejan los DTOs del backend).
 * El modelo User (respuesta) está en auth.models.ts.
 */

/** Roles posibles (enum Role.java) */
export type Role = 'ADMIN' | 'USER';

/** Opciones para el <select> de rol, con el texto que ve el administrador */
export const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'USER', label: 'Usuario' },
  { value: 'ADMIN', label: 'Administrador' },
];

/** Lo que se envía a POST /api/users (CreateUserRequest.java) */
export interface CreateUserRequest {
  nombre: string;
  username: string;
  password: string;
  role: Role;
}

/**
 * Lo que se envía a PUT /api/users/{id} (UpdateUserRequest.java).
 * password en null significa "no cambiar la contraseña".
 */
export interface UpdateUserRequest {
  nombre: string;
  username: string;
  password: string | null;
  role: Role;
  active: boolean;
}
