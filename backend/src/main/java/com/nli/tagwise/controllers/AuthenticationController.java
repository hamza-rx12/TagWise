package com.nli.tagwise.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nli.tagwise.custom.AlreadyVerifiedException;
import com.nli.tagwise.custom.TokenGenerationException;
import com.nli.tagwise.custom.UserNotFoundException;
import com.nli.tagwise.dto.CustomResponse;
import com.nli.tagwise.dto.LoginResponse;
import com.nli.tagwise.dto.SignInDto;
import com.nli.tagwise.dto.SignUpDto;
import com.nli.tagwise.dto.SignUpResponse;
import com.nli.tagwise.dto.VerifyUserDto;
import com.nli.tagwise.models.UserDetailsImpl;
import com.nli.tagwise.services.AuthenticationService;
import com.nli.tagwise.services.JwtService;

import jakarta.mail.MessagingException;

@RequestMapping("/api/auth")
@RestController
public class AuthenticationController {

    private final JwtService jwtService;
    private final AuthenticationService authenticationService;

    public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> register(@RequestBody SignUpDto signUpDto) {
        try {
            SignUpResponse registeredUser = authenticationService.signup(signUpDto);
            return ResponseEntity.ok(registeredUser);
        } catch (MessagingException e) {
            return ResponseEntity
                    .status(HttpStatus.FAILED_DEPENDENCY)
                    .body(new CustomResponse("Failed to send verification email!"));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new CustomResponse("Email already used!"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@RequestBody SignInDto loginUserDto) {
        try {
            UserDetailsImpl authenticatedUser = authenticationService.authenticate(loginUserDto);

            try {
                String jwtToken = jwtService.generateToken(authenticatedUser);
                LoginResponse loginResponse = new LoginResponse(jwtToken, jwtService.getExpirationTime());
                return ResponseEntity.ok(loginResponse);

            } catch (TokenGenerationException e) {
                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new CustomResponse("Token generation problem!"));
            }
        } catch (DisabledException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new CustomResponse("Account not verified. Please verify your account."));

        } catch (BadCredentialsException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new CustomResponse("Invalid credentials!"));

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new CustomResponse("Login Problem!"));
        }

    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyUser(@RequestBody VerifyUserDto verifyUserDto) {
        try {
            authenticationService.verifyUser(verifyUserDto);
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(new CustomResponse("Account verified successfully!"));
        } catch (AlreadyVerifiedException e) {
            return ResponseEntity
                    .status(HttpStatus.ALREADY_REPORTED)
                    .body(new CustomResponse("Account already Verified!"));
        } catch (UserNotFoundException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new CustomResponse("User Not found!"));
        }
    }

    @PostMapping("/resend")
    public ResponseEntity<?> resendVerificationCode(@RequestParam String email) {
        try {
            authenticationService.resendVerificationCode(email);
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(new CustomResponse("Verification code sent!"));

        } catch (MessagingException e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new CustomResponse("Failed to send verification email!"));
        }
    }

}
