package com.app.dao.restaurant;

import java.util.List;

import com.app.dto.restaurant.RestaurantDTO;


public interface RestaurantDAO {
	public int saveApiRestaurant(RestaurantDTO restaurant);
	
	public List<RestaurantDTO> findAllRestaurants();
	
	public RestaurantDTO getRestaurantById(Long id);
}
