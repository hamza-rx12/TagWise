package com.nli.tagwise.services;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.nli.tagwise.models.UserDetailsImpl;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

// cette classe s'occupe de la gestion des tokens JWT pour les operations d'authentification et d'autorisation

// cette classe sert pour la creation la validation et l'extraction des informations du token JWT
@Service
public class JwtService {

    //////////////////////////////////////////////////////////
    /////////////////// Params shit //////////////////////////
    //////////////////////////////////////////////////////////
    @Value("${jwt.secret-key}")
    private String secretKey;

    @Value("${jwt.expiration-time}")
    private Long expiration;

    ///////////////////////////////////////////////////////////
    ///////////////////// Mane Thing //////////////////////////
    ///////////////////////////////////////////////////////////
    /// 
    // cette methode sert pour extraire l'email du token JWT (claim = info)
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String generateToken(UserDetailsImpl userDetails) {
        Map<String, Object> claims = new HashMap<>();
        // Extracting role and adding it to claims
        claims.put("role", userDetails.getAuthorities()
                .stream()
                .map(auth -> auth.getAuthority())
                .findFirst()
                .orElse(null));
        claims.put("userId", userDetails.getUser().getId());
        claims.put("exp", System.currentTimeMillis() + expiration);

        return generateToken(claims, userDetails);

    }

    public boolean isTokenValid(String token, UserDetailsImpl userDetails) {
        final String username = extractEmail(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public long getExpirationTime() {
        return expiration;
    }

    ///////////////////////////////////////////////////////////
    ///////////////////// Tools //////////////////////////////
    ///////////////////////////////////////////////////////////

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetailsImpl userDetails) {
        return buildToken(extraClaims, userDetails, expiration);
    }

    public String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, Long expiration) {
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername()) /// fix this one later
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();

    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

}
