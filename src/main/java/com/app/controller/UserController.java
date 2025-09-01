package com.app.controller;

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
    
    //비밀번호 재설정 링크 요청
    
    
    
}