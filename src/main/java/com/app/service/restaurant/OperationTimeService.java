package com.app.service.restaurant;

import java.util.List;

import com.app.dto.restaurant.OperationTimeDTO;

public interface OperationTimeService {

	List<OperationTimeDTO> findByRestaurantId(long restaurantId);
	
	List<OperationTimeDTO> findByRestaurantIdAndDayOfWeek(long restaurantId, int dayOfWeek);

}
