package com.cfmarin.keepinventory_backend.controller;

import com.cfmarin.keepinventory_backend.dto.AuthResponse;
import com.cfmarin.keepinventory_backend.dto.LoginRequest;
import com.cfmarin.keepinventory_backend.dto.RegisterRequest;
import com.cfmarin.keepinventory_backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints de autenticación.
 *
 * @RestController: cada método devuelve datos (JSON), no vistas HTML.
 * @RequestMapping: prefijo común para todas las rutas de esta clase.
 *
 * El controlador no tiene lógica de negocio: recibe la petición, delega en
 * AuthService y devuelve la respuesta.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/register
     *
     * @RequestBody: convierte el JSON del cuerpo en un RegisterRequest.
     * @Valid: ejecuta las validaciones del DTO (@NotBlank, @Size); si fallan,
     *         Spring lanza MethodArgumentNotValidException y no entra al método.
     * @ResponseStatus(CREATED): responde 201 en lugar de 200, porque se creó un recurso.
     *
     * Ejemplo de cuerpo:
     * { "nombre": "Cristian", "username": "cristian", "password": "secreta123" }
     */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    /**
     * POST /api/auth/login
     *
     * Responde 200 con el token si las credenciales son correctas, o 401 si no.
     * El cliente debe guardar el token y enviarlo en las siguientes peticiones:
     *   Authorization: Bearer <token>
     *
     * Ejemplo de cuerpo:
     * { "username": "cristian", "password": "secreta123" }
     */
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
