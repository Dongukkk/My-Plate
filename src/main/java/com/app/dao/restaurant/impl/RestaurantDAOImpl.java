package com.app.dao.restaurant.impl;

import java.util.List;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.app.dao.restaurant.RestaurantDAO;
import com.app.dto.restaurant.RestaurantDTO;

@Repository
public class RestaurantDAOImpl implements RestaurantDAO {
	
	@Autowired
	SqlSessionTemplate sqlSessionTemplate;
	
	@Override
	public int saveApiRestaurant(RestaurantDTO restaurant) {

		int rst = sqlSessionTemplate.insert("restaurant_mapper.saveApiRestaurant", restaurant);
		
		return rst;
	}

	@Override
	public List<RestaurantDTO> findAllRestaurants() {
		
		return sqlSessionTemplate.selectList("restaurant_mapper.findAllRestaurants");
	}

	@Override
	public RestaurantDTO getRestaurantById(Long id) {
		
		return sqlSessionTemplate.selectOne("restaurant_mapper.getRestaurantById", id);
	}

}
