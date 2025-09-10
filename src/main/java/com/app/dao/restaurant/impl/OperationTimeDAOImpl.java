package com.app.dao.restaurant.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.app.dao.restaurant.OperationTimeDAO;
import com.app.dto.restaurant.OperationTimeDTO;

@Repository
public class OperationTimeDAOImpl implements OperationTimeDAO{

	@Autowired
	SqlSessionTemplate sqlSessionTemplate;
	
	
	@Override
	public List<OperationTimeDTO> findByRestaurantId(long restaurantId) {
		return sqlSessionTemplate.selectList("operationTime_mapper.findByRestaurantId", restaurantId);
	}

	@Override
	public List<OperationTimeDTO> findByRestaurantIdAndDayOfWeek(long restaurantId, int dayOfWeek) {
		Map<String, Object> params = new HashMap<>();
	    
	    params.put("restaurantId", restaurantId);
	    params.put("dayOfWeek", dayOfWeek);
		
		return sqlSessionTemplate.selectList("operationTime_mapper.findByRestaurantIdAndDayOfWeek", params);
	}

}
