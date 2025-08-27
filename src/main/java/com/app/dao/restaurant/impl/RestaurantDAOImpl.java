package com.app.dao.restaurant.impl;

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

}
