package com.app.security;

import java.util.Date;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.exceptions.TokenExpiredException;

public class JwtUtil {

    // 실제 서비스에서는 환경변수/설정 파일에서 불러오기
    private static final String SECRET_KEY = "myplate-secret-key";  
    private static final long ACCESS_TOKEN_EXPIRATION = 1000 * 60 * 30; // 30분
    private static final long REFRESH_TOKEN_EXPIRATION = 1000L * 60 * 60 * 24 * 7; // 7일

    // Access Token 발급
    public static String generateAccessToken(String email) {
        return JWT.create()
                .withSubject(email)
                .withExpiresAt(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRATION))
                .sign(Algorithm.HMAC256(SECRET_KEY));
    }

    // Refresh Token 발급
    public static String generateRefreshToken(String email) {
        return JWT.create()
                .withSubject(email)
                .withExpiresAt(new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRATION))
                .sign(Algorithm.HMAC256(SECRET_KEY));
    }

    // JWT 검증
    public static String validateToken(String token) {
    	try {
            return JWT.require(Algorithm.HMAC256(SECRET_KEY))
                    .build()
                    .verify(token)
                    .getSubject();
        } catch (TokenExpiredException e) {
            // 토큰 만료 예외 처리
            return "토큰이 만료되었습니다";
        } catch (JWTVerificationException e) {
            // 그 외 JWT 검증 실패 예외 처리 (예: 서명 불일치, 유효하지 않은 토큰 등)
            return "유효하지 않은 토큰입니다";
        }
    }
}