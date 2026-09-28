package com.cfmarin.keepinventory_backend.service;

import com.cfmarin.keepinventory_backend.dto.AuthResponse;
import com.cfmarin.keepinventory_backend.dto.LoginRequest;
import com.cfmarin.keepinventory_backend.dto.RegisterRequest;
import com.cfmarin.keepinventory_backend.entity.Role;
import com.cfmarin.keepinventory_backend.entity.User;
import com.cfmarin.keepinventory_backend.exception.UsernameAlreadyExistsException;
import com.cfmarin.keepinventory_backend.repository.UserRepository;
import com.cfmarin.keepinventory_backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Lógica de negocio de autenticación: registro e inicio de sesión.
 *
 * @Service lo registra como un bean de Spring para poder inyectarlo en el controlador.
 * @RequiredArgsConstructor (Lombok) genera un constructor con todos los campos "final",
 * y Spring lo usa para inyectar las dependencias (inyección por constructor).
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    // Acceso a la tabla "users"
    private final UserRepository userRepository;

    // Bean BCrypt definido en SecurityConfig; encripta las contraseñas
    private final PasswordEncoder passwordEncoder;

    // Verifica usuario + contraseña en el login (bean definido en SecurityConfig)
    private final AuthenticationManager authenticationManager;

    // Genera los tokens JWT
    private final JwtService jwtService;

    /**
     * Registra un usuario nuevo con rol USER y devuelve su token,
     * para que quede logueado sin tener que llamar a /login.
     *
     * @Transactional: si algo falla a mitad del método, se revierte todo lo
     * que se haya hecho en la base de datos (rollback).
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        // 1. Validar que el username no exista antes de intentar guardarlo
        if (userRepository.existsByUsername(request.username())) {
            throw new UsernameAlreadyExistsException(request.username());
        }

        // 2. Construir la entidad con el builder de Lombok
        User user = User.builder()
                .nombre(request.nombre())
                .username(request.username())
                // Nunca se guarda la contraseña en texto plano: se guarda su hash BCrypt
                .password(passwordEncoder.encode(request.password()))
                // El rol lo asigna el servidor, no el cliente
                .rol(Role.USER)
                // "active" queda en true por el @Builder.Default de la entidad
                .build();

        // 3. Guardar; save() devuelve la entidad con el id que generó la base de datos
        User saved = userRepository.save(user);

        // 4. Responder con los datos del usuario y su token
        return toAuthResponse(saved);
    }

    /**
     * Inicia sesión y devuelve un token.
     *
     * authenticationManager.authenticate(...) hace todo el trabajo:
     *  - busca el usuario con UserDetailsServiceImpl
     *  - compara la contraseña con BCrypt (passwordEncoder.matches)
     *  - revisa que la cuenta esté activa (isEnabled / isAccountNonLocked)
     * Si algo falla lanza una AuthenticationException (ej. BadCredentialsException),
     * que GlobalExceptionHandler convierte en 401.
     */
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));

        // Si llegamos aquí las credenciales son correctas.
        // getPrincipal() devuelve el UserDetails cargado, que es nuestra entidad User.
        User user = (User) authentication.getPrincipal();

        return toAuthResponse(user);
    }

    /**
     * Convierte la entidad en el DTO de respuesta con un token nuevo.
     * Se usa un DTO para no exponer la contraseña ni otros datos internos.
     */
    private AuthResponse toAuthResponse(User user) {
        return new AuthResponse(
                user.getId(),
                user.getNombre(),
                user.getUsername(),
                user.getRol().name(),
                jwtService.generateToken(user)
        );
    }
}
