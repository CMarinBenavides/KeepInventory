package com.cfmarin.keepinventory_backend.controller;

import com.cfmarin.keepinventory_backend.dto.UserResponse;
import com.cfmarin.keepinventory_backend.entity.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints de usuarios. Todos requieren token (no están bajo /api/auth/**).
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

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
}
