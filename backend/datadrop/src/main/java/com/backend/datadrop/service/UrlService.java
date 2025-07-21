package com.backend.datadrop.service;

import com.backend.datadrop.dao.UrlDao;
import com.backend.datadrop.model.Url;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UrlService {

    private final UrlDao urlDao;

    public UrlService(UrlDao urlDao) {
        this.urlDao = urlDao;
    }

    public List<Url> getAll() {
        return urlDao.getAllUrls();
    }

    public Url getById(Long id) {
        return urlDao.getUrlById(id);
    }

    public Url save(Url url) {
        return urlDao.saveUrl(url);
    }
}
