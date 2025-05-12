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

    public AppConfig(
            // IUserRepo userRepo,
            UserDetailsServiceImpl userDetailsService,
            IUserRepo userRepo) {
        // this.userRepo = userRepo;
        this.userDetailsService = userDetailsService;
        this.userRepo = userRepo;
    }

    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder());
    }

    @Bean
    CommandLineRunner initAdmin() {
        return args -> {
            // Check if an admin already exists
            boolean adminExists = userRepo.findByEmail("oumaima@gmail.com").isPresent();
            if (!adminExists) {
                // Create default admin user
                // User admin = new User(
                // "Oumaima",
                // new BCryptPasswordEncoder().encode("open123"), // Default password: admin123
                // "Oumaima",
                // "Atmani",
                // Gender.FEMALE,
                // ADMIN_ROLE,
                // "oumaima@gmail.com"
                // );
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
        };
    }

    // @Bean
    // UserDetailsService userDetailsService() {
    // return username -> userRepo.findByEmail(username)
    // .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    // }
    // Java
    @Bean
    public org.springframework.security.core.userdetails.UserDetailsService userDetailsService() {
        return userDetailsService;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

}
