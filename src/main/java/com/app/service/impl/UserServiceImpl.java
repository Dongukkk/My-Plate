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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.app.security.PasswordUtil.*;   // ✅ hash, matches, isBCrypt

@Service
public class UserServiceImpl implements UserService {

    @Autowired private UserMapper userMapper;

    @Override
    @Transactional
    public UserResponse register(UserRegisterRequest req) {
        if (req == null) throw new IllegalArgumentException("요청이 비었습니다.");
        if (req.getEmail() == null || req.getEmail().trim().isEmpty())
            throw new IllegalArgumentException("이메일을 입력해주세요.");
        if (req.getPassword() == null || req.getPassword().isEmpty())
            throw new IllegalArgumentException("비밀번호를 입력해주세요.");
        if (req.getName() == null || req.getName().trim().isEmpty())
            throw new IllegalArgumentException("이름을 입력해주세요.");

        // 이메일 정규화
        String email = req.getEmail().trim().toLowerCase();

        // 중복 체크
        if (userMapper.existsByEmail(email) > 0)
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");

        // ✅ 해시 저장
        String hashed = hash(req.getPassword());

        UserDTO u = new UserDTO();
        u.setEmail(email);
        u.setPassword(hashed);
        u.setUsername(req.getName().trim());
        u.setAddress(" ");
        u.setPhoneNumber(" ");

        userMapper.insertUser(u);

        UserDTO saved = userMapper.findByEmail(email);
        return new UserResponse(
                saved.getId(),
                saved.getEmail(),
                saved.getUsername(),
                saved.getRole(),
                saved.getProvider()
        );
    }

    @Override
    public LoginResponse login(LoginRequest req) {
        if (req == null) throw new IllegalArgumentException("요청이 비었습니다.");
        if (req.getEmail() == null || req.getEmail().trim().isEmpty())
            throw new IllegalArgumentException("이메일을 입력해주세요.");
        if (req.getPassword() == null || req.getPassword().isEmpty())
            throw new IllegalArgumentException("비밀번호를 입력해주세요.");

        String email = req.getEmail().trim().toLowerCase();

        // 사용자 조회
        UserDTO user = userMapper.findByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        String raw   = req.getPassword();   // 입력 평문
        String saved = user.getPassword();  // DB 저장값(해시 또는 과거 평문)

        boolean ok;
        if (isBCrypt(saved)) {
            // ✅ bcrypt로 저장된 계정
            ok = matches(raw, saved);
        } else {
            // 과거 평문 저장된 계정(마이그레이션용)
            ok = raw.equals(saved);

            // ✅ 선택(권장): 로그인 성공 시 자동 해시 승격
            if (ok) {
                String newHash = hash(raw);
                userMapper.updatePasswordByEmail(email, newHash);
            }
        }

        if (!ok) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        String access  = JwtUtil.generateAccessToken(email);
        String refresh = JwtUtil.generateRefreshToken(email);
        return new LoginResponse(access, refresh);
    }

    @Override
    public UserResponse me(String accessToken) {
        if (accessToken == null || accessToken.trim().isEmpty()) {
            throw new IllegalArgumentException("토큰이 없습니다.");
        }

        String email = JwtUtil.validateToken(accessToken);

        UserDTO user = userMapper.findByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }

        String role = user.getRole();
        if ("ADM".equalsIgnoreCase(role)) role = "Admin";
        if ("USR".equalsIgnoreCase(role)) role = "USER";
        
        String provider = user.getProvider();
        if (provider == null || provider.isBlank()) provider = "MYPLATE";
        
        return new com.app.dto.user.UserResponse(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                role,
                provider
        );
    }
    
    @Override
    public Long getUserIdByEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("이메일이 비어있습니다.");
        }
        UserDTO user = userMapper.findByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }
        return user.getId();
    }
}