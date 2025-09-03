package com.app.security;

import org.mindrot.jbcrypt.BCrypt;

public class PasswordUtil {
    public static String hash(String raw) {
        return BCrypt.hashpw(raw, BCrypt.gensalt(12)); // 라운드 12
    }
    public static boolean matches(String raw, String hashed) {
        return BCrypt.checkpw(raw, hashed);
    }
    public static boolean isBCrypt(String value){
        return value != null && value.startsWith("$2");
    }
}
