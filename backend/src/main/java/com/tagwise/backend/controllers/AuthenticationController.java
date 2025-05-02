package com.tagwise.backend.controllers;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.tagwise.backend.dto.LoginUserDto;
import com.tagwise.backend.dto.RegisterUserDto;
import com.tagwise.backend.dto.VerifyUserDto;
import com.tagwise.backend.models.User;
import com.tagwise.backend.responses.LoginResponse;
import com.tagwise.backend.services.AuthenticationService;
import com.tagwise.backend.services.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RequestMapping("/auth")
@RestController
@CrossOrigin(origins = {"http://localhost:5173", "https://app-backend.com"})
public class AuthenticationController {
    private final JwtService jwtService;

    private final AuthenticationService authenticationService;

    public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> register(@RequestBody RegisterUserDto registerUserDto) {
        try {
            User registeredUser = authenticationService.signup(registerUserDto);
            // Inclure le code de vérification dans la réponse
            return ResponseEntity.ok(Map.of(
                "message", "User registered successfully. Please verify your email.",
                "verificationCode", registeredUser.getVerificationCode()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticate(@RequestBody LoginUserDto loginUserDto) {
        User authenticatedUser = authenticationService.authenticate(loginUserDto);
        System.out.println("Authenticated User: " + authenticatedUser);
        String jwtToken = jwtService.generateToken(authenticatedUser);
        System.out.println("JWT Token: " + jwtToken);
        LoginResponse loginResponse = new LoginResponse(jwtToken, jwtService.getExpirationTime());
        System.out.println("Login Response: " + loginResponse);
        // Vérifier la sérialisation manuellement
        ObjectMapper mapper = new ObjectMapper();
        try {
            System.out.println("JSON Response: " + mapper.writeValueAsString(loginResponse));
        } catch (Exception e) {
            System.out.println("Serialization Error: " + e.getMessage());
        }
        return ResponseEntity.ok(loginResponse);
    }



    @PostMapping("/verify")
    public ResponseEntity<?> verifyUser(@RequestBody VerifyUserDto verifyUserDto) {
        try {
            authenticationService.verifyUser(verifyUserDto);
            return ResponseEntity.ok("Account verified successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/resend")
    public ResponseEntity<?> resendVerificationCode(@RequestParam String email) {
        try {
            authenticationService.resendVerificationCode(email);
            return ResponseEntity.ok("Verification code sent");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}