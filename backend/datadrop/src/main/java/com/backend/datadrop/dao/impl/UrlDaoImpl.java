package com.backend.datadrop.dao.impl;

import com.backend.datadrop.dao.UrlDao;
import com.backend.datadrop.model.Url;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class UrlDaoImpl implements UrlDao {

    private final JdbcTemplate jdbcTemplate;

    public UrlDaoImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // RowMapper for Url
    private final RowMapper<Url> urlRowMapper = new RowMapper<>() {
        @Override
        public Url mapRow(ResultSet rs, int rowNum) throws SQLException {
            Url url = new Url();
            url.setId(rs.getLong("id"));
            url.setBaseUrl(rs.getString("base_url"));
            url.setFile_type(rs.getString("file_type"));
            return url;
        }
    };

    @Override
    public List<Url> getAllUrls() {
        String sql = "SELECT * FROM base_url";
        return jdbcTemplate.query(sql, urlRowMapper);
    }

    @Override
    public Url getUrlById(long id) {
        String sql = "SELECT * FROM base_url WHERE id = ?";
        return jdbcTemplate.queryForObject(sql, urlRowMapper, id);
    }

    @Override
    public Url saveUrl(Url url) {
        String sql = "INSERT INTO base_url (base_url, file_type) VALUES (?, ?) RETURNING id";
        Long id = jdbcTemplate.queryForObject(sql, Long.class, url.getBaseUrl(), url.getFile_type());
        url.setId(id);
        return url;
    }
}
