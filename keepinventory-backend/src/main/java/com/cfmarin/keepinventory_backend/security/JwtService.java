package com.cfmarin.keepinventory_backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * Genera y valida tokens JWT.
 *
 * Un JWT tiene 3 partes separadas por puntos: header.payload.firma
 *  - header:  algoritmo usado (HS256)
 *  - payload: los "claims" (datos): usuario, rol, fecha de emisión y de expiración
 *  - firma:   hash del header + payload con la clave secreta
 *
 * El payload NO está cifrado (cualquiera puede leerlo en Base64), así que nunca
 * se deben guardar datos sensibles en él. Lo que garantiza la firma es que nadie
 * lo modificó: si cambian un solo carácter, la firma deja de coincidir.
 */
@Service
public class JwtService {

    // Clave para firmar y verificar; se construye una sola vez al crear el bean
    private final SecretKey signingKey;

    // Tiempo de vida del token en milisegundos
    private final long expirationMs;

    /**
     * @Value inyecta valores de application.properties.
     * La clave viene en Base64: se decodifica a bytes y se convierte en una clave HMAC.
     * Keys.hmacShaKeyFor lanza error al arrancar si la clave es muy corta (< 256 bits),
     * así un secreto débil se detecta de inmediato.
     */
    public JwtService(@Value("${jwt.secret}") String secret,
                      @Value("${jwt.expiration}") long expirationMs) {
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.expirationMs = expirationMs;
    }

    /**
     * Crea un token firmado para el usuario.
     * El "subject" (sub) es el identificador principal del token: el username.
     */
    @SuppressWarnings("null")
    public String generateToken(UserDetails user) {
        Date now = new Date();
        return Jwts.builder()
                .subject(user.getUsername())
                // Claim propio con el rol, útil para que el frontend muestre u oculte opciones.
                // La autorización real del backend usa el rol de la base de datos, no este claim.
                .claim("role", user.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .findFirst()
                        .orElse(null))
                .issuedAt(now)                                    // iat: cuándo se emitió
                .expiration(new Date(now.getTime() + expirationMs)) // exp: cuándo vence
                .signWith(signingKey)                             // firma HS256 con la clave secreta
                .compact();                                       // arma el string final
    }

    /**
     * Devuelve el username guardado en el token.
     * Lanza JwtException si el token es inválido, fue alterado o está vencido.
     */
    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * El token es válido si pertenece al usuario indicado.
     * La firma y la expiración ya se verifican al parsear (en extractUsername).
     */
    public boolean isTokenValid(String token, UserDetails user) {
        try {
            return extractUsername(token).equals(user.getUsername());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Verifica la firma y la expiración y devuelve el payload.
     * Si algo no cuadra, JJWT lanza una excepción (ExpiredJwtException,
     * SignatureException, MalformedJwtException... todas heredan de JwtException).
     */
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
