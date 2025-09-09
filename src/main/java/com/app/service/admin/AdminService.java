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
	List <AdminReportDTO> findOTHReportList();
	List <AdminReportDTO> findRERReportList();
	List <AdminReportDTO> findIPCReportList();
	
	//수정업데이트
	AdminReportDTO searchURReportsById(long id);
	int updateURReport(AdminReportDTO dto);
	
	AdminReportDTO searchOTHReportsById(long id);
	int updateOTHReport(AdminReportDTO dto);
	
	AdminReportDTO searchRERReportsById(long id);
	int updateRERReport(AdminReportDTO dto);
	
	AdminReportDTO searchIPCReportsById(long id);
	int updateIPCReport(AdminReportDTO dto);
	
	//최근 처리 이력
    List<AdminActionDTO> findRecentActionsUR(); 
    List<AdminActionDTO> findRecentActionsOTH();  
    List<AdminActionDTO> findRecentActionsRER();  
    List<AdminActionDTO> findRecentActionsIPC();  
    int processReport(AdminReportDTO dto);
    
    //로그인
    AdminUserDTO findAdminForLoginByEmail(String email);
    
    
    /* 신고 생성 */
    int createIPCReport(AdminReportDTO dto);
    int createRERReport(AdminReportDTO dto);
}
