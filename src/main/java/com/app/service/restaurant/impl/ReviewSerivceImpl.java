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
		reviewDAO.updateRestaurantInfoWhenReview(review.getRestaurantId());
		return updatedReview;
	}

	@Override
	public ReviewDTO updateReview(ReviewDTO review) {
		ReviewDTO update = reviewDAO.updateReview(review);
		reviewDAO.updateRestaurantInfoWhenReview(review.getRestaurantId());
		return update;
	}

	@Override
	public int markReviewAsDeleted(long id) {
		ReviewDTO review = reviewDAO.getReviewById(id);
		int result = reviewDAO.markReviewAsDeleted(id);
		reviewDAO.decrementReviewCount(review.getRestaurantId());	
		reviewDAO.updateRestaurantInfoWhenReview(review.getRestaurantId());
		return result;
	}

	
}
