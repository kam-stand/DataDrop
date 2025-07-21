package com.backend.datadrop.dao.impl;

import com.backend.datadrop.dao.UserDao;
import com.backend.datadrop.model.User;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

@Repository
public class UserDaoImpl implements UserDao {

    private final JdbcTemplate jdbcTemplate;

    public UserDaoImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private RowMapper<User> userRowMapper = (rs, rowNum) -> {
        User user = new User();
        user.setId(rs.getInt("id"));
        user.setName(rs.getString("name"));
        user.setEmail(rs.getString("email"));
        user.setGoogleId(rs.getString("google_id"));
        return user;
    };

    @Override
    public Optional<User> findByGoogleId(String googleId) {
        String sql = "SELECT * FROM users WHERE google_id = ?";
        return jdbcTemplate.query(sql, userRowMapper, googleId).stream().findFirst();
    }

    @Override
    public Optional<User> findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        return jdbcTemplate.query(sql, userRowMapper, email).stream().findFirst();
    }

    @Override
    public User save(User user) {
        String sql = "INSERT INTO users (name, email, google_id) VALUES (?, ?, ?) RETURNING id";
        Integer id = jdbcTemplate.queryForObject(sql, Integer.class, user.getName(), user.getEmail(), user.getGoogleId());
        user.setId(id);
        return user;
    }
}
