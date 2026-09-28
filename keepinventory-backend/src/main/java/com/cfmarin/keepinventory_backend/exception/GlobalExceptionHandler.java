package com.cfmarin.keepinventory_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Manejo centralizado de errores para todos los controladores.
 *
 * @RestControllerAdvice intercepta las excepciones que salen de cualquier
 * @RestController y permite devolver una respuesta HTTP controlada en lugar
 * de un 500 genérico.
 *
 * Las respuestas usan ProblemDetail (estándar RFC 7807), por ejemplo:
 * { "status": 409, "title": "Username duplicado", "detail": "El username 'x' ya está en uso" }
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Username ya registrado -> 409 Conflict
     * (la petición es válida, pero choca con el estado actual de los datos).
     */
    @ExceptionHandler(UsernameAlreadyExistsException.class)
    public ProblemDetail handleUsernameAlreadyExists(UsernameAlreadyExistsException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problem.setTitle("Username duplicado");
        return problem;
    }

    /**
     * Login fallido -> 401 Unauthorized.
     *
     * AuthenticationException es la clase padre de BadCredentialsException (contraseña
     * incorrecta o usuario inexistente), DisabledException (cuenta inactiva), etc.
     * El mensaje es genérico a propósito: no revela si el username existe o no,
     * para que nadie pueda averiguar qué usuarios hay registrados.
     */
    @ExceptionHandler(AuthenticationException.class)
    public ProblemDetail handleAuthentication(AuthenticationException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.UNAUTHORIZED, "Usuario o contraseña incorrectos");
        problem.setTitle("Autenticación fallida");
        return problem;
    }

    /**
     * Fallo en las validaciones de @Valid -> 400 Bad Request.
     * Devuelve un mapa campo -> mensaje para que el frontend sepa qué corregir, ej:
     * "errors": { "password": "La contraseña debe tener entre 8 y 72 caracteres" }
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        // LinkedHashMap conserva el orden en que se reportan los errores
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                // putIfAbsent: si un campo tiene varios errores, se queda con el primero
                .forEach(error -> errors.putIfAbsent(error.getField(), error.getDefaultMessage()));

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "Uno o más campos no son válidos");
        problem.setTitle("Datos inválidos");
        // setProperty agrega campos extra al JSON de respuesta
        problem.setProperty("errors", errors);
        return problem;
    }
}
