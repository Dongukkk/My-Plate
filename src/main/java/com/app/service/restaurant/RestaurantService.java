package com.app.service.restaurant;

import java.util.List;

import com.app.dto.restaurant.RestaurantDTO;
import com.app.dto.restaurant.RestaurantTagDTO;
import com.app.dto.restaurant.TagCodeDTO;

public interface RestaurantService {
	public List<RestaurantDTO> findAllRestaurants(String sort, String direction, String tag, String query, int page, int limit);
	
	public RestaurantDTO getRestaurantById(Long id);
	
	public List<RestaurantDTO> findRestaurantsInBounds(double swLat, double swLng, double neLat, double neLng);

	public List<RestaurantTagDTO> getTagsByRestaurantId(long restaurantId);
	
	public List<TagCodeDTO> getAllTagCodes();
}
