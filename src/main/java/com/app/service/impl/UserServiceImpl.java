package com.app.service.impl;

import com.app.dto.UserDTO;
import com.app.dto.auth.LoginRequest;
import com.app.dto.auth.LoginResponse;
import com.app.dto.stats.MonthlyStatDTO;
import com.app.dto.user.BookmarkItemDTO;
import com.app.dto.user.ReviewBrief;
import com.app.dto.user.UserRegisterRequest;
import com.app.dto.user.UserResponse;
import com.app.dto.user.UserStats;                 
import com.app.mapper.UserMapper;
import com.app.security.JwtUtil;
import com.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static com.app.security.PasswordUtil.*;

import java.util.List;   

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

    // ====================================================
    // ✅ 추가: /api/me/name (Authorization 헤더 사용)
    // ====================================================
    @Override
    @Transactional
    public void updateMyName(String authorization, String username) {
        String email = emailFromAuthorization(authorization);  // 토큰에서 이메일 복원

        if (username == null) throw new IllegalArgumentException("닉네임이 비었습니다.");
        String nick = username.trim();
        // 2~20자, 한글/영문/숫자/_-
        if (!nick.matches("^[가-힣a-zA-Z0-9_-]{2,20}$")) {
            throw new IllegalArgumentException("닉네임은 2~20자, 한글/영문/숫자/(_)(-)만 가능합니다.");
        }

        // 본인 제외 중복
        if (userMapper.existsByUsernameExceptEmail(nick, email) > 0) {
            throw new IllegalStateException("이미 사용 중인 닉네임입니다.");
        }

        // 업데이트
        if (userMapper.updateUsernameByEmail(nick, email) != 1) {
            throw new IllegalStateException("사용자 계정을 찾을 수 없습니다.");
        }
    }

    // ====================================================
    // ✅ 추가: /api/me/stats 
    // ====================================================
    @Override
    public UserStats getMyStats(String authorization) {
        
    	String email = emailFromAuthorization(authorization);
    	
    	Long userId = getUserIdByEmail(email);
    	
    	int reviewCnt = userMapper.countReviewByUserId(userId);
    	Double avgObj = userMapper.avgRatingByUserId(userId);
    	int bookmarkCnt = userMapper.countBookmarksByUserId(userId);
    	
    	int visitCnt = 0;
    	double avg = (avgObj == null ? 0.0 : avgObj);
    	
    	
        return new UserStats(reviewCnt, bookmarkCnt, visitCnt, avg);
    }

    // ----------------------------------------------------
    // Helper
    // ----------------------------------------------------
    private String emailFromAuthorization(String authorization) {
        
    	if(authorization == null || authorization.isBlank()) {
    		throw new IllegalArgumentException("Authorization 헤더가 없습니다.");
    	}
    	
    	String token = authorization.startsWith("Bearer ")
    			? authorization.substring(7)
    			: authorization;
    			
    	return JwtUtil.validateToken(token);
    }
    
    @Override
    public List<ReviewBrief> getMyRecentReviews(String authorization, int limit) {
        String email = emailFromAuthorization(authorization);
        int safe = Math.max(1, Math.min(limit, 20));   
        List<ReviewBrief> list = userMapper.findRecentByEmail(email, safe);
        return (list != null) ? list : java.util.Collections.emptyList();
    }

	@Override
	public List<BookmarkItemDTO> getMyBookmarks(String authorization) {
		
		if (authorization == null || !authorization.startsWith("Bearer "))
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "NO_TOKEN");
		
		String token = authorization.substring(7);
		
		String email = JwtUtil.validateToken(token);
		
		return userMapper.findBookmarksByEmail(email);
	}

	@Override
	@Transactional
	public List<MonthlyStatDTO> getMonthlyStatsByUserId(Long userId, int months) {
		
		if(userId == null) throw new IllegalArgumentException("userId is null");
		if(months < 1) months =1;
		if(months > 24) months = 24;
		
		return userMapper.findMonthlyStatsByUserId(userId, months);
	}

	@Override
	@Transactional(readOnly = true)
	public List<MonthlyStatDTO> getMyMonthlyStats(String authorization, int months) {
		
		String email = emailFromAuthorization(authorization);
		Long userId = getUserIdByEmail(email);
		
		if(months <1) months = 1;
		if(months > 24) months = 24;
		
		return userMapper.findMonthlyStatsByUserId(userId, months);
	}
	
	
	
}








