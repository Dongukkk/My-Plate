package com.app.dao.restaurant;

import java.util.List;
import java.util.Optional;

import org.apache.ibatis.annotations.Param;

import com.app.dto.restaurant.BookmarkDTO;

public interface BookmarkDAO {

	Optional<BookmarkDTO> findByUserIdAndRestaurantId(@Param("userId") Long userId, @Param("restaurantId") Long restaurantId);

    void insert(BookmarkDTO bookmark);

    void updateStatus(BookmarkDTO bookmark);
    
    List<BookmarkDTO>getBookmarksbyUserId(Long userId);
}
