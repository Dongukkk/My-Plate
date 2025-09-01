package com.app.service.restaurant.impl;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.app.dao.restaurant.RestaurantDAO;
import com.app.dto.restaurant.RestaurantDTO;
import com.app.dto.restaurant.RestaurantTagDTO;
import com.app.service.restaurant.RestaurantService;

@Service
public class RestaurantServiceImpl implements RestaurantService{

	@Autowired
	RestaurantDAO restaurantDAO;
	
	
	@Override
	public List<RestaurantDTO> findAllRestaurants(String sort, String direction, int page, int limit) {
		
		return restaurantDAO.findAllRestaurants(sort, direction, page, limit);
	}

	@Override
	public RestaurantDTO getRestaurantById(Long id) {
		return restaurantDAO.getRestaurantById(id);
	}

	@Override
	public List<RestaurantDTO> findRestaurantsInBounds(double swLat, double swLng, double neLat, double neLng) {
		List<RestaurantDTO> restaurants = restaurantDAO.findRestaurantsInBounds(swLat, swLng, neLat, neLng);
		return restaurants.stream()
                .sorted(Comparator.comparing(
                    r -> r.getRatingCount() != null ? r.getRatingCount() : 0, 
                    Comparator.reverseOrder()
                ))
                .limit(100)
                .collect(Collectors.toList());
	}

	@Override
    public List<RestaurantTagDTO> getTagsByRestaurantId(int restaurantId) {
        return restaurantDAO.getTagsByRestaurantId(restaurantId);
    }
}
