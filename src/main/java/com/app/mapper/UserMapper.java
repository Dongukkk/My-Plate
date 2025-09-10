package com.app.mapper;

import com.app.dto.UserDTO;
import com.app.dto.stats.MonthlyStatDTO;
import com.app.dto.user.BookmarkItemDTO;
import com.app.dto.user.ReviewBrief;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface UserMapper {
	
    int ping();

    int insertUser(UserDTO user);

    int existsByEmail(@Param("email") String email);
    int existsByUsername(@Param("username") String username);

    UserDTO findByEmail(@Param("email") String email);
    
    @Update("UPDATE MP_USER SET PASSWORD = #{password} WHERE EMAIL = #{email}")
    int updatePasswordByEmail(@Param("email") String email,
                              @Param("password") String password);
    // ======  소셜용 (XML의 id와 1:1 매칭) ======
    UserDTO findByProviderAndProviderId(Map<String, Object> params);  // XML select
    int updateProviderLink(Map<String, Object> params);               // XML update
    int insertOauthUser(UserDTO user);                                 // XML insert
    
    int existsByUsernameExceptEmail(@Param("username") String username,
            @Param("email") String email);

    int updateUsernameByEmail(@Param("username") String username,
    		@Param("email") String email);
    
    // KPI
    int countReviewByUserId(@Param("userId") Long userId);
    Double avgRatingByUserId(@Param("userId") Long userId);
    int countBookmarksByUserId(@Param("userId") Long userId);
    
    // 최근 리뷰 목록
    List<ReviewBrief> findRecentByEmail(@Param("email") String email,
    									@Param("limit") int limit);
    
    UserDTO findByUsername(@Param("username") String username);
    
    //북마크 
    List<BookmarkItemDTO> findBookmarksByEmail(@Param("email") String email);
    
    // USER_ID 기준 최근 N개월 집계
    List<MonthlyStatDTO> findMonthlyStatsByUserId(
            @Param("userId") Long userId,
            @Param("months") int months
            );
    	
    
}