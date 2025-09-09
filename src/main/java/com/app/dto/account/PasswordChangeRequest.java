package com.app.dto.account;

import lombok.Data;

@Data
public class PasswordChangeRequest {

	private String currentPassword;
	private String newPassword;
}
