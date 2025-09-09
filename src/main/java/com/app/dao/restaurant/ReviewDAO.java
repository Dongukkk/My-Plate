package com.app.dao.restaurant;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;

import com.app.dto.restaurant.MyReviewResponse;
import com.app.dto.restaurant.ReviewDTO;

public interface ReviewDAO {
	
	public long getReviewCountByRestaurantId(long restaurantId);

	List<ReviewDTO> getReviewsByRestaurantId(@Param("restaurantId") Long restaurantId);
	
	public ReviewDTO createReview(ReviewDTO review);
	
	void incrementReviewCount(long restaurantId);
	
	void decrementReviewCount(long restaurantId);
	
	ReviewDTO updateReview(ReviewDTO review);
	
	int markReviewAsDeleted(long id);
	
	ReviewDTO getReviewById(long id);
	
	void updateRestaurantInfoWhenReview(long restaurantId);
	
	List<MyReviewResponse> findReviewsByUserId(long userId);
}
