package com.app.service;

import java.util.List;

import com.app.dto.auth.LoginRequest;
import com.app.dto.auth.LoginResponse;
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
}
