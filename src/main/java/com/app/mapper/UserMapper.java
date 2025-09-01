package com.app.mapper;

import com.app.dto.UserDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface UserMapper {
	
    int ping();

    int insertUser(UserDTO user);

    int existsByEmail(@Param("email") String email);
    int existsByUsername(@Param("username") String username);

    UserDTO findByEmail(@Param("email") String email);
    
    @Update("UPDATE MP_USER SET PASSWORD = #{password} WHERE EMAIL = #{email}")
    int updatePasswordByEmail(@Param("email") String email,
                              @Param("password") String password);
}