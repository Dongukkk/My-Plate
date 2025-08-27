package com.app.service.restaurant;

import java.util.List;

import com.app.dto.restaurant.RestaurantDTO;

public interface RestaurantService {
	List<RestaurantDTO> findAllRestaurants();
}
