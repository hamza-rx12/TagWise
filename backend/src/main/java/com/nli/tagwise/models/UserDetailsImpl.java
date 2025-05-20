package com.nli.tagwise.models;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
public class UserDetailsImpl implements UserDetails {
    private User user;
    private Collection<? extends GrantedAuthority> authorities;

    // ce constructeur sert pour la creation d'une liste des autorites en se basant sur le role de l'utilisateur 
    public UserDetailsImpl(User user) {
        this.user = user;
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()));

    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    // cette methode sert pour verifier si l'utilisateur est actif ou non
    @Override
    public boolean isEnabled() {
        return user.isEnabled();
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

}

// @Column(name = "verification_code")
// private String verificationCode;
// @Column(name = "verification_expiration")
// private LocalDateTime verificationCodeExpiresAt;
