package com.cfmarin.keepinventory_backend.exception;

/**
 * Se lanza cuando se intenta registrar un username que ya existe.
 *
 * Extiende RuntimeException (excepción "no verificada"), por eso no hace falta
 * declararla con "throws" en cada método ni envolverla en try/catch.
 * La captura GlobalExceptionHandler y la convierte en una respuesta HTTP 409.
 */
public class UsernameAlreadyExistsException extends RuntimeException {

    public UsernameAlreadyExistsException(String username) {
        super("El username '" + username + "' ya está en uso");
    }
}
