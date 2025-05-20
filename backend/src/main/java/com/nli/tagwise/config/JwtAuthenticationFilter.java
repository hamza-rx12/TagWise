package com.nli.tagwise.config;

import java.io.IOException;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import com.nli.tagwise.models.UserDetailsImpl;
import com.nli.tagwise.services.JwtService;
import com.nli.tagwise.services.UserDetailsServiceImpl;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
// cette classe sert pour intercepter les requetes http et verifier si l'utilisateur est authentifié
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final HandlerExceptionResolver handlerExceptionResolver;
    // service for JWT operations (like token generation, validation, etc.)
    private final JwtService jwtService;
    // service for loading user details from the database
    private final UserDetailsServiceImpl userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserDetailsServiceImpl userDetailsService,
            HandlerExceptionResolver handlerExceptionResolver) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.handlerExceptionResolver = handlerExceptionResolver;
    }

    // Implementation de la methode do filter le core de l'interception des requetes
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String jwt = authHeader.substring(7);
            final String userEmail = jwtService.extractEmail(jwt);

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication(); // Null
                                                                                                    // authentification
            // cette implementation sera executee si l'utilisateur n'est pas authentifié et l'email est extrait depuis le token
            if (userEmail != null && authentication == null) {
                UserDetailsImpl userDetails = (UserDetailsImpl) this.userDetailsService.loadUserByUsername(userEmail);

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
            }
            filterChain.doFilter(request, response);

        } catch (Exception exception) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            handlerExceptionResolver.resolveException(request, response, null, exception);
            return;
        }
    }

}
