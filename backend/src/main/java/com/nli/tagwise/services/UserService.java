package com.nli.tagwise.services;

import org.springframework.stereotype.Service;

import com.nli.tagwise.models.User;
import com.nli.tagwise.repository.IUserRepo;

@Service
public class UserService {

    private final IUserRepo userRepo;

    public UserService(IUserRepo userRepo) {
        this.userRepo = userRepo;

    }

    public User createUser(User user) {
        System.out.println("creating the user");
        if (user != null) {
            // try {
            User buff = userRepo.save(user);
            System.out.println("User Created:" + buff);
            return buff;
            // } catch (Exception e) {
            // System.out.println("Problem Creating User:" + user);
            // e.printStackTrace();
            // }
        } else {
            throw new IllegalArgumentException("User cannot be null");
        }
    }

}
