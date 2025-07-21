package com.backend.datadrop.controller;

import com.backend.datadrop.dto.UrlDto;
import com.backend.datadrop.model.Url;
import com.backend.datadrop.service.UrlService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/url")
public class UrlController {

    private final UrlService urlService;

    public UrlController(UrlService urlService) {
        this.urlService = urlService;
    }

    @GetMapping("")
    public ResponseEntity<?> getUrl() {
        return new ResponseEntity<>(urlService.getAll(), HttpStatus.OK);
    }

    @GetMapping("{id}")
    public ResponseEntity<?> getUrlById(@PathVariable Long id) {
        return new ResponseEntity<>(urlService.getById(id), HttpStatus.OK);
    }

    @PostMapping("")
    public ResponseEntity<?> createUrl(@RequestBody UrlDto urlDto) {
        Url url = new Url();
        url.setBaseUrl(urlDto.getUrl());
        url.setFile_type(urlDto.getFile_type());
        return new ResponseEntity<>(urlService.save(url), HttpStatus.CREATED);
    }
}
