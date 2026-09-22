package com.cfmarin.keepinventory_backend.dto;

public record AuthResponse(
        Long id,
        String nombre,
        String username,
        String role,
        String token
) {
}
