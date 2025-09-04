package com.app.service.restaurant;

import java.util.List;

import com.app.dto.restaurant.BookmarkDTO;

public interface BookmarkService {

	void toggleBookmark(Long userId, Long restaurantId);
	
	List<BookmarkDTO> getBookmarksbyUserId(Long userId);
}
