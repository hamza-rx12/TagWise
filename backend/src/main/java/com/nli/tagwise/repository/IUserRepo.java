package com.nli.tagwise.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nli.tagwise.models.User;

public interface IUserRepo extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String username);

}