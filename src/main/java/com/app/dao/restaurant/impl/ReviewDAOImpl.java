package com.app.dao.restaurant.impl;

import java.util.List;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.app.dao.restaurant.ReviewDAO;
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
	public List<ReviewDTO> getReviewsByRestaurantId(Long restaurantId) {
		System.out.println("DAO");
//		return  sqlSessionTemplate.selectList("review_mapper.getReviewsByRestaurantId", restaurantId);
		List<ReviewDTO> dto = sqlSessionTemplate.selectList("review_mapper.getReviewsByRestaurantId", restaurantId);
		System.out.println(dto);
		return dto;
	}

}
