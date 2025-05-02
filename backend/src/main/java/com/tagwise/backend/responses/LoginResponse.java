package com.tagwise.backend.responses;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {
    private String token;
    private long expiresIn;

    public LoginResponse(String token, long expiresIn) {
        this.token = token;
        this.expiresIn = expiresIn;
    }
    @Override
    public String toString() {
        return "LoginResponse{token='" + token + "', expiresIn=" + expiresIn + "}";
    }
}