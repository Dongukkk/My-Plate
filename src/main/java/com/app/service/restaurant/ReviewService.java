package com.app.service.restaurant;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;

import com.app.dto.restaurant.ReviewDTO;

public interface ReviewService {
	
	public long getReviewCountByRestaurantId(long restaurantId);

	List<ReviewDTO> getReviewsByRestaurantId(@Param("restaurantId") Long restaurantId);
	
	public ReviewDTO createReview(ReviewDTO review);
}
