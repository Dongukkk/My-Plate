package com.app.service.restaurant.impl;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.app.dao.restaurant.ReviewDAO;
import com.app.dto.restaurant.ReviewDTO;
import com.app.service.restaurant.ReviewService;

@Service
public class ReviewSerivceImpl implements ReviewService {

	@Autowired
	ReviewDAO reviewDAO;
	
	@Override
	public long getReviewCountByRestaurantId(long restaurantId) {
		return reviewDAO.getReviewCountByRestaurantId(restaurantId);
	}

	@Override
	public List<ReviewDTO> getReviewsByRestaurantId(Long restaurantId) {
		return reviewDAO.getReviewsByRestaurantId(restaurantId);
	}

	@Override
	public ReviewDTO createReview(ReviewDTO review) {
		ReviewDTO updatedReview = reviewDAO.createReview(review);
		reviewDAO.incrementReviewCount(review.getRestaurantId());
		return updatedReview;
	}

	
}
