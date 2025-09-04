package com.app.service.restaurant.impl;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.app.dao.restaurant.RestaurantDAO;
import com.app.dto.restaurant.RestaurantDTO;
import com.app.dto.restaurant.RestaurantTagDTO;
import com.app.dto.restaurant.TagCodeDTO;
import com.app.service.restaurant.RestaurantService;

@Service
public class RestaurantServiceImpl implements RestaurantService{

	@Autowired
	RestaurantDAO restaurantDAO;
	
	
	@Override
	public List<RestaurantDTO> findAllRestaurants(String sort, String direction, String tag, String query, int page, int limit) {
		List<RestaurantDTO> restList = restaurantDAO.findAllRestaurants(sort, direction, tag, query, page, limit);
		
		for(RestaurantDTO dto:restList) {
			dto.setTags(getTagsByRestaurantId(dto.getId()));
		}
		return restList;
		
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
    public List<RestaurantTagDTO> getTagsByRestaurantId(long restaurantId) {
        return restaurantDAO.getTagsByRestaurantId(restaurantId);
    }

	@Override
	public List<TagCodeDTO> getAllTagCodes() {
		return restaurantDAO.getAllTagCodes();
	}

	@Override
	public int updateAllRatingCounts() {
		return restaurantDAO.updateAllRatingCounts();
	}
}
