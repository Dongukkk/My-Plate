package com.app.service.restaurant;

import java.util.List;

import com.app.dto.restaurant.RestaurantDTO;

public interface RestaurantService {
	public List<RestaurantDTO> findAllRestaurants(String sort, String direction);
	
	public RestaurantDTO getRestaurantById(Long id);
}
