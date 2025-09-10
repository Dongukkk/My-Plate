package com.app.dao.restaurant.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.app.dao.restaurant.ReviewDAO;
import com.app.dto.restaurant.MyReviewResponse;
import com.app.dto.restaurant.ReviewDTO;

@Repository
public class ReviewDAOImpl implements ReviewDAO {

	@Autowired
	SqlSessionTemplate sqlSessionTemplate;
	
	@Override
	public long getReviewCountByRestaurantId(long restaurantId) {
		return sqlSessionTemplate.selectOne("review_mapper.getReviewCountByRestaurantId", restaurantId);
	}

	@Override
	public List<ReviewDTO> getReviewsByRestaurantId(Long restaurantId, int page, int size, String sortOrder) {
		Map<String, Object> params = new HashMap<>();
        params.put("restaurantId", restaurantId);
        params.put("sortOrder", sortOrder);
        params.put("offset", page * size);
        params.put("limit", size);
        System.out.println(params);
		List<ReviewDTO> reviews = sqlSessionTemplate.selectList("review_mapper.getReviewsByRestaurantId", params);
		System.out.println(reviews);
		return reviews;
	}

	@Override
	public ReviewDTO createReview(ReviewDTO review) {
        sqlSessionTemplate.insert("review_mapper.createReview", review);

        return review;
    }

	@Override
	public void incrementReviewCount(long restaurantId) {
		sqlSessionTemplate.update("review_mapper.incrementReviewCount", restaurantId);
		
	}
	
	@Override
	public void decrementReviewCount(long restaurantId) {
		sqlSessionTemplate.update("review_mapper.decrementReviewCount", restaurantId);
		
	}
	
	@Override
	public ReviewDTO updateReview(ReviewDTO review) {
		sqlSessionTemplate.update("review_mapper.updateReview", review);
	return review;
	}

	@Override
	public int markReviewAsDeleted(long id) {
		return sqlSessionTemplate.update("review_mapper.markReviewAsDeleted", id);
	}

	@Override
	public ReviewDTO getReviewById(long id) {
		return sqlSessionTemplate.selectOne("review_mapper.getReviewById", id);
	}

	@Override
	public void updateRestaurantInfoWhenReview(long restaurantId) {
		sqlSessionTemplate.update("review_mapper.updateRestaurantInfoWhenReview", restaurantId);
		
	}

	@Override
	public List<MyReviewResponse> findReviewsByUserId(long userId) {
		return sqlSessionTemplate.selectList("review_mapper.findReviewsByUserId", userId);
	}

	

}
