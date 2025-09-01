package com.app.service.admin;

import java.util.List;

import com.app.dto.admin.AdminRestaurantDTO;

public interface AdminService {
	
	List <AdminRestaurantDTO> findRestaurantList();
	
	AdminRestaurantDTO findRestaurantById(long id);
	int modifyAdminRestaurant(AdminRestaurantDTO dto);
	
	int saveAdminRestaurant(AdminRestaurantDTO dto);
	
	int DeleteAdminRestaurant(long id);

}
