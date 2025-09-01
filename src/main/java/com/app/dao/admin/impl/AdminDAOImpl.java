package com.app.dao.admin.impl;

import java.util.List;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.app.dao.admin.AdminDAO;
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


}
