package com.app.dao.restaurant;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.app.dto.restaurant.ReviewDTO;

public interface ReviewDAO {
	
	public long getReviewCountByRestaurantId(long restaurantId);

	List<ReviewDTO> getReviewsByRestaurantId(@Param("restaurantId") Long restaurantId);
}
