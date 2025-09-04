package com.app.service.restaurant.impl;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.app.dao.restaurant.BookmarkDAO;
import com.app.dto.restaurant.BookmarkDTO;
import com.app.service.restaurant.BookmarkService;

@Service
public class BookmarkServiceImpl implements BookmarkService{

	@Autowired
	BookmarkDAO bookmarkDAO;
	
	@Override
    public void toggleBookmark(Long userId, Long restaurantId) {
        Optional<BookmarkDTO> existingBookmark = bookmarkDAO.findByUserIdAndRestaurantId(userId, restaurantId);

        if (existingBookmark.isPresent()) {
            BookmarkDTO bookmark = existingBookmark.get();
            String currentStatus = bookmark.getStatus();
            String newStatus = currentStatus.equals("true") ? "false" : "true";
            bookmark.setStatus(newStatus);
            
            bookmarkDAO.updateStatus(bookmark);
        } else {
            BookmarkDTO newBookmark = new BookmarkDTO();
            newBookmark.setUserId(userId);
            newBookmark.setRestaurantId(restaurantId);
            newBookmark.setStatus("true");
            
            bookmarkDAO.insert(newBookmark);
        }
	}

	@Override
	public List<BookmarkDTO> getBookmarksbyUserId(Long userId) {
		return bookmarkDAO.getBookmarksbyUserId(userId);
	}
}
