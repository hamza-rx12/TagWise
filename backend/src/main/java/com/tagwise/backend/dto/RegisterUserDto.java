package com.tagwise.backend.dto;

import com.tagwise.backend.models.Gender;
import com.tagwise.backend.models.Role;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterUserDto {
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private Gender gender;
    private Role role;
    private String email;


}