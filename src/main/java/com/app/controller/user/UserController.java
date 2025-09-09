package com.app.controller.user;

import com.app.dto.auth.LoginRequest;
import com.app.dto.auth.LoginResponse;
import com.app.dto.user.UserRegisterRequest;
import com.app.dto.user.UserResponse;
import com.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody UserRegisterRequest req) {
        UserResponse res = userService.register(req);
        return ResponseEntity.ok(res); 
    }
    
    @PostMapping("/login")          
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(userService.login(req));
    }
    
    
    
}