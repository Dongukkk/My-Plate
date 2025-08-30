package com.app.dao.admin.impl;

import java.util.List;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.app.dao.admin.AdminDAO;
import com.app.dto.admin.AdminRestaurantDTO;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Repository
public class AdminDAOImpl implements AdminDAO {
	
	private static final String AM = "admin_mapper.";
	
	@Autowired
	SqlSessionTemplate sqlSessionTemplate;
	
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
	public int DeleteAdminRestaurant(long id) {
		AdminRestaurantDTO p = new AdminRestaurantDTO();
        p.setId((long) id);
        return sqlSessionTemplate.update(AM + "DeleteAdminRestaurant", p);
	}


}
