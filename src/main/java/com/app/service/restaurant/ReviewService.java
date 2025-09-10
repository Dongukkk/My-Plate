package com.app.service.restaurant;

import java.util.List;

import com.app.dto.restaurant.MyReviewResponse;
import com.app.dto.restaurant.ReviewDTO;

public interface ReviewService {
	
	public long getReviewCountByRestaurantId(long restaurantId);

	public List<ReviewDTO> getReviews(Long restaurantId, int page, int size, String sortOrder);
	
	public ReviewDTO createReview(ReviewDTO review);
	
	public ReviewDTO updateReview(ReviewDTO review);
	
    public int markReviewAsDeleted(long id);
    
    List<MyReviewResponse> findReviewsByUserId(Long userId);
}
