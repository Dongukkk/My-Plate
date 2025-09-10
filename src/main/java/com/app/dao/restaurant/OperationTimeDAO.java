package com.app.dao.restaurant;

import java.util.List;

import com.app.dto.restaurant.OperationTimeDTO;

public interface OperationTimeDAO {
	
	List<OperationTimeDTO> findByRestaurantId(long restaurantId);
	
	List<OperationTimeDTO> findByRestaurantIdAndDayOfWeek(long restaurantId, int dayOfWeek);
}
