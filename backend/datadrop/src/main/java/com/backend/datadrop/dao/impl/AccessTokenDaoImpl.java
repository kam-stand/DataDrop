package com.backend.datadrop.dao.impl;

import com.backend.datadrop.dao.AccessTokenDao;
import com.backend.datadrop.model.AccessToken;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AccessTokenDaoImpl implements AccessTokenDao {

    private final JdbcTemplate jdbcTemplate;

    public AccessTokenDaoImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void save(AccessToken token) {
        String sql = "INSERT INTO access_tokens (user_id, access_token, refresh_token, expires_in) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql, token.getUserId(), token.getAccessToken(), token.getRefreshToken(), token.getExpiresIn());
    }
}
