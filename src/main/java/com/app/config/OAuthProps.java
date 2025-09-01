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

    public static final String GOOGLE_CLIENT_ID     = require("GOOGLE_CLIENT_ID");
    public static final String GOOGLE_CLIENT_SECRET = require("GOOGLE_CLIENT_SECRET");

    public static final String GOOGLE_REDIRECT_URI  =
            "http://localhost:8080/MyPlate/api/oauth/google/callback";

    public static final String GOOGLE_AUTH_URL   = "https://accounts.google.com/o/oauth2/v2/auth";
    public static final String GOOGLE_TOKEN_URL  = "https://oauth2.googleapis.com/token";
    public static final String GOOGLE_USERINFO   = "https://www.googleapis.com/oauth2/v3/userinfo";
    public static final String GOOGLE_SCOPE      = "openid email profile";
}