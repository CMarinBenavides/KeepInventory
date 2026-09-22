package com.cfmarin.keepinventory_backend.dto;

import com.cfmarin.keepinventory_backend.entity.Role;

public record RegisterRequest(
        String nombre,
        String username,
        String password,
        Role role
) {
}