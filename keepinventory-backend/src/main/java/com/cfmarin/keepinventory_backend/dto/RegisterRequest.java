package com.cfmarin.keepinventory_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Datos que envía el cliente para registrar un usuario (cuerpo JSON del POST).
 *
 * Es un "record": una clase inmutable que Java genera automáticamente con
 * constructor, getters (nombre(), username(), password()), equals, hashCode y toString.
 *
 * Las anotaciones de validación solo se aplican cuando el controlador
 * recibe este objeto con @Valid. Si alguna falla, Spring responde 400
 * sin llegar a ejecutar el servicio.
 *
 * No incluye el rol a propósito: el rol lo decide el servidor (USER por defecto)
 * para que nadie pueda registrarse como ADMIN desde un endpoint público.
 */
public record RegisterRequest(

        // @NotBlank: no puede ser null, vacío ("") ni solo espacios ("   ")
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        // @Size limita la longitud para evitar usernames absurdos
        @NotBlank(message = "El username es obligatorio")
        @Size(min = 3, max = 50, message = "El username debe tener entre 3 y 50 caracteres")
        String username,

        // max = 72 porque BCrypt ignora todo lo que pase de 72 bytes
        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
        String password
) {
}
