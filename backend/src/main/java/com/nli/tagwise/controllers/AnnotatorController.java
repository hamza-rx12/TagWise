package com.nli.tagwise.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.nli.tagwise.dto.SignUpDto; // Reusing existing DTO
import com.nli.tagwise.models.Gender;
import com.nli.tagwise.models.Role;
import com.nli.tagwise.models.User;
import com.nli.tagwise.repository.IUserRepo;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/annotators")
@PreAuthorize("hasRole('ROLE_ADMIN')") // Only admins can access this controller
@RequiredArgsConstructor
public class AnnotatorController {

    private final IUserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    /**
     * Get count of annotators
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getAnnotatorCount() {
        Long count = userRepo.countByRoleAndDeletedFalse(Role.ROLE_USER);
        return ResponseEntity.ok(count);
    }

    /**
     * Get all annotators (users with ROLE_USER)
     */
    @GetMapping
    public ResponseEntity<List<User>> getAllAnnotators() {
        List<User> annotators = userRepo.findByRoleAndDeletedFalse(Role.ROLE_USER);
        return ResponseEntity.ok(annotators);
    }

    /**
     * Get a specific annotator by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getAnnotatorById(@PathVariable Long id) {
        return userRepo.findById(id)
                .filter(user -> user.getRole() == Role.ROLE_USER)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update an annotator's information
     */
    @PutMapping("/{id}")
    public ResponseEntity<User> updateAnnotator(
            @PathVariable Long id,
            @RequestBody SignUpDto updateDto) {

        return userRepo.findById(id)
                .filter(user -> user.getRole() == Role.ROLE_USER)
                .map(user -> {
                    // Update fields if provided
                    if (updateDto.getFirstName() != null) {
                        user.setFirstName(updateDto.getFirstName());
                    }

                    if (updateDto.getLastName() != null) {
                        user.setLastName(updateDto.getLastName());
                    }

                    if (updateDto.getGender() != null) {
                        try {
                            user.setGender(Gender.valueOf(updateDto.getGender()));
                        } catch (IllegalArgumentException e) {
                            throw new IllegalArgumentException("Invalid gender value");
                        }
                    }

                    // Update password if provided
                    if (updateDto.getPassword() != null && !updateDto.getPassword().isEmpty()) {
                        user.setPassword(passwordEncoder.encode(updateDto.getPassword()));
                    }

                    // Don't update email/role to maintain annotator status

                    return ResponseEntity.ok(userRepo.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete an annotator
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnnotator(@PathVariable Long id) {
        return userRepo.findById(id)
                .filter(user -> user.getRole() == Role.ROLE_USER)
                .map(user -> {
                    // Instead of deleting, mark as deleted
                    user.setDeleted(true);
                    userRepo.save(user);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Enable or disable an annotator's account
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateAnnotatorStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled) {

        return userRepo.findById(id)
                .filter(user -> user.getRole() == Role.ROLE_USER)
                .map(user -> {
                    user.setEnabled(enabled);
                    userRepo.save(user);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
