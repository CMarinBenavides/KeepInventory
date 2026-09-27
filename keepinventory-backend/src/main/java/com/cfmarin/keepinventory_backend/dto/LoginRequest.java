package com.cfmarin.keepinventory_backend.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Credenciales que envía el cliente para iniciar sesión.
 *
 * Solo se valida que no vengan vacías; si son correctas o no lo decide
 * el AuthenticationManager contra la base de datos.
 */
public record LoginRequest(

        @NotBlank(message = "El username es obligatorio")
        String username,

        @NotBlank(message = "La contraseña es obligatoria")
        String password
) {
}
