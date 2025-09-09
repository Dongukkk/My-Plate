package com.app.service.restaurant;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;

import com.app.dto.restaurant.MyReviewResponse;
import com.app.dto.restaurant.ReviewDTO;

public interface ReviewService {
	
	public long getReviewCountByRestaurantId(long restaurantId);

	public List<ReviewDTO> getReviewsByRestaurantId(@Param("restaurantId") Long restaurantId);
	
	public ReviewDTO createReview(ReviewDTO review);
	
	public ReviewDTO updateReview(ReviewDTO review);
	
    public int markReviewAsDeleted(long id);
    
    List<MyReviewResponse> findReviewsByUserId(Long userId);
}
