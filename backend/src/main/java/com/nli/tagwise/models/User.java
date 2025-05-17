package com.nli.tagwise.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String firstName;
    private String lastName;
    @Email
    @Column(unique = true)
    private String email;
    @Enumerated(EnumType.STRING)
    private Role role;
    @Enumerated(EnumType.STRING)
    private Gender gender;
    @NotNull
    private String password;

    private Boolean enabled;

    @Column(nullable = true)
    private Double spamScore; // For spam detection (0 to 1)

    @Column(nullable = true)
    private Double qualityMetric; // For quality assessment (0 to 1)

    public Boolean isEnabled() {
        return enabled;
    }
}