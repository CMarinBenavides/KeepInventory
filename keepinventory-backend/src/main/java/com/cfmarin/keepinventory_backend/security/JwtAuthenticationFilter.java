package com.cfmarin.keepinventory_backend.security;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro que autentica cada petición a partir del token JWT.
 *
 * OncePerRequestFilter garantiza que se ejecute una sola vez por petición.
 *
 * Flujo:
 *  1. Leer el header "Authorization: Bearer <token>".
 *  2. Si no hay token, seguir sin autenticar (las rutas públicas funcionan igual;
 *     las protegidas las rechazará Spring Security más adelante con 401).
 *  3. Si hay token: sacar el username, cargar el usuario de la BD y validar.
 *  4. Si es válido, guardar la autenticación en el SecurityContext.
 *     A partir de ahí Spring sabe quién hace la petición y qué rol tiene.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;

    // Es nuestro UserDetailsServiceImpl (busca el usuario por username en la BD)
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        // 1-2. Sin header o con otro esquema (ej. "Basic ..."): no hacemos nada
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Quitar el prefijo "Bearer " para quedarnos solo con el token
        String token = authHeader.substring(BEARER_PREFIX.length());

        try {
            // 3. Si el token está alterado o vencido, esto lanza JwtException
            String username = jwtService.extractUsername(token);

            // Solo autenticamos si aún no hay nadie autenticado en esta petición
            if (SecurityContextHolder.getContext().getAuthentication() == null) {

                // Se consulta la BD en cada petición: así, si el usuario se desactiva
                // o cambia de rol, el cambio aplica de inmediato aunque el token siga vigente
                UserDetails user = userDetailsService.loadUserByUsername(username);

                if (user.isEnabled() && jwtService.isTokenValid(token, user)) {
                    // 4. Objeto de autenticación: (usuario, credenciales, roles).
                    //    Las credenciales van en null porque ya se validaron con el token.
                    var authentication = new UsernamePasswordAuthenticationToken(
                            user, null, user.getAuthorities());

                    // Agrega detalles de la petición (IP, id de sesión) por si se necesitan
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (JwtException | IllegalArgumentException | UsernameNotFoundException e) {
            // Token inválido, vencido o de un usuario que ya no existe:
            // no autenticamos y dejamos que Spring Security responda 401 si la ruta es protegida
            SecurityContextHolder.clearContext();
        }

        // Siempre se continúa con la cadena de filtros
        filterChain.doFilter(request, response);
    }
}
