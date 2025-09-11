package com.app.service;

import java.util.List;

import com.app.dto.auth.LoginRequest;
import com.app.dto.auth.LoginResponse;
import com.app.dto.stats.MonthlyStatDTO;
import com.app.dto.user.BookmarkItemDTO;
import com.app.dto.user.ReviewBrief;
import com.app.dto.user.UserRegisterRequest;
import com.app.dto.user.UserResponse;
import com.app.dto.user.UserStats;

public interface UserService {

	UserResponse register(UserRegisterRequest req);
	
	LoginResponse login(LoginRequest req);
	
	UserResponse me(String accessToken);
	
	public Long getUserIdByEmail(String email);
	
	void updateMyName(String authorization, String username);

    /* 나의 KPI 통계 (컨트롤러와 시그니처 일치) */
    UserStats getMyStats(String authorization);
    
    /* 최근 리뷰 목록*/
    List<ReviewBrief> getMyRecentReviews(String accessToken, int limit);
    
    /* 북마크 */
    List<BookmarkItemDTO> getMyBookmarks(String authorization);
    
    /* 최근 N개월 월간 통계(USER_ID 기준)*/
    List<MonthlyStatDTO> getMonthlyStatsByUserId(Long userId, int months);
    
    /* Authorization 헤더 기반으로 최근 N개월 통계 반환 */
    List<MonthlyStatDTO> getMyMonthlyStats(String authorization, int months);
    
    /* 회원 탈퇴 (소프트 삭제) */
    void withdraw(Long userId, @org.springframework.lang.Nullable String reason);
    
    /* 내 계정 탈퇴 (토큰에서 본인 식별 + 현재 비밀번호 검증후 탈퇴처리) */
    void withdrawMe(String authorization, String password,
            @org.springframework.lang.Nullable String reason);
    
}
