package com.app.dao.admin;

import java.util.List;

import com.app.dto.admin.AdminRestaurantDTO;

public interface AdminDAO {

	List <AdminRestaurantDTO> findRestaurantList();
	
	AdminRestaurantDTO findRestaurantById(long id);
	int modifyAdminRestaurant(AdminRestaurantDTO dto);
	
	int saveAdminRestaurant(AdminRestaurantDTO dto);
	
	int DeleteAdminRestaurant(long id);
	
}
