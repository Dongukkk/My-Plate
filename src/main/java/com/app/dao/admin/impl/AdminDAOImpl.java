package com.app.dao.admin.impl;

import java.util.List;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.app.dao.admin.AdminDAO;
import com.app.dto.admin.AdminActionDTO;
import com.app.dto.admin.AdminReportDTO;
import com.app.dto.admin.AdminRestaurantDTO;
import com.app.dto.admin.AdminUserDTO;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Repository
public class AdminDAOImpl implements AdminDAO {
	
	private static final String AM = "admin_mapper.";
	
	@Autowired
	SqlSessionTemplate sqlSessionTemplate;
	
	//식당 관리
	@Override
	public List<AdminRestaurantDTO> findRestaurantList() {
		List<AdminRestaurantDTO> adminRestaurantList = sqlSessionTemplate.selectList(AM + "findRestaurantList");
		return adminRestaurantList;
	}
	
	@Override
    public AdminRestaurantDTO findRestaurantById(long id) {
        return sqlSessionTemplate.selectOne(AM + "findRestaurantById", id);
    }

    @Override
    public int modifyAdminRestaurant(AdminRestaurantDTO dto) {
        return sqlSessionTemplate.update(AM + "modifyAdminRestaurant", dto);
    }
	
	@Override
	public int saveAdminRestaurant(AdminRestaurantDTO dto) {
		return sqlSessionTemplate.insert(AM + "saveAdminRestaurant", dto);
	}
    
	@Override
	public int DeleteAdminRestaurant(long id) {
		AdminRestaurantDTO p = new AdminRestaurantDTO();
        p.setId((long) id);
        return sqlSessionTemplate.update(AM + "DeleteAdminRestaurant", p);
	}

	
	//사용자 관리
	@Override
	public List<AdminUserDTO> findUserList() {
		List<AdminUserDTO> findUserList = sqlSessionTemplate.selectList(AM + "findUserList");
		return findUserList;
	}

	@Override
	public int DeleteAdminUser(long id) {
		AdminUserDTO p = new AdminUserDTO();
        p.setId((long) id);
        return sqlSessionTemplate.update(AM + "DeleteAdminUser", p);
	}

	@Override
	public AdminUserDTO findUserById(long id) {
		return sqlSessionTemplate.selectOne(AM + "findUserById", id);
	}

	@Override
	public int modifyAdminUser(AdminUserDTO dto) {
		 return sqlSessionTemplate.update(AM + "modifyAdminUser", dto);
	}

	
	//신고관리
	//신고목록
	@Override
	public List<AdminReportDTO> findUserReportList() {
		List<AdminReportDTO> findUserReportList = sqlSessionTemplate.selectList(AM + "findUserReportList");
		return findUserReportList;
	}
	@Override
	public List<AdminReportDTO> findOHTReportList() {
		List<AdminReportDTO> findOHTReportList = sqlSessionTemplate.selectList(AM + "findOHTReportList");
		return findOHTReportList;
	}
	@Override
	public List<AdminReportDTO> findRERReportList() {
		List<AdminReportDTO> findRERReportList = sqlSessionTemplate.selectList(AM + "findRERReportList");
		return findRERReportList;
	}
	@Override
	public List<AdminReportDTO> findIPCReportList() {
		List<AdminReportDTO> findIPCReportList = sqlSessionTemplate.selectList(AM + "findIPCReportList");
		return findIPCReportList;
	}

	@Override
	public AdminReportDTO searchURReportsById(long id) {
		return sqlSessionTemplate.selectOne(AM + "searchURReportsById", id);
	}

	@Override
	public int updateURReport(AdminReportDTO dto) {
		 return sqlSessionTemplate.update(AM + "updateURReport", dto);
	}

	@Override
	public AdminReportDTO searchOHTReportsById(long id) {
		return sqlSessionTemplate.selectOne(AM + "searchOHTReportsById", id);
	}

	@Override
	public int updateOHTReport(AdminReportDTO dto) {
		 return sqlSessionTemplate.update(AM + "updateOHTReport", dto);
	}

	@Override
	public AdminReportDTO searchRERReportsById(long id) {
		return sqlSessionTemplate.selectOne(AM + "searchRERReportsById", id);
	}

	@Override
	public int updateRERReport(AdminReportDTO dto) {
		 return sqlSessionTemplate.update(AM + "updateRERReport", dto);
	}

	@Override
	public AdminReportDTO searchIPCReportsById(long id) {
		return sqlSessionTemplate.selectOne(AM + "searchIPCReportsById", id);
	}

	@Override
	public int updateIPCReport(AdminReportDTO dto) {
		 return sqlSessionTemplate.update(AM + "updateIPCReport", dto);
	}

	@Override
	public List<AdminActionDTO> findRecentActionsUR() {
		List<AdminActionDTO> findRecentActionsUR = sqlSessionTemplate.selectList(AM + "findRecentActionsUR");
		return findRecentActionsUR;
	}

	@Override
	public List<AdminActionDTO> findRecentActionsOHT() {
		List<AdminActionDTO> findRecentActionsOHT = sqlSessionTemplate.selectList(AM + "findRecentActionsOHT");
		return findRecentActionsOHT;
	}

	@Override
	public List<AdminActionDTO> findRecentActionsRER() {
		List<AdminActionDTO> findRecentActionsRER = sqlSessionTemplate.selectList(AM + "findRecentActionsRER");
		return findRecentActionsRER;
	}

	@Override
	public List<AdminActionDTO> findRecentActionsIPC() {
		List<AdminActionDTO> findRecentActionsIPC = sqlSessionTemplate.selectList(AM + "findRecentActionsIPC");
		return findRecentActionsIPC;
	}

    @Override
    public int updateReport(AdminReportDTO dto) {
        return sqlSessionTemplate.update(AM + "updateReport", dto);
    }

    @Override
    public int insertReportAction(AdminReportDTO dto) {
        return sqlSessionTemplate.insert(AM + "insertReportAction", dto);
    }
	

}
