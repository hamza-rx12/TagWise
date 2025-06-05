package com.nli.tagwise.config;

import org.springframework.boot.CommandLineRunner;
// import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
// import org.springframework.security.core.userdetails.UserDetailsService;
// import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.nli.tagwise.models.Gender;
import com.nli.tagwise.models.Role;
import com.nli.tagwise.models.User;
import com.nli.tagwise.repository.IUserRepo;
// import com.nli.tagwise.repository.IUserRepo;
import com.nli.tagwise.services.UserDetailsServiceImpl;

@Configuration
public class AppConfig {

    // private final IUserRepo userRepo;

    private final UserDetailsServiceImpl userDetailsService;
    private final IUserRepo userRepo;

    // inhjection des dépendances
    public AppConfig(
            // IUserRepo userRepo,
            UserDetailsServiceImpl userDetailsService,
            IUserRepo userRepo) {
        // this.userRepo = userRepo;
        this.userDetailsService = userDetailsService;
        this.userRepo = userRepo;
    }

    // cette classe sert pour configuration de la securite de l'application
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder());
    }

    // initialisation de l'utilisateur admin lors du demarage de l'application
    @Bean
    CommandLineRunner initAdmin() {
        return args -> {
            // Check if an admin already exists
            boolean adminExists = userRepo.findByEmail("oumaima@gmail.com").isPresent();
            boolean userExists = userRepo.findByEmail("hamza@gmail.com").isPresent();
            if (!adminExists) {
                User admin = new User();

                admin.setFirstName("Oumaima");
                admin.setLastName("OT");
                admin.setGender(Gender.FEMALE);
                admin.setRole(Role.ROLE_ADMIN);
                admin.setEmail("oumaima@gmail.com");
                admin.setPassword(new BCryptPasswordEncoder().encode("password"));
                admin.setEnabled(true); // Enable the admin account
                userRepo.save(admin);
                System.out.println("Admin user created with email: oumaima@gmail.com");

            } else {
                System.out.println("Admin user already exists.");
            }
            if (!userExists) {
                User user = new User();

                user.setFirstName("hamza");
                user.setLastName("al");
                user.setGender(Gender.MALE);
                user.setRole(Role.ROLE_USER);
                user.setEmail("hamza@gmail.com");
                user.setPassword(new BCryptPasswordEncoder().encode("password"));
                user.setEnabled(true); // Enable the admin account
                userRepo.save(user);
                System.out.println("Annotator user created with email: hamza@gmail.com");

            } else {
                System.out.println("Normal user already exists.");
            }
        };
    }

    // @Bean
    // UserDetailsService userDetailsService() {
    // return username -> userRepo.findByEmail(username)
    // .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    // }
    // Java
    // setting up the configurations needed for spring security
    @Bean
    public org.springframework.security.core.userdetails.UserDetailsService userDetailsService() {
        return userDetailsService;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // se bean sert pour la gestion des requetes d'authentification
    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // se bean sert pour la validation des coordonnees des utilisateurs
    @Bean
    AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

}
