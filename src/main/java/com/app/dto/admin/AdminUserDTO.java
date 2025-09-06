package com.app.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class AdminUserDTO {
	
	private Long id;
    private String email;
    private String password;
    private String username;
    private String address;
    private String phoneNumber;
    private String role;
    private String status;

    private String createdAt;
    private String updatedAt;
    private String leaveDate;

}
