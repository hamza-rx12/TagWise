package com.nli.tagwise.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nli.tagwise.models.User;
import com.nli.tagwise.services.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RequestMapping("/api/users")
@RestController
public class UserController {

    private final UserService userService;

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

}
