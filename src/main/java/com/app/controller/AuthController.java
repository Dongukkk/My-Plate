package com.app.controller;

import com.app.dto.auth.LoginRequest;
import com.app.dto.auth.LoginResponse;
import com.app.dto.user.UserResponse;
import com.app.service.UserService;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            LoginResponse tokens = userService.login(req);
            return ResponseEntity.ok(tokens);
        } catch (IllegalArgumentException e) {    // 자격 증명 실패 등
            return ResponseEntity.status(401).body(e.getMessage());
        } catch (Exception e) {      // 그 외 서버 오류
            return ResponseEntity.status(500).body("서버 오류");
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@RequestHeader(value = "Authorization", 
    										required = false) String authHeader) {
    	
    	System.out.println("Authorization header = " + authHeader); // 디버그

        if (authHeader == null) {
            return ResponseEntity.status(401).build(); // Unauthorized
        }

        String header = authHeader.trim();
        if (!header.toLowerCase(java.util.Locale.ROOT).startsWith("bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = header.substring(7).trim();
        // 또는: String token = header.replaceFirst("(?i)^Bearer\\s+", "").trim();

        UserResponse user = userService.me(token);
        return ResponseEntity.ok(user);
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
    	
    	String refresh = body.get("refresh");
    	
    	if(refresh == null || refresh.isBlank()) {
    		return ResponseEntity.badRequest().body("refresh token is required");
    	}
    	
    	try {
            // refresh 토큰 검증(현재 JwtUtil.validateToken 을 그대로 사용)
            String email = com.app.security.JwtUtil.validateToken(refresh);

            // 새 access 발급 (refresh는 재발급 안 해도 OK, 원하면 새로 발급)
            String newAccess = com.app.security.JwtUtil.generateAccessToken(email);

            return ResponseEntity.ok(new com.app.dto.auth.LoginResponse(newAccess, refresh));
        } catch (Exception e) {
            // 만료/위조 등
            return ResponseEntity.status(401).body("invalid refresh token");
        }
    }
    
}




