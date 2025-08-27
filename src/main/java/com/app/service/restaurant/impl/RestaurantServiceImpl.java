package com.app.service.restaurant.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.app.dao.restaurant.RestaurantDAO;
import com.app.dto.restaurant.RestaurantDTO;
import com.app.service.restaurant.RestaurantService;

@Service
public class RestaurantServiceImpl implements RestaurantService{

	@Autowired
	RestaurantDAO restaurantDAO;
	
	@Override
	public List<RestaurantDTO> findAllRestaurants() {
		
		return restaurantDAO.findAllRestaurants();
	}

}
