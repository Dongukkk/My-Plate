package com.app.service;

import com.app.dto.auth.LoginRequest;
import com.app.dto.auth.LoginResponse;
import com.app.dto.user.UserRegisterRequest;
import com.app.dto.user.UserResponse;

public interface UserService {

	UserResponse register(UserRegisterRequest req);
	
	LoginResponse login(LoginRequest req);
	
	UserResponse me(String accessToken);
	
}
