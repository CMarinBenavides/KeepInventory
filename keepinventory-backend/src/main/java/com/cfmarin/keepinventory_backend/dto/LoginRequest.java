package com.cfmarin.keepinventory_backend.dto;

public record LoginRequest(
        String username,
        String password
) {
}
