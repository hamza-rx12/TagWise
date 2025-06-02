package com.nli.tagwise.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nli.tagwise.models.Role;
import com.nli.tagwise.models.User;

public interface IUserRepo extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String username);

    List<User> findByRole(Role role);

    List<User> findByRoleAndDeletedFalse(Role role);

    Long countByRoleAndDeletedFalse(Role roleUser);

    List<User> findTop3ByRoleAndDeletedFalseOrderByIdDesc(Role role);
}
