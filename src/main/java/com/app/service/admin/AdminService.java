package com.app.service.admin;

import java.util.List;

import com.app.dto.admin.AdminRestaurantDTO;

public interface AdminService {
	
	List <AdminRestaurantDTO> findRestaurantList();
	
	int DeleteAdminRestaurant(long id);

}
