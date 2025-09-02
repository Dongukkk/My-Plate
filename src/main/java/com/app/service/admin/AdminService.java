package com.app.service.admin;

import java.util.List;

import com.app.dto.admin.AdminReportDTO;
import com.app.dto.admin.AdminRestaurantDTO;
import com.app.dto.admin.AdminUserDTO;

public interface AdminService {
	
	//식당관리
	List <AdminRestaurantDTO> findRestaurantList();
	AdminRestaurantDTO findRestaurantById(long id);
	int modifyAdminRestaurant(AdminRestaurantDTO dto);	
	int saveAdminRestaurant(AdminRestaurantDTO dto);
	int DeleteAdminRestaurant(long id);
	
	//사용자관리
	List <AdminUserDTO> findUserList();
	int DeleteAdminUser(long id);
	AdminUserDTO findUserById(long id);
	int modifyAdminUser(AdminUserDTO dto);
	
	//신고관리
	//사용자신고
	List <AdminReportDTO> findUserReportList();
	List <AdminReportDTO> findOHTReportList();
	List <AdminReportDTO> findRERReportList();
	List <AdminReportDTO> findIPCReportList();
}
