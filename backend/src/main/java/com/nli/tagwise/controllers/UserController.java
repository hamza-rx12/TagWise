package com.nli.tagwise.controllers;

import com.nli.tagwise.models.Role;
import com.nli.tagwise.repository.IUserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.nli.tagwise.models.User;
import com.nli.tagwise.services.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.stream.Collectors;

@RequestMapping("/api/users")
@RestController
public class UserController {

    private final UserService userService;
    @Autowired
    private IUserRepo userRepository;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> postMethodName(@RequestBody User user) {
        User buff = userService.createUser(user);
        System.out.println("Created user " + buff);
        if (buff != null) {
            return ResponseEntity.status(201).body(buff);
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Could not create User!");
        }

    }
    @GetMapping("/annotators")
    public ResponseEntity<List<User>> getAnnotators() {
        List<User> annotators = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ROLE_USER)
                .collect(Collectors.toList());
        List<User> dtoList = annotators.stream().map(user -> {
            User dto = new User();
            dto.setId(user.getId());
            dto.setFirstName(user.getFirstName());
            dto.setLastName(user.getLastName());
            dto.setEmail(user.getEmail());
            dto.setRole(user.getRole());
            dto.setGender(user.getGender());
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }


}
