package com.app.dao.admin;

import java.util.List;

import com.app.dto.admin.AdminRestaurantDTO;

public interface AdminDAO {

	List <AdminRestaurantDTO> findRestaurantList();
	
	
	int DeleteAdminRestaurant(long id);
	
}
