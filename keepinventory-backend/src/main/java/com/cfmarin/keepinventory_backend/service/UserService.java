package com.cfmarin.keepinventory_backend.service;

import com.cfmarin.keepinventory_backend.dto.CreateUserRequest;
import com.cfmarin.keepinventory_backend.dto.UpdateUserRequest;
import com.cfmarin.keepinventory_backend.dto.UserResponse;
import com.cfmarin.keepinventory_backend.entity.User;
import com.cfmarin.keepinventory_backend.exception.OperationNotAllowedException;
import com.cfmarin.keepinventory_backend.exception.UserNotFoundException;
import com.cfmarin.keepinventory_backend.exception.UsernameAlreadyExistsException;
import com.cfmarin.keepinventory_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Lógica de negocio del CRUD de usuarios (solo para administradores).
 *
 * Quién puede llamar a estos métodos lo decide SecurityConfig (rol ADMIN);
 * aquí solo se aplican las reglas sobre los datos.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Lista todos los usuarios ordenados por id.
     * readOnly = true le indica a Hibernate que no habrá cambios, lo que ahorra trabajo.
     */
    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAll(Sort.by("id")).stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        return UserResponse.from(getUser(id));
    }

    /**
     * Crea un usuario con el rol que elija el administrador.
     */
    @Transactional
    public UserResponse create(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new UsernameAlreadyExistsException(request.username());
        }

        User user = User.builder()
                .nombre(request.nombre())
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .rol(request.role())
                .build();

        return UserResponse.from(userRepository.save(user));
    }

    /**
     * Edita un usuario existente.
     *
     * @param currentUser el administrador que hace la petición (dueño del token)
     */
    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request, User currentUser) {
        User user = getUser(id);
        boolean usernameChanged = !user.getUsername().equals(request.username());

        // Regla de seguridad: un admin no puede quitarse su propio acceso.
        // Cambiar su username también lo sacaría: su token lleva el username anterior.
        if (isSameUser(user, currentUser)
                && (request.role() != user.getRol() || !request.active() || usernameChanged)) {
            throw new OperationNotAllowedException(
                    "No puedes cambiar tu propio rol, estado ni username");
        }

        if (usernameChanged && userRepository.existsByUsername(request.username())) {
            throw new UsernameAlreadyExistsException(request.username());
        }

        user.setNombre(request.nombre());
        user.setUsername(request.username());
        user.setRol(request.role());
        user.setActive(request.active());

        // Contraseña opcional: solo se cambia si el administrador escribió una nueva
        if (request.password() != null) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }

        return UserResponse.from(userRepository.save(user));
    }

    /**
     * Elimina un usuario de forma definitiva.
     * Para quitar el acceso sin perder el registro es mejor desactivarlo (active = false).
     */
    @Transactional
    public void delete(Long id, User currentUser) {
        User user = getUser(id);

        if (isSameUser(user, currentUser)) {
            throw new OperationNotAllowedException("No puedes eliminar tu propio usuario");
        }

        userRepository.delete(user);
    }

    /** Busca el usuario o lanza 404 si no existe */
    private User getUser(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
    }

    private boolean isSameUser(User user, User currentUser) {
        return user.getId().equals(currentUser.getId());
    }
}
