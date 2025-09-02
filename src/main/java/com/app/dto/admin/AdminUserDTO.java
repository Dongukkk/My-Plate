package com.app.dto.admin;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class AdminUserDTO {
	
	private Long id;
    private String email;
    private String username;
    private String address;
    private String phoneNumber;
    private String role;
    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime leaveDate;

}
