package com.nli.tagwise.services;

import java.util.Optional;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.nli.tagwise.custom.AlreadyVerifiedException;
import com.nli.tagwise.custom.InvalidVerificationException;
import com.nli.tagwise.custom.UserNotFoundException;
import com.nli.tagwise.dto.SignInDto;
import com.nli.tagwise.dto.SignUpDto;
import com.nli.tagwise.dto.SignUpResponse;
import com.nli.tagwise.dto.VerifyUserDto;
import com.nli.tagwise.models.Gender;
import com.nli.tagwise.models.Role;
import com.nli.tagwise.models.User;
import com.nli.tagwise.models.UserDetailsImpl;
import com.nli.tagwise.repository.IUserRepo;

import jakarta.mail.MessagingException;

@Service
public class AuthenticationService {
    private final IUserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final RedisVerificationService redisVerificationService;

    public AuthenticationService(
            IUserRepo userRepo,
            AuthenticationManager authenticationManager,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            RedisVerificationService redisVerificationService) {
        this.authenticationManager = authenticationManager;
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.redisVerificationService = redisVerificationService;
    }

    public SignUpResponse signup(SignUpDto input) throws MessagingException {
        User user = new User();
        user.setFirstName(input.getFirstName());
        user.setLastName(input.getLastName());
        user.setEmail(input.getEmail());
        user.setRole(Role.ROLE_USER);
        user.setGender(Enum.valueOf(Gender.class, input.getGender()));
        user.setPassword(passwordEncoder.encode(input.getPassword()));
        user.setEnabled(false);
        User tmp = userRepo.save(user);
        String code = redisVerificationService.generateAndStoreCode(tmp.getId());
        // sendVerificationEmail(user);
        return new SignUpResponse(tmp, code);
    }

    public UserDetailsImpl authenticate(SignInDto input) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        input.getEmail(),
                        input.getPassword()));

        User user = userRepo.findByEmail(input.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        return new UserDetailsImpl(user);
    }

    public void verifyUser(VerifyUserDto input) {
        Optional<User> optionalUser = userRepo.findByEmail(input.getEmail());
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (redisVerificationService.isCodeValid(user.getId(), input.getVerificationCode())) {
                user.setEnabled(true);
                userRepo.save(user);
            } else {
                throw new InvalidVerificationException("Invalid verification code");
            }
        } else {
            throw new UserNotFoundException("User not found");
        }
    }

    public void resendVerificationCode(String email) throws MessagingException {
        Optional<User> optionalUser = userRepo.findByEmail(email);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (user.isEnabled()) {
                throw new AlreadyVerifiedException("Account is already verified");
            }
            redisVerificationService.generateAndStoreCode(user.getId());
            // sendVerificationEmail(user);
            userRepo.save(user);
        } else {
            throw new UserNotFoundException("User not found");
        }
    }

    private void sendVerificationEmail(User user) throws MessagingException {
        String subject = "Account Verification";
        String verificationCode = "VERIFICATION CODE " + redisVerificationService.getCode(user.getId());
        String htmlMessage = "<html>"
                + "<body style=\"font-family: Arial, sans-serif;\">"
                + "<div style=\"background-color: #f5f5f5; padding: 20px;\">"
                + "<h2 style=\"color: #333;\">Welcome to our app!</h2>"
                + "<p style=\"font-size: 16px;\">Please enter the verification code below to continue:</p>"
                + "<div style=\"background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);\">"
                + "<h3 style=\"color: #333;\">Verification Code:</h3>"
                + "<p style=\"font-size: 18px; font-weight: bold; color: #007bff;\">" + verificationCode + "</p>"
                + "</div>"
                + "</div>"
                + "</body>"
                + "</html>";

        // try {
        emailService.sendVerificationEmail(user.getEmail(), subject, htmlMessage);
        // } catch (MessagingException e) {
        // // Handle email sending exception
        // e.printStackTrace();
        // }
    }

    // private String generateVerificationCode() {
    // Random random = new Random();
    // int code = random.nextInt(900000) + 100000;
    // return String.valueOf(code);
    // }

}
