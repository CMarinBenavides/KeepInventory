package com.cfmarin.keepinventory_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Contructor de seguridad de http
    /**
     * @param http
     * @return
     * @throws Exception
     */
    @Bean 
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // Este metodo es el que autoriza las peticiones http
        http.authorizeHttpRequests(request -> request.requestMatchers("/login").permitAll()).csrf(csrf -> csrf.disable());
        return http.build();
    }

    //clase que codifica la contraseña para que springboot security la reconozca
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
}
