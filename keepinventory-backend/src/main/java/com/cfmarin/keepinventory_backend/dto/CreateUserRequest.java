package com.cfmarin.keepinventory_backend.dto;

import com.cfmarin.keepinventory_backend.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Datos para que un ADMIN cree un usuario (POST /api/users).
 *
 * A diferencia de RegisterRequest, aquí sí se recibe el rol: este endpoint
 * solo lo puede usar un administrador, así que puede crear otros ADMIN.
 */
public record CreateUserRequest(

        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        @NotBlank(message = "El username es obligatorio")
        @Size(min = 3, max = 50, message = "El username debe tener entre 3 y 50 caracteres")
        String username,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
        String password,

        // Jackson convierte el texto "ADMIN" / "USER" del JSON en el enum Role
        @NotNull(message = "El rol es obligatorio")
        Role role
) {
}
