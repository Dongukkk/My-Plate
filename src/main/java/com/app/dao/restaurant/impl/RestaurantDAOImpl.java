package com.app.dao.restaurant.impl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.app.dao.restaurant.RestaurantDAO;
import com.app.dto.restaurant.RestaurantDTO;
import com.app.dto.restaurant.RestaurantTagDTO;

@Repository
public class RestaurantDAOImpl implements RestaurantDAO {
	
	@Autowired
	SqlSessionTemplate sqlSessionTemplate;
	
	@Override
	public int saveApiRestaurant(RestaurantDTO restaurant) {

		int rst = sqlSessionTemplate.insert("restaurant_mapper.saveApiRestaurant", restaurant);
		
		return rst;
	}

	@Override
	public List<RestaurantDTO> findAllRestaurants(String sort, String direction, String tag, String query, int page, int limit) {
		Map<String, Object> params = new HashMap<>();
	    
	    int offset = (page - 1) * limit;
	    
	    List<String> tagList = null;
	    if (tag != null && !tag.isEmpty()) {
	        tagList = new ArrayList<>(Arrays.asList(tag.split(",")));
	    }
	    
	    params.put("sort", sort);
	    params.put("direction", direction);
	    params.put("query", query);
	    
	    if (tagList != null) {
	        params.put("tags", tagList);
	    }
	    params.put("limit", limit);
	    params.put("offset", offset);
	    params.put("tagCount", (tagList != null ? tagList.size() : 0));
	    
		return sqlSessionTemplate.selectList("restaurant_mapper.findAllRestaurants", params);
	}

	@Override
	public RestaurantDTO getRestaurantById(Long id) {
		
		return sqlSessionTemplate.selectOne("restaurant_mapper.getRestaurantById", id);
	}

	@Override
	public List<RestaurantDTO> findRestaurantsInBounds(double swLat, double swLng, double neLat, double neLng) {
		Map<String, Object> params = new HashMap<>();
		
	    params.put("swLat", swLat);
	    params.put("swLng", swLng);
	    params.put("neLat", neLat);
	    params.put("neLng", neLng);
	    
		return sqlSessionTemplate.selectList("restaurant_mapper.findRestaurantsInBounds", params);
	}

	@Override
	public List<RestaurantTagDTO> getTagsByRestaurantId(long restaurantId) {
		return sqlSessionTemplate.selectList("restaurant_mapper.getTagsByRestaurantId", restaurantId);
	}

}
