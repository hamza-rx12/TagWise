package com.tagwise.backend.Controller;

import com.tagwise.backend.model.Role;
import com.tagwise.backend.model.User;
import com.tagwise.backend.model.Gender;
import com.tagwise.backend.repo.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAllUsers(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        if (!"ADMIN_ROLE".equals(role)) {
            return ResponseEntity.status(403).body("Access denied: Admin role required");
        }
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody User user, HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        if (!"ADMIN_ROLE".equals(role)) {
            return ResponseEntity.status(403).body("Access denied: Admin role required");
        }
        // Validate gender
        try {
            Gender validatedGender = Gender.valueOf(user.getGender().name().toUpperCase());
            user.setGender(validatedGender);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid gender value. Must be one of: " +
                    Arrays.toString(Gender.values()));
        }
        user.setPassword(BCrypt.hashpw(user.getPassword(), BCrypt.gensalt()));
        user.setRole(Role.ANNOTATOR_ROLE);
        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        if (!"ADMIN_ROLE".equals(role)) {
            return ResponseEntity.status(403).body("Access denied: Admin role required");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
        return ResponseEntity.ok().build();
    }
}