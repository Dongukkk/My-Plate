package com.app.controller;

import com.app.dto.auth.LoginRequest;
import com.app.dto.auth.LoginResponse;
import com.app.dto.user.UserResponse;
import com.app.dto.UserDTO;

import com.app.service.UserService;
import com.app.mapper.UserMapper;

import com.app.config.OAuthProps;
import com.app.dto.auth.GoogleTokenResponse;
import com.app.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.http.HttpEntity;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired private UserService userService;
    @Autowired private UserMapper userMapper;

    // =========================
    // 기본 로그인/토큰
    // =========================

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            LoginResponse tokens = userService.login(req);
            return ResponseEntity.ok(tokens);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("서버 오류");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null) return ResponseEntity.status(401).build();

        String header = authHeader.trim();
        if (!header.toLowerCase(java.util.Locale.ROOT).startsWith("bearer "))
            return ResponseEntity.status(401).build();

        String token = header.substring(7).trim();
        UserResponse user = userService.me(token);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        String refresh = body.get("refresh");
        if (refresh == null || refresh.trim().isEmpty())
            return ResponseEntity.badRequest().body("refresh token is required");

        try {
            String email = JwtUtil.validateToken(refresh);
            String newAccess = JwtUtil.generateAccessToken(email);
            return ResponseEntity.ok(new LoginResponse(newAccess, refresh));
        } catch (Exception e) {
            return ResponseEntity.status(401).body("invalid refresh token");
        }
    }

    // =========================
    // Google OAuth
    // =========================

    @GetMapping("/oauth/google/url")
    public ResponseEntity<Map<String, String>> googleAuthUrl() {
        String url = OAuthProps.GOOGLE_AUTH_URL
                + "?client_id="     + URLEncoder.encode(OAuthProps.GOOGLE_CLIENT_ID, StandardCharsets.UTF_8)
                + "&redirect_uri="  + URLEncoder.encode(OAuthProps.GOOGLE_REDIRECT_URI, StandardCharsets.UTF_8) // 백엔드 콜백
                + "&response_type=code"
                + "&scope="         + URLEncoder.encode(OAuthProps.GOOGLE_SCOPE, StandardCharsets.UTF_8)
                + "&access_type=offline"
                + "&prompt=consent";

        // Map.of(...) -> 자바8은 아래로
        return ResponseEntity.ok(Collections.singletonMap("url", url));
    }

    @GetMapping("/oauth/google/callback")
    public ResponseEntity<Void> googleCallback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String error) {

        String feCallback = "http://localhost:3000/oauth/google/callback";

        // 자바8: isBlank() 대신 trim().isEmpty()
        if (error != null || code == null || code.trim().isEmpty()) {
            String fail = feCallback + "#error=" +
                    URLEncoder.encode(error == null ? "no_code" : error, StandardCharsets.UTF_8);
            HttpHeaders h = new HttpHeaders();
            h.setLocation(URI.create(fail));
            return new ResponseEntity<>(h, HttpStatus.FOUND);
        }

        RestTemplate rt = new RestTemplate();

        // code -> access_token (Content-Type 명시)
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("code", code);
        form.add("client_id", OAuthProps.GOOGLE_CLIENT_ID);
        form.add("client_secret", OAuthProps.GOOGLE_CLIENT_SECRET);
        form.add("redirect_uri", OAuthProps.GOOGLE_REDIRECT_URI); // 구글 콘솔과 100% 일치
        form.add("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> req = new HttpEntity<>(form, headers);

        GoogleTokenResponse gTok =
                rt.postForObject(OAuthProps.GOOGLE_TOKEN_URL, req, GoogleTokenResponse.class);

        if (gTok == null || gTok.access_token == null) {
            HttpHeaders h = new HttpHeaders();
            h.setLocation(URI.create(feCallback + "#error=token_exchange_failed"));
            return new ResponseEntity<>(h, HttpStatus.FOUND);
        }

        // userinfo 조회
        @SuppressWarnings("unchecked")
        Map<String, Object> info =
                rt.getForObject(OAuthProps.GOOGLE_USERINFO + "?access_token=" + gTok.access_token, Map.class);

        if (info == null || info.get("email") == null) {
            HttpHeaders h = new HttpHeaders();
            h.setLocation(URI.create(feCallback + "#error=userinfo_failed"));
            return new ResponseEntity<>(h, HttpStatus.FOUND);
        }

        String email = String.valueOf(info.get("email"));
        String name  = info.get("name") != null ? String.valueOf(info.get("name"))
                                                : email.split("@")[0];

        // upsert
        UserDTO user = userMapper.findByEmail(email);
        if (user == null) {
            user = new UserDTO();
            user.setEmail(email);
            user.setUsername(name);

            String dummy = new BCryptPasswordEncoder().encode(java.util.UUID.randomUUID().toString());
            user.setPassword(dummy);
            user.setAddress(" ");
            user.setPhoneNumber(" ");
            userMapper.insertUser(user);
        }

        // 우리 JWT
        String access  = JwtUtil.generateAccessToken(email);
        String refresh = JwtUtil.generateRefreshToken(email);

        // 프런트 콜백으로 302 redirect (fragment)
        String redirect = feCallback
                + "#access="  + URLEncoder.encode(access,  StandardCharsets.UTF_8)
                + "&refresh=" + URLEncoder.encode(refresh, StandardCharsets.UTF_8);

        HttpHeaders h = new HttpHeaders();
        h.setLocation(URI.create(redirect));
        return new ResponseEntity<>(h, HttpStatus.FOUND);
    }
}