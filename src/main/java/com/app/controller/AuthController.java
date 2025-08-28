package com.app.controller;

import com.app.dto.auth.LoginRequest;
import com.app.dto.auth.LoginResponse;
import com.app.dto.user.UserResponse;
import com.app.service.UserService;
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
    public ResponseEntity<UserResponse> me(@RequestHeader("Authorization") String authHeader) {
    	
    	if (authHeader == null || !authHeader.startsWith("Bearer")) {
    		return ResponseEntity.badRequest().build();
    	}
    	
    	String token = authHeader.substring(7);
    	
    	UserResponse user = userService.me(token);
    	return ResponseEntity.ok(user);
    }
}
