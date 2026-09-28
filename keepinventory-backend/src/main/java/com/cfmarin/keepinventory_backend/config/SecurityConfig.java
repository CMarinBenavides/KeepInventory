package com.cfmarin.keepinventory_backend.config;

import com.cfmarin.keepinventory_backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Cadena de filtros de seguridad: define qué rutas son públicas y cuáles requieren login.
     *
     * Las reglas se evalúan en orden y gana la primera que coincide, por eso
     * anyRequest() va siempre al final.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Activa CORS usando el bean corsConfigurationSource() de abajo.
                // Debe ir en Spring Security (no solo en Spring MVC) para que las peticiones
                // "preflight" OPTIONS del navegador no sean bloqueadas por falta de token.
                .cors(Customizer.withDefaults())
                // CSRF protege aplicaciones con sesión por cookies. Con JWT en el header
                // no aplica, y si estuviera activo bloquearía los POST.
                .csrf(csrf -> csrf.disable())
                // STATELESS: el servidor no crea sesiones; cada petición se identifica
                // solo por su token JWT
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Registro y login deben ser públicos: el usuario aún no tiene cuenta/token
                        .requestMatchers("/api/auth/**").permitAll()
                        // Spring redirige internamente a /error cuando algo falla;
                        // si no es público, los errores (400, 409...) llegarían como 401
                        .requestMatchers("/error").permitAll()
                        // Cualquier otra ruta requiere un token válido
                        .anyRequest().authenticated()
                )
                // Sin token o con token inválido -> 401 Unauthorized ("no te identificaste").
                // Sin esto Spring respondería 403, que significa "no tienes permiso".
                .exceptionHandling(ex -> ex.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                // Nuestro filtro JWT se ejecuta antes del filtro estándar de usuario/contraseña,
                // para que cuando lleguen las reglas de autorización el usuario ya esté identificado
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /**
     * CORS: le dice al navegador qué frontends pueden llamar a esta API.
     *
     * El navegador bloquea las peticiones entre "orígenes" distintos
     * (protocolo + dominio + puerto). Angular (localhost:4200) y la API (localhost:8080)
     * son orígenes distintos, así que el backend debe autorizar al frontend explícitamente.
     *
     * Los orígenes permitidos vienen de app.cors.allowed-origins (application.properties),
     * separados por coma, para poder cambiarlos por entorno sin tocar código.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins}") List<String> allowedOrigins) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        // Authorization para el token JWT, Content-Type para enviar JSON
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        // Cuánto tiempo (segundos) puede el navegador recordar esta respuesta y evitar repetir el preflight
        config.setMaxAge(3600L);

        // Aplica esta configuración a todas las rutas de la API
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    /**
     * AuthenticationManager: el componente que verifica usuario y contraseña en el login.
     * Spring lo arma solo con nuestro UserDetailsService (UserDetailsServiceImpl)
     * y el PasswordEncoder de abajo; aquí solo lo exponemos como bean para inyectarlo en AuthService.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Codificador de contraseñas. BCrypt genera un hash con "salt" aleatorio,
     * así dos usuarios con la misma contraseña tienen hashes distintos.
     * Se usa al registrar (encode) y el AuthenticationManager lo usa al hacer login (matches).
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
