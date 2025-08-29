package com.app.dao.restaurant;

import java.util.List;

import com.app.dto.restaurant.RestaurantDTO;


public interface RestaurantDAO {
	public int saveApiRestaurant(RestaurantDTO restaurant);
	
	public List<RestaurantDTO> findAllRestaurants(String sort, String direction, int page, int limit);
	
	public RestaurantDTO getRestaurantById(Long id);
}
