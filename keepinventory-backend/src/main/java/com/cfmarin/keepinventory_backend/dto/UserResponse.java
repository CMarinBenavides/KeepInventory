package com.cfmarin.keepinventory_backend.dto;

import com.cfmarin.keepinventory_backend.entity.User;

/**
 * Datos públicos de un usuario (sin contraseña ni token).
 */
public record UserResponse(
        Long id,
        String nombre,
        String username,
        String role,
        boolean active
) {

    /**
     * Método de fábrica: convierte la entidad en DTO en un solo lugar,
     * para no repetir este mapeo en cada controlador.
     */
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getNombre(),
                user.getUsername(),
                user.getRol().name(),
                user.isActive()
        );
    }
}
