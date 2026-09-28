package com.cfmarin.keepinventory_backend.controller;

import com.cfmarin.keepinventory_backend.dto.CreateUserRequest;
import com.cfmarin.keepinventory_backend.dto.UpdateUserRequest;
import com.cfmarin.keepinventory_backend.dto.UserResponse;
import com.cfmarin.keepinventory_backend.entity.User;
import com.cfmarin.keepinventory_backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Endpoints de usuarios. Todos requieren token (no están bajo /api/auth/**).
 *
 * /api/users/me lo puede usar cualquier usuario autenticado; el resto (CRUD)
 * solo un ADMIN. Esas reglas están en SecurityConfig.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * GET /api/users/me
     *
     * Devuelve el usuario dueño del token. Útil para que el frontend sepa
     * quién está logueado (por ejemplo, al recargar la página).
     *
     * @AuthenticationPrincipal inyecta el usuario que JwtAuthenticationFilter
     * guardó en el SecurityContext, sin tener que consultarlo de nuevo.
     */
    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal User user) {
        return UserResponse.from(user);
    }

    /** GET /api/users — lista de usuarios (ADMIN) */
    @GetMapping
    public List<UserResponse> findAll() {
        return userService.findAll();
    }

    /**
     * GET /api/users/{id} — un usuario (ADMIN)
     *
     * @PathVariable toma el {id} de la URL y lo convierte a Long.
     */
    @GetMapping("/{id}")
    public UserResponse findById(@PathVariable Long id) {
        return userService.findById(id);
    }

    /**
     * POST /api/users — crea un usuario con el rol indicado (ADMIN)
     *
     * Ejemplo de cuerpo:
     * { "nombre": "Ana", "username": "ana", "password": "secreta123", "role": "USER" }
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
        return userService.create(request);
    }

    /**
     * PUT /api/users/{id} — edita un usuario (ADMIN)
     *
     * "password" es opcional: si se omite (o va null) se conserva la actual.
     */
    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id,
                               @Valid @RequestBody UpdateUserRequest request,
                               @AuthenticationPrincipal User currentUser) {
        return userService.update(id, request, currentUser);
    }

    /**
     * DELETE /api/users/{id} — elimina un usuario (ADMIN)
     *
     * Responde 204 No Content: se borró y no hay nada que devolver.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        userService.delete(id, currentUser);
    }
}
