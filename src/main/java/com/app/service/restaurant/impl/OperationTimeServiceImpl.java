package com.app.service.restaurant.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.app.dao.restaurant.OperationTimeDAO;
import com.app.dto.restaurant.OperationTimeDTO;
import com.app.service.restaurant.OperationTimeService;

@Service
public class OperationTimeServiceImpl implements OperationTimeService {

	@Autowired
	OperationTimeDAO operationTimeDAO;
	
	@Override
	public List<OperationTimeDTO> findByRestaurantId(long restaurantId) {
		return operationTimeDAO.findByRestaurantId(restaurantId);
	}

	@Override
	public List<OperationTimeDTO> findByRestaurantIdAndDayOfWeek(long restaurantId, int dayOfWeek) {
		return operationTimeDAO.findByRestaurantIdAndDayOfWeek(restaurantId, dayOfWeek);
	}

}
