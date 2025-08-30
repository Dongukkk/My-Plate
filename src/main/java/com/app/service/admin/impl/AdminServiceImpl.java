package com.app.service.admin.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.dao.admin.AdminDAO;
import com.app.dto.admin.AdminRestaurantDTO;
import com.app.service.admin.AdminService;

@Service
public class AdminServiceImpl implements AdminService {

	@Autowired
	AdminDAO adminDAO;

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
        if (dto == null) return 0;
        if (dto.getId() == 0) {
            throw new IllegalArgumentException("수정 대상 ID가 비어 있습니다.");
        }
        int affected = adminDAO.modifyAdminRestaurant(dto);
        return affected;
    }
	

	@Override
	public int DeleteAdminRestaurant(long id) {
		return adminDAO.DeleteAdminRestaurant(id);
	}

	
	
	
}
