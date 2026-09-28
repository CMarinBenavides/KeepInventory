package com.cfmarin.keepinventory_backend.exception;

/**
 * Se lanza cuando la petición es válida pero rompe una regla de negocio,
 * por ejemplo: un administrador intentando eliminarse a sí mismo.
 * GlobalExceptionHandler la convierte en una respuesta HTTP 409.
 */
public class OperationNotAllowedException extends RuntimeException {

    public OperationNotAllowedException(String message) {
        super(message);
    }
}
