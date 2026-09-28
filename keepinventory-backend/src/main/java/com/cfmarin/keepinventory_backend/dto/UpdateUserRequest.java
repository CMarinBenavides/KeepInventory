package com.cfmarin.keepinventory_backend.dto;

import com.cfmarin.keepinventory_backend.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Datos para que un ADMIN edite un usuario (PUT /api/users/{id}).
 *
 * La contraseña es opcional: si viene null se conserva la actual.
 * @Size no se aplica a valores null, así que solo se valida cuando sí se envía.
 */
public record UpdateUserRequest(

        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        @NotBlank(message = "El username es obligatorio")
        @Size(min = 3, max = 50, message = "El username debe tener entre 3 y 50 caracteres")
        String username,

        @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
        String password,

        @NotNull(message = "El rol es obligatorio")
        Role role,

        // Boolean (objeto) y no boolean: así un JSON sin "active" falla la validación
        // en lugar de convertirse en false y desactivar al usuario por error
        @NotNull(message = "El estado es obligatorio")
        Boolean active
) {
}
