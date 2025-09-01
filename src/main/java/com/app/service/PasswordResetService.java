package com.app.service;

public interface PasswordResetService {
	
	/** 유효기간(분) 지정해서 토큰을 만들고 반환 */
    String issue(String email, int ttlMinutes);

    /** 토큰이 유효하면 이메일 반환, 아니면 null */
    String verify(String token);

    /** 토큰을 사용 처리(소멸) */
    void consume(String token);
}
