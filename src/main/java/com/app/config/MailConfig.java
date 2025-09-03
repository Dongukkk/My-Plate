package com.app.config;

import java.util.Properties;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

@Configuration
public class MailConfig {
	
	@Bean
	public JavaMailSender mailSender() {
		
		JavaMailSenderImpl ms = new JavaMailSenderImpl();
		
		//Naver (하드코딩)
		ms.setHost("smtp.naver.com");
		ms.setPort(587);
		ms.setUsername("s2ngkwon2@naver.com");
		ms.setPassword("KP9RU8KMYV8T");
		
		ms.setDefaultEncoding("UTF-8");
		
		Properties p = ms.getJavaMailProperties();
		p.put("mail.smtp.auth", "true");
        p.put("mail.smtp.starttls.enable", "true");
        p.put("mail.smtp.connectiontimeout", "5000");
        p.put("mail.smtp.timeout", "5000");
        p.put("mail.smtp.writetimeout", "5000");
        p.put("mail.smtp.ssl.trust", "smtp.naver.com");
		
        return ms;
	}
}
