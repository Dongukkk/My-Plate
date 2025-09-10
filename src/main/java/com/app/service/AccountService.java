package com.app.service;

import com.app.dto.account.PasswordChangeRequest;

public interface AccountService {

	void changePassword(String email, PasswordChangeRequest req);
}
