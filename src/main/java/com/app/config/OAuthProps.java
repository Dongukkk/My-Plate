package com.app.config;

public class OAuthProps {

    // 환경변수(또는 -D 시스템 프로퍼티)에서 읽기
    private static String require(String name) {
        String v = System.getenv(name);
        if (v == null || v.isBlank()) {
            v = System.getProperty(name); // java -DGOOGLE_CLIENT_ID=... 처럼도 허용
        }
        if (v == null || v.isBlank()) {
            throw new IllegalStateException("Missing secret: " + name);
        }
        return v;
    }
    
    //Google
    public static final String GOOGLE_CLIENT_ID     = require("GOOGLE_CLIENT_ID");
    public static final String GOOGLE_CLIENT_SECRET = require("GOOGLE_CLIENT_SECRET");
    public static final String GOOGLE_REDIRECT_URI  = "http://localhost:8080/MyPlate/api/oauth/google/callback";
    public static final String GOOGLE_AUTH_URL   = "https://accounts.google.com/o/oauth2/v2/auth";
    public static final String GOOGLE_TOKEN_URL  = "https://oauth2.googleapis.com/token";
    public static final String GOOGLE_USERINFO   = "https://www.googleapis.com/oauth2/v3/userinfo";
    public static final String GOOGLE_SCOPE      = "openid email profile";
    
    // NAVER
    public static final String NAVER_CLIENT_ID     = require("NAVER_CLIENT_ID");
    public static final String NAVER_CLIENT_SECRET = require("NAVER_CLIENT_SECRET");
    public static final String NAVER_REDIRECT_URI  = "http://localhost:8080/MyPlate/api/oauth/naver/callback";
    public static final String NAVER_AUTH_URL      = "https://nid.naver.com/oauth2.0/authorize";
    public static final String NAVER_TOKEN_URL     = "https://nid.naver.com/oauth2.0/token";
    public static final String NAVER_USERINFO      = "https://openapi.naver.com/v1/nid/me"; 
    public static final String NAVER_SCOPE         = "name email"; 
    
    
    // KAKAO
    public static final String KAKAO_CLIENT_ID     = require("KAKAO_CLIENT_ID");
    public static final String KAKAO_CLIENT_SECRET = require("KAKAO_CLIENT_SECRET"); // 발급 안했으면 빈 값 가능
    public static final String KAKAO_REDIRECT_URI  = "http://localhost:8080/MyPlate/api/oauth/kakao/callback";
    public static final String KAKAO_AUTH_URL   = "https://kauth.kakao.com/oauth/authorize";
    public static final String KAKAO_TOKEN_URL  = "https://kauth.kakao.com/oauth/token";
    public static final String KAKAO_USERINFO   = "https://kapi.kakao.com/v2/user/me";
    public static final String KAKAO_SCOPE      = "profile_nickname";
    
    
}
