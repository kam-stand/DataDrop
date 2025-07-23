package com.backend.datadrop.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UrlDtoTest {

    @Test
    void testDefaultConstructorAndSetters() {
        UrlDto dto = new UrlDto();
        dto.setUrl("https://example.com");
        dto.setFile_type("pdf");

        assertEquals("https://example.com", dto.getUrl());
        assertEquals("pdf", dto.getFile_type());
    }

    @Test
    void testAllArgsConstructor() {
        UrlDto dto = new UrlDto("https://test.com", "csv");

        assertEquals("https://test.com", dto.getUrl());
        assertEquals("csv", dto.getFile_type());
    }
}
