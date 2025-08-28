package com.app.service.impl;

import com.app.dto.UserDTO;
import com.app.dto.auth.LoginRequest;
import com.app.dto.auth.LoginResponse;
import com.app.dto.user.UserRegisterRequest;
import com.app.dto.user.UserResponse;
import com.app.mapper.UserMapper;
import com.app.security.JwtUtil;
import com.app.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired private UserMapper userMapper;

    // 지금은 Bean 등록 없이 new로 사용(간단하게). 나중에 Bean으로 빼도 됨.
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Override
    @Transactional
    public UserResponse register(UserRegisterRequest req) {
        // 1) 기본 검증 (간단 버전)
        if (req == null) throw new IllegalArgumentException("요청이 비었습니다.");
        if (req.getEmail() == null || req.getEmail().trim().isEmpty())
            throw new IllegalArgumentException("이메일을 입력해주세요.");
        if (req.getPassword() == null || req.getPassword().isEmpty())
            throw new IllegalArgumentException("비밀번호를 입력해주세요.");
        if (req.getName() == null || req.getName().trim().isEmpty())
            throw new IllegalArgumentException("이름을 입력해주세요.");

        // 2) 이메일 정규화(트림 + 소문자)
        String email = req.getEmail().trim().toLowerCase();

        // 3) 중복 체크
        if (userMapper.existsByEmail(email) > 0)
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");

        // (username 중복 체크를 쓰려면 주석 해제)
        // if (userMapper.existsByUsername(req.getName().trim()) > 0)
        //     throw new IllegalArgumentException("이미 사용 중인 사용자명입니다.");

        // 4) 해시
        String hashed = encoder.encode(req.getPassword());

        // 5) DTO 구성 (role/status는 SQL에서 'USER','ACTIVE'로 넣고 있음)
        UserDTO u = new UserDTO();
        u.setEmail(email);
        u.setPassword(hashed);
        u.setUsername(req.getName().trim());	// 화면에서 'name'을 닉네임/username으로 사용
        u.setAddress(" ");
        u.setPhoneNumber(" ");

        // 6) 저장
        userMapper.insertUser(u);

        // 7) 응답 (ID가 필요하면 재조회)
        UserDTO saved = userMapper.findByEmail(email);
        return new UserResponse(
                saved.getId(),
                saved.getEmail(),
                saved.getUsername()   // 응답 name 자리에 username 사용
        );
    }
    
    //  로그인 구현
    @Override
    public LoginResponse login(LoginRequest req) {
        if (req == null) throw new IllegalArgumentException("요청이 비었습니다.");
        if (req.getEmail() == null || req.getEmail().trim().isEmpty())
            throw new IllegalArgumentException("이메일을 입력해주세요.");
        if (req.getPassword() == null || req.getPassword().isEmpty())
            throw new IllegalArgumentException("비밀번호를 입력해주세요.");

        String email = req.getEmail().trim().toLowerCase();

        // 1) 사용자 조회
        UserDTO user = userMapper.findByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        // 2) 비밀번호 검증(BCrypt)
        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        // 3) 토큰 발급
        String access  = JwtUtil.generateAccessToken(email);
        String refresh = JwtUtil.generateRefreshToken(email);

        return new LoginResponse(access, refresh);
    }
    
    @Override
    public UserResponse me(String accessToken) {
    	
    	if(accessToken == null || accessToken.trim().isEmpty()) {
    		throw new IllegalArgumentException("토근이 없습니다.");
    	}
    	
    	// 1) 토큰 검증
    	String email = com.app.security.JwtUtil.validateToken(accessToken);
    	
    	// 2) 사용자 조회
    	com.app.dto.UserDTO user = userMapper.findByEmail(email);
    	if (user == null) {
    		throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
    	}
    	
    	// 3) 필요한 정보만 응답 DTO로 변환
    	return new com.app.dto.user.UserResponse(
                user.getId(),
                user.getEmail(),
                user.getUsername()
        );
    }
    
}