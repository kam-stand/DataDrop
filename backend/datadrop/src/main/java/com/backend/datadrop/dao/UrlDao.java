package com.backend.datadrop.dao;

import com.backend.datadrop.model.Url;

import java.util.List;

public interface UrlDao {
    List<Url> getAllUrls();
    Url getUrlById(long id);
    Url saveUrl(Url url);
}
