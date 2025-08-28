package com.app.mapper;

import com.app.dto.UserDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
	
    int ping();

    int insertUser(UserDTO user);

    int existsByEmail(@Param("email") String email);
    int existsByUsername(@Param("username") String username);

    UserDTO findByEmail(@Param("email") String email);
    
}