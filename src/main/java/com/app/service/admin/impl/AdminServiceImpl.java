package com.app.service.admin.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.app.dao.admin.AdminDAO;
import com.app.dto.admin.AdminActionDTO;
import com.app.dto.admin.AdminReportDTO;
import com.app.dto.admin.AdminRestaurantDTO;
import com.app.dto.admin.AdminUserDTO;
import com.app.service.admin.AdminService;

@Service
public class AdminServiceImpl implements AdminService {

	@Autowired
	AdminDAO adminDAO;

	// 식당 관리
	@Override
	public List<AdminRestaurantDTO> findRestaurantList() {
		List<AdminRestaurantDTO> findRestaurantList = adminDAO.findRestaurantList();
		return findRestaurantList;
	}

	@Override
	public AdminRestaurantDTO findRestaurantById(long id) {
		return adminDAO.findRestaurantById(id);
	}

	@Override
	public int modifyAdminRestaurant(AdminRestaurantDTO dto) {
		if (dto == null)
			return 0;
		if (dto.getId() == 0) {
			throw new IllegalArgumentException("수정 대상 ID가 비어 있습니다.");
		}
		return adminDAO.modifyAdminRestaurant(dto);
	}

	@Override
	public int saveAdminRestaurant(AdminRestaurantDTO dto) {
		return adminDAO.saveAdminRestaurant(dto);
	}

	@Override
	public int DeleteAdminRestaurant(long id) {
		return adminDAO.DeleteAdminRestaurant(id);
	}

	// 사용자 관리
	@Override
	public List<AdminUserDTO> findUserList() {
		List<AdminUserDTO> findUserList = adminDAO.findUserList();
		return findUserList;
	}

	@Override
	public int DeleteAdminUser(long id) {
		return adminDAO.DeleteAdminUser(id);
	}

	@Override
	public AdminUserDTO findUserById(long id) {
		return adminDAO.findUserById(id);
	}

	@Override
	public int modifyAdminUser(AdminUserDTO dto) {
		if (dto == null)
			return 0;
		if (dto.getId() == 0) {
			throw new IllegalArgumentException("수정 대상 ID가 비어 있습니다.");
		}
		return adminDAO.modifyAdminUser(dto);
	}
	

	//신고관리
	//사용자신고
	@Override
	public List<AdminReportDTO> findUserReportList() {
		List<AdminReportDTO> findUserReportList = adminDAO.findUserReportList();
		return findUserReportList;
	}

	@Override
	public List<AdminReportDTO> findOTHReportList() {
		List<AdminReportDTO> findOTHReportList = adminDAO.findOTHReportList();
		return findOTHReportList;
	}

	@Override
	public List<AdminReportDTO> findRERReportList() {
		List<AdminReportDTO> findRERReportList = adminDAO.findRERReportList();
		return findRERReportList;
	}

	@Override
	public List<AdminReportDTO> findIPCReportList() {
		List<AdminReportDTO> findIPCReportList = adminDAO.findIPCReportList();
		return findIPCReportList;
	}

	
	@Override
	public AdminReportDTO searchURReportsById(long id) {
		return adminDAO.searchURReportsById(id);
	}
	@Override
	public int updateURReport(AdminReportDTO dto) {
		if (dto == null)
			return 0;
		if (dto.getId() == 0) {
			throw new IllegalArgumentException("수정 대상 ID가 비어 있습니다.");
		}
		return adminDAO.updateURReport(dto);
	}

	@Override
	public AdminReportDTO searchOTHReportsById(long id) {
		return adminDAO.searchOTHReportsById(id);
	}
	@Override
	public int updateOTHReport(AdminReportDTO dto) {
		if (dto == null)
			return 0;
		if (dto.getId() == 0) {
			throw new IllegalArgumentException("수정 대상 ID가 비어 있습니다.");
		}
		return adminDAO.updateOTHReport(dto);
	}

	@Override
	public AdminReportDTO searchRERReportsById(long id) {
		return adminDAO.searchRERReportsById(id);
	}
	@Override
	public int updateRERReport(AdminReportDTO dto) {
		if (dto == null)
			return 0;
		if (dto.getId() == 0) {
			throw new IllegalArgumentException("수정 대상 ID가 비어 있습니다.");
		}
		return adminDAO.updateRERReport(dto);
	}

	@Override
	public AdminReportDTO searchIPCReportsById(long id) {
		return adminDAO.searchIPCReportsById(id);
	}
	@Override
	public int updateIPCReport(AdminReportDTO dto) {
		if (dto == null)
			return 0;
		if (dto.getId() == 0) {
			throw new IllegalArgumentException("수정 대상 ID가 비어 있습니다.");
		}
		return adminDAO.updateIPCReport(dto);
	}
	
	
	/* 최근 처리 이력 */
	@Override
	public List<AdminActionDTO> findRecentActionsUR() {
		List<AdminActionDTO> findRecentActionsUR = adminDAO.findRecentActionsUR();
		return findRecentActionsUR;
	}

	@Override
	public List<AdminActionDTO> findRecentActionsOTH() {
		List<AdminActionDTO> findRecentActionsOTH = adminDAO.findRecentActionsOTH();
		return findRecentActionsOTH;
	}

	@Override
	public List<AdminActionDTO> findRecentActionsRER() {
		List<AdminActionDTO> findRecentActionsRER = adminDAO.findRecentActionsRER();
		return findRecentActionsRER;
	}

	@Override
	public List<AdminActionDTO> findRecentActionsIPC() {
		List<AdminActionDTO> findRecentActionsIPC = adminDAO.findRecentActionsIPC();
		return findRecentActionsIPC;
	}

	@Override
	public int processReport(AdminReportDTO dto) {
		 int n = adminDAO.updateReport(dto);
		    if (n == 1) {
		        adminDAO.insertReportAction(dto);
		    }
		    return n;
	}
	
	
	//로그인
    @Override
    public AdminUserDTO findAdminForLoginByEmail(String email) {
        if (email == null || email.isBlank()) return null;
        return adminDAO.findAdminForLoginByEmail(email);
    }
    
    
    
    
    /* 리뷰 부적절 콘텐츠 신고 생성(IPC) */
    @Override
    public int createIPCReport(AdminReportDTO dto) {
        if (dto == null) return 0;

        // 필수값 검증
        if (dto.getReporterId() <= 0) {
            throw new IllegalArgumentException("reporterId가 필요합니다.");
        }
        if (dto.getReportedItemId() <= 0) {
            throw new IllegalArgumentException("reportedItemId(리뷰ID)가 필요합니다.");
        }

        // 기본값 보정
        if (dto.getStatus() == null || dto.getStatus().isBlank()) dto.setStatus("PENDING");
        if (dto.getReason() == null || dto.getReason().isBlank()) dto.setReason("기타");
        if (dto.getExcerpt() == null) dto.setExcerpt("");

        // INSERT (MyBatis selectKey로 dto.id 세팅됨)
        return adminDAO.insertIPCReport(dto);
    }
	

}
