package com.app.service.restaurant;

import java.util.List;

import com.app.dto.restaurant.RestaurantDTO;

public interface RestaurantService {
	public List<RestaurantDTO> findAllRestaurants(String sort, String direction, int page, int limit);
	
	public RestaurantDTO getRestaurantById(Long id);
	
	public List<RestaurantDTO> findRestaurantsInBounds(double swLat, double swLng, double neLat, double neLng);
}
