package com.app.dao.restaurant;

import java.util.List;

import com.app.dto.restaurant.RestaurantDTO;
import com.app.dto.restaurant.RestaurantTagDTO;


public interface RestaurantDAO {
	public int saveApiRestaurant(RestaurantDTO restaurant);
	
	public List<RestaurantDTO> findAllRestaurants(String sort, String direction, String tag, int page, int limit);
	
	public RestaurantDTO getRestaurantById(Long id);
	
	public List<RestaurantDTO> findRestaurantsInBounds(double swLat, double swLng, double neLat, double neLng);

	public List<RestaurantTagDTO> getTagsByRestaurantId(int restaurantId);
}
