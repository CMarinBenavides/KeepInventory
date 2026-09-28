package com.cfmarin.keepinventory_backend.exception;

/**
 * Se lanza cuando se busca un usuario por id y no existe.
 * GlobalExceptionHandler la convierte en una respuesta HTTP 404.
 */
public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(Long id) {
        super("No existe un usuario con id " + id);
    }
}
