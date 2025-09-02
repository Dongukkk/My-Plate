package com.app.service.admin.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.app.dao.admin.AdminDAO;
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

}
