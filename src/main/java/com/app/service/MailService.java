package com.app.service;

public interface MailService {
	
	void sendPasswordResetLink(String toEmail, String link);
}
