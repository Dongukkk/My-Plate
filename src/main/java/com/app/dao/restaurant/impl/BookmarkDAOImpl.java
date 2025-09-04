package com.app.dao.restaurant.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import com.app.dao.restaurant.BookmarkDAO;
import com.app.dto.restaurant.BookmarkDTO;

@Repository
public class BookmarkDAOImpl implements BookmarkDAO{
	
	@Autowired
	SqlSessionTemplate sqlSessionTemplate;
	
	@Override
    public Optional<BookmarkDTO> findByUserIdAndRestaurantId(Long userId, Long restaurantId) {
		Map<String, Object> params = new HashMap<>();
	    
	    params.put("userId", userId);
	    params.put("restaurantId", restaurantId);
	    BookmarkDTO bookmarkDTO = sqlSessionTemplate.selectOne("bookmark_mapper.findByUserIdAndRestaurantId", params);
		
		return Optional.ofNullable(bookmarkDTO);
	}

    @Override
    public void insert(BookmarkDTO bookmark) {
        sqlSessionTemplate.insert("bookmark_mapper.insert", bookmark);
    }

    @Override
    public void updateStatus(BookmarkDTO bookmark) {
    	sqlSessionTemplate.update("bookmark_mapper.updateStatus", bookmark);
    }

	@Override
	public List<BookmarkDTO> getBookmarksbyUserId(Long userId) {
		return sqlSessionTemplate.selectList("bookmark_mapper.getBookmarksbyUserId", userId);
		
	}
	

}
