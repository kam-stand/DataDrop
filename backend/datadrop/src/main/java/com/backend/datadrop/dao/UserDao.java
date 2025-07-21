package com.backend.datadrop.dao;

import com.backend.datadrop.model.User;

import java.util.Optional;

public interface UserDao {
    Optional<User> findByGoogleId(String googleId);
    Optional<User> findByEmail(String email);
    User save(User user);
}
