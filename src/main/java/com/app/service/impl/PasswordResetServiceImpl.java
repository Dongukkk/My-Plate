package com.app.service.impl;

import com.app.service.PasswordResetService;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PasswordResetServiceImpl implements PasswordResetService {

    private static class Entry {
        final String email;
        final Instant expiresAt;
        Entry(String email, Instant expiresAt) {
            this.email = email; this.expiresAt = expiresAt;
        }
    }

    private final Map<String, Entry> store = new ConcurrentHashMap<>();
    private final SecureRandom rnd = new SecureRandom();

    private String newToken() {
        byte[] b = new byte[32];       // 256bit
        rnd.nextBytes(b);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(b);
    }

    @Override
    public String issue(String email, int ttlMinutes) {
        String token = newToken();
        store.put(token, new Entry(email, Instant.now().plusSeconds(ttlMinutes * 60L)));
        return token;
    }

    @Override
    public String verify(String token) {
        Entry e = store.get(token);
        if (e == null) return null;
        if (Instant.now().isAfter(e.expiresAt)) {
            store.remove(token);
            return null;
        }
        return e.email;
    }

    @Override
    public void consume(String token) {
        store.remove(token);
    }
}
