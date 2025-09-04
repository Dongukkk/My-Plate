package com.app.service.admin;

import java.util.List;

import com.app.dto.admin.AdminActionDTO;
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
	//신고 목록
	List <AdminReportDTO> findUserReportList();
	List <AdminReportDTO> findOHTReportList();
	List <AdminReportDTO> findRERReportList();
	List <AdminReportDTO> findIPCReportList();
	
	//수정업데이트
	AdminReportDTO searchURReportsById(long id);
	int updateURReport(AdminReportDTO dto);
	
	AdminReportDTO searchOHTReportsById(long id);
	int updateOHTReport(AdminReportDTO dto);
	
	AdminReportDTO searchRERReportsById(long id);
	int updateRERReport(AdminReportDTO dto);
	
	AdminReportDTO searchIPCReportsById(long id);
	int updateIPCReport(AdminReportDTO dto);
	
	//최근 처리 이력
    List<AdminActionDTO> findRecentActionsUR(); 
    List<AdminActionDTO> findRecentActionsOHT();  
    List<AdminActionDTO> findRecentActionsRER();  
    List<AdminActionDTO> findRecentActionsIPC();  
    int processReport(AdminReportDTO dto);
}
