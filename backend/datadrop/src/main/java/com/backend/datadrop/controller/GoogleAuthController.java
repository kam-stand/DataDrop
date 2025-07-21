package com.backend.datadrop.controller;

import com.backend.datadrop.dto.AuthResponse;
import com.backend.datadrop.dto.UserDto;
import com.backend.datadrop.service.GoogleAuthService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth/google")
public class GoogleAuthController {
    @Value("${google.client.id}")
    private String clientId;

    @Value("${google.client.secret}")
    private String clientSecret;

    @Value("${google.redirect.uri}")
    private String redirectUri;

    @Value("${google.scope}")
    private String scope;

    @Value("${google.auth.uri}")
    private String authUri;

    @Value("${google.token.uri}")
    private String tokenUri;

    private final GoogleAuthService googleAuthService;
    public GoogleAuthController(GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
    }
    @GetMapping("")
    public ResponseEntity<?> GoogleSignIn() {
        String state = UUID.randomUUID().toString();
        String url = authUri +
                "?client_id=" + clientId +
                "&redirect_uri=" + redirectUri +
                "&response_type=code" +
                "&scope=" + scope +
                "&state=" + state; // Random string for security
        HttpHeaders headers = new HttpHeaders();
        headers.add("location", url);
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    @GetMapping("/oauth2callback")
    public ResponseEntity<?> oauth2callback(@RequestParam("code") String code, HttpServletResponse response) throws Exception {

        // 1. Exchange code for tokens
        String requestBody = "code=" + code
                + "&client_id=" + clientId
                + "&client_secret=" + clientSecret
                + "&redirect_uri=" + redirectUri
                + "&grant_type=authorization_code";

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(tokenUri))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> tokenResponse = client.send(request, HttpResponse.BodyHandlers.ofString());

        // 2. Parse token response
        ObjectMapper mapper = new ObjectMapper();
        JsonNode jsonNode = mapper.readTree(tokenResponse.body());

        String accessToken = jsonNode.get("access_token").asText();
        String refreshToken = jsonNode.has("refresh_token") ? jsonNode.get("refresh_token").asText() : null;
        long expiresIn = jsonNode.has("expires_in") ? jsonNode.get("expires_in").asLong() : 0;

        // 3. Fetch user info
        HttpRequest userInfoRequest = HttpRequest.newBuilder()
                .uri(URI.create("https://www.googleapis.com/oauth2/v2/userinfo"))
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .build();

        HttpResponse<String> userInfoResponse = client.send(userInfoRequest, HttpResponse.BodyHandlers.ofString());
        JsonNode userInfo = mapper.readTree(userInfoResponse.body());

        String googleId = userInfo.get("id").asText(); // Google unique user ID
        String email = userInfo.get("email").asText();
        String name = userInfo.has("name") ? userInfo.get("name").asText() : "";

        // 4. Save or update user and token in DB
        var user = googleAuthService.saveOrUpdateUser(googleId, name, email, accessToken, refreshToken, expiresIn);

        // 5. Prepare response
        UserDto userDTO = new UserDto((long) user.getId(), user.getName(), user.getEmail() );
        AuthResponse authResponse = new AuthResponse(userDTO);

        return ResponseEntity.ok(authResponse);
    }



}
