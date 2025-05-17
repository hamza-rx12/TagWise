package com.nli.tagwise.services;

import com.nli.tagwise.dto.SignUpDto;
import com.nli.tagwise.models.Gender;
import com.nli.tagwise.models.Role;
import com.nli.tagwise.models.User;
import com.nli.tagwise.repository.IUserRepo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class AnnotatorService {
    private final IUserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    public AnnotatorService(IUserRepo userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public User addAnnotator(SignUpDto dto) {
        User annotator = new User();
        annotator.setFirstName(dto.getFirstName());
        annotator.setLastName(dto.getLastName());
        annotator.setEmail(dto.getEmail());
        annotator.setRole(Role.ROLE_USER); // Annotators are ROLE_USER
        annotator.setGender(Enum.valueOf(Gender.class, dto.getGender()));
        annotator.setPassword(passwordEncoder.encode(dto.getPassword()));
        annotator.setEnabled(true); // Auto-enabled for admin-created annotators
        return userRepo.save(annotator);
    }

    public User validateUser(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getRole().equals("ROLE_USER")) {
            throw new RuntimeException("Only ROLE_USER can be validated as annotator");
        }
        user.setEnabled(true);
        return userRepo.save(user);
    }
    public List<User> listAnnotators() {
        return userRepo.findAll().stream()
                .filter(user -> user.getRole() == Role.ROLE_USER)
                .collect(Collectors.toList());
    }

    public void detectSpam(Long annotatorId) {
        User annotator = userRepo.findById(annotatorId)
                .orElseThrow(() -> new IllegalArgumentException("Annotator not found"));
        // Example: Random score for demo (replace with real logic)
        annotator.setSpamScore(new Random().nextDouble());
        userRepo.save(annotator);
    }

    // Basic quality metric: Based on annotation consistency (placeholder)
    public void calculateQualityMetric(Long annotatorId) {
        User annotator = userRepo.findById(annotatorId)
                .orElseThrow(() -> new IllegalArgumentException("Annotator not found"));
        // Example: Random score for demo (replace with real logic)
        annotator.setQualityMetric(new Random().nextDouble());
        userRepo.save(annotator);
    }
}