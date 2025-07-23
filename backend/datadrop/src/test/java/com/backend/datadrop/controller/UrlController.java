package com.backend.datadrop.controller;

import com.backend.datadrop.dto.UrlDto;
import com.backend.datadrop.model.Url;
import com.backend.datadrop.service.UrlService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UrlController.class)
class UrlControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UrlService urlService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetAllBaseUrls() throws Exception {
        // Arrange (simulate DB values)
        Url url1 = new Url();
        url1.setId(1L);
        url1.setBaseUrl("https://filesamples.com/");
        url1.setFile_type("txt");

        Url url2 = new Url();
        url2.setId(2L);
        url2.setBaseUrl("https://example.com");
        url2.setFile_type("csv");

        Url url3 = new Url();
        url3.setId(3L);
        url3.setBaseUrl("https://github.com/kam-stand/DataDrop");
        url3.setFile_type("pdf");

        List<Url> urls = Arrays.asList(url1, url2, url3);

        Mockito.when(urlService.getAll()).thenReturn(urls);

        // Act & Assert
        mockMvc.perform(get("/api/v1/url"))
                .andExpect(status().isOk()) // Check status
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].baseUrl").value("https://filesamples.com/"))
                .andExpect(jsonPath("$[1].baseUrl").value("https://example.com"))
                .andExpect(jsonPath("$[2].baseUrl").value("https://github.com/kam-stand/DataDrop"));
    }

    @Test
    void testGetBaseUrlById3() throws Exception {
        // Arrange (simulate DB value for id=3)
        Url url = new Url();
        url.setId(3L);
        url.setBaseUrl("https://github.com/kam-stand/DataDrop");
        url.setFile_type("pdf");

        Mockito.when(urlService.getById(3L)).thenReturn(url);

        // Act & Assert
        mockMvc.perform(get("/api/v1/url/3"))
                .andExpect(status().isOk()) // Check status
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.file_type").value("pdf")); // Verify file type
    }

    @Test
    void testCreateNewBaseUrl() throws Exception {
        // Arrange (new UrlDto to create)
        UrlDto dto = new UrlDto("https://randomsite.com", "docx");
        Url savedUrl = new Url();
        savedUrl.setId(4L);
        savedUrl.setBaseUrl(dto.getUrl());
        savedUrl.setFile_type(dto.getFile_type());

        Mockito.when(urlService.save(Mockito.any(Url.class))).thenReturn(savedUrl);

        // Act & Assert
        mockMvc.perform(post("/api/v1/url")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated()) // Check status
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.baseUrl").value("https://randomsite.com"))
                .andExpect(jsonPath("$.file_type").value("docx"));
    }
}
