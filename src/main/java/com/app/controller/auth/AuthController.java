package com.app.controller.auth;

import com.app.dto.auth.LoginRequest;
import com.app.dto.auth.LoginResponse;
import com.app.dto.user.UserResponse;
import com.app.dto.UserDTO;

import com.app.service.UserService;
import com.app.mapper.UserMapper;

import com.app.config.OAuthProps;
import com.app.dto.auth.GoogleTokenResponse;
import com.app.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.http.HttpEntity;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Map;

import javax.servlet.http.HttpSession;

import java.util.HashMap;
import java.util.Locale;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired private UserService userService;
    @Autowired private UserMapper userMapper;

    // =========================
    // 기본 로그인/토큰
    // =========================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            LoginResponse tokens = userService.login(req);
            return ResponseEntity.ok(tokens);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("서버 오류");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null) return ResponseEntity.status(401).build();

        String header = authHeader.trim();
        if (!header.toLowerCase(Locale.ROOT).startsWith("bearer "))
            return ResponseEntity.status(401).build();

        String token = header.substring(7).trim();
        UserResponse user = userService.me(token);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        String refresh = body.get("refresh");
        if (refresh == null || refresh.trim().isEmpty())
            return ResponseEntity.badRequest().body("refresh token is required");

        try {
            String email = JwtUtil.validateToken(refresh);
            String newAccess = JwtUtil.generateAccessToken(email);
            return ResponseEntity.ok(new LoginResponse(newAccess, refresh));
        } catch (Exception e) {
            return ResponseEntity.status(401).body("invalid refresh token");
        }
    }

    // =========================
    // Google OAuth
    // =========================

    /** 프런트에서 눌러 호출 → 구글 동의화면 URL 반환(Json) */
    @GetMapping("/oauth/google/url")
    public ResponseEntity<Map<String, String>> googleAuthUrl() {
    	String url = OAuthProps.GOOGLE_AUTH_URL
    	        + "?client_id="    + URLEncoder.encode(OAuthProps.GOOGLE_CLIENT_ID,    StandardCharsets.UTF_8)
    	        + "&redirect_uri=" + URLEncoder.encode(OAuthProps.GOOGLE_REDIRECT_URI, StandardCharsets.UTF_8)
    	        + "&response_type=code"
    	        + "&scope="        + URLEncoder.encode(OAuthProps.GOOGLE_SCOPE,        StandardCharsets.UTF_8)
    	        + "&access_type=offline"
    	        + "&prompt=" + URLEncoder.encode("consent select_account", StandardCharsets.UTF_8);       
    	return ResponseEntity.ok(Collections.singletonMap("url", url));
    }

    /** 구글에서 code 수신 → 토큰 교환 → 유저조회 → 업서트 → JWT 발급 → 프론트 콜백으로 302 */
    @GetMapping("/oauth/google/callback")
    public ResponseEntity<Void> OAuthCallback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String error) {

        final String feCallback = "http://localhost:3000/oauth/google/callback";

        // 에러/누락 방어
        if (error != null || code == null || code.trim().isEmpty()) {
            String fail = feCallback + "#error=" +
                    URLEncoder.encode(error == null ? "no_code" : error, StandardCharsets.UTF_8);
            HttpHeaders h = new HttpHeaders();
            h.setLocation(URI.create(fail));
            return new ResponseEntity<>(h, HttpStatus.FOUND);
        }

        // 1) code -> access_token
        RestTemplate rt = new RestTemplate();

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("code", code);
        form.add("client_id", OAuthProps.GOOGLE_CLIENT_ID);
        form.add("client_secret", OAuthProps.GOOGLE_CLIENT_SECRET);
        form.add("redirect_uri", OAuthProps.GOOGLE_REDIRECT_URI); // 구글 콘솔과 100% 일치 필수
        form.add("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> req = new HttpEntity<>(form, headers);

        GoogleTokenResponse gTok =
                rt.postForObject(OAuthProps.GOOGLE_TOKEN_URL, req, GoogleTokenResponse.class);

        if (gTok == null || gTok.access_token == null) {
            HttpHeaders h = new HttpHeaders();
            h.setLocation(URI.create(feCallback + "#error=token_exchange_failed"));
            return new ResponseEntity<>(h, HttpStatus.FOUND);
        }

        // 2) access_token -> userinfo
        @SuppressWarnings("unchecked")
        Map<String, Object> info =
                rt.getForObject(OAuthProps.GOOGLE_USERINFO + "?access_token=" + gTok.access_token, Map.class);

        if (info == null || info.get("email") == null) {
            HttpHeaders h = new HttpHeaders();
            h.setLocation(URI.create(feCallback + "#error=userinfo_failed"));
            return new ResponseEntity<>(h, HttpStatus.FOUND);
        }

        String email = String.valueOf(info.get("email"));
        String name  = (info.get("name") != null) ? String.valueOf(info.get("name")) : email.split("@")[0];
        String sub   = (info.get("sub")  != null) ? String.valueOf(info.get("sub"))  : null;

        if (sub == null || sub.trim().isEmpty()) {
            HttpHeaders h = new HttpHeaders();
            h.setLocation(URI.create(feCallback + "#error=no_sub"));
            return new ResponseEntity<>(h, HttpStatus.FOUND);
        }

        // 3) 업서트: (provider='GOOGLE', provider_id=sub) 우선
        HashMap<String,Object> p = new HashMap<>();
        p.put("provider", "GOOGLE");
        p.put("providerId", sub);
        UserDTO user = userMapper.findByProviderAndProviderId(p);

        if (user == null) {
            // 같은 이메일이 있으면 연결(간단 모드: 라벨 전환)
            UserDTO byEmail = userMapper.findByEmail(email);
            if (byEmail != null) {
                HashMap<String,Object> up = new HashMap<>();
                up.put("provider", "GOOGLE");
                up.put("providerId", sub);
                up.put("email", email);
                userMapper.updateProviderLink(up);
                user = userMapper.findByEmail(email); // 연결 후 재조회
            } else {
                // 신규 소셜 계정
                UserDTO newbie = new UserDTO();
                newbie.setEmail(email);
                newbie.setUsername(name);
                newbie.setProvider("GOOGLE");
                newbie.setProviderId(sub);
                // 비번은 사용 안하지만 NOT NULL 회피용 더미
                String dummy = new BCryptPasswordEncoder().encode(java.util.UUID.randomUUID().toString());
                newbie.setPassword(dummy);
                newbie.setAddress(" ");
                newbie.setPhoneNumber(" ");
                userMapper.insertOauthUser(newbie);

                user = userMapper.findByProviderAndProviderId(p);
            }
        }

        // 4) 우리 JWT 발급
        String access  = JwtUtil.generateAccessToken(email);
        String refresh = JwtUtil.generateRefreshToken(email);

        // 5) 프런트 콜백으로 302 redirect (해시로 전달)
        String redirect = feCallback
                + "#access="  + URLEncoder.encode(access,  StandardCharsets.UTF_8)
                + "&refresh=" + URLEncoder.encode(refresh, StandardCharsets.UTF_8);

        HttpHeaders h = new HttpHeaders();
        h.setLocation(URI.create(redirect));
        return new ResponseEntity<>(h, HttpStatus.FOUND);
    }
    
    // =========================
    // Naver OAuth
    // ========================= 
    
    @GetMapping("/oauth/naver/url")
    public ResponseEntity<Map<String, String>> naverAuthUrl(HttpSession session) {
        // CSRF 방지용 state
        String state = java.util.UUID.randomUUID().toString();
        session.setAttribute("NAVER_STATE", state);

        String url = OAuthProps.NAVER_AUTH_URL
                + "?response_type=code"
                + "&client_id="    + URLEncoder.encode(OAuthProps.NAVER_CLIENT_ID,    StandardCharsets.UTF_8)
                + "&redirect_uri=" + URLEncoder.encode(OAuthProps.NAVER_REDIRECT_URI, StandardCharsets.UTF_8)
                + "&state="        + URLEncoder.encode(state,                          StandardCharsets.UTF_8)
        		+ "&auth_type=reprompt";

        return ResponseEntity.ok(Collections.singletonMap("url", url));
    }
    
    @GetMapping("/oauth/naver/callback")
    public ResponseEntity<Void> naverCallback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error,
            HttpSession session) {

        final String feCallback = "http://localhost:3000/oauth/naver/callback";

        // 에러/누락/위조 state 방어
        Object saved = session.getAttribute("NAVER_STATE");
        boolean stateOk = (saved != null && saved.equals(state));
        if (error != null || code == null || code.trim().isEmpty() || !stateOk) {
            String fail = feCallback + "#error=" + URLEncoder.encode(
                    error != null ? error : (!stateOk ? "state_mismatch" : "no_code"),
                    StandardCharsets.UTF_8);
            HttpHeaders h = new HttpHeaders();
            h.setLocation(URI.create(fail));
            return new ResponseEntity<>(h, HttpStatus.FOUND);
        }

        RestTemplate rt = new RestTemplate();

        // code -> access_token
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "authorization_code");
        form.add("client_id", OAuthProps.NAVER_CLIENT_ID);
        form.add("client_secret", OAuthProps.NAVER_CLIENT_SECRET);
        form.add("code", code);
        form.add("state", state);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setAccept(java.util.Collections.singletonList(MediaType.APPLICATION_JSON)); // 중요
        HttpEntity<MultiValueMap<String, String>> req = new HttpEntity<>(form, headers);

        // ===== 토큰 교환 (디버그 출력) =====
        GoogleTokenResponse nTok;
        try {
            org.springframework.http.ResponseEntity<String> tokRes =
                    rt.postForEntity(OAuthProps.NAVER_TOKEN_URL, req, String.class);

            System.out.println("[NAVER TOK HTTP] " + tokRes.getStatusCode());
            System.out.println("[NAVER TOK BODY] " + tokRes.getBody());

            if (!tokRes.getStatusCode().is2xxSuccessful()) {
                HttpHeaders h = new HttpHeaders();
                h.setLocation(URI.create(feCallback + "#error=token_exchange_failed"));
                return new ResponseEntity<>(h, HttpStatus.FOUND);
            }

            com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
            nTok = om.readValue(tokRes.getBody(), GoogleTokenResponse.class);

        } catch (org.springframework.web.client.HttpStatusCodeException ex) {
            System.out.println("[NAVER TOK ERROR HTTP] " + ex.getStatusCode());
            System.out.println("[NAVER TOK ERROR BODY] " + ex.getResponseBodyAsString());
            HttpHeaders h = new HttpHeaders();
            h.setLocation(URI.create(feCallback + "#error=token_exchange_failed"));
            return new ResponseEntity<>(h, HttpStatus.FOUND);

        } catch (Exception ex) {
            ex.printStackTrace();
            HttpHeaders h = new HttpHeaders();
            h.setLocation(URI.create(feCallback + "#error=token_exchange_failed"));
            return new ResponseEntity<>(h, HttpStatus.FOUND);
        }

        if (nTok == null || nTok.access_token == null) {
            HttpHeaders h = new HttpHeaders();
            h.setLocation(URI.create(feCallback + "#error=token_exchange_failed"));
            return new ResponseEntity<>(h, HttpStatus.FOUND);
        }

        // ===== userinfo 조회 =====
        HttpHeaders h2 = new HttpHeaders();
        h2.setBearerAuth(nTok.access_token);
        HttpEntity<Void> req2 = new HttpEntity<>(h2);

        org.springframework.http.ResponseEntity<Map> uiRes =
                rt.exchange(OAuthProps.NAVER_USERINFO, HttpMethod.GET, req2, Map.class);

        System.out.println("[NAVER USERINFO HTTP] " + uiRes.getStatusCode());
        System.out.println("[NAVER USERINFO BODY] " + uiRes.getBody());

        @SuppressWarnings("unchecked")
        Map<String, Object> body = uiRes.getBody();

        // body 검증 (resultcode == "00" & response 존재)
        if (body == null || body.get("response") == null) {
            HttpHeaders h = new HttpHeaders();
            h.setLocation(URI.create(feCallback + "#error=userinfo_failed"));
            return new ResponseEntity<>(h, HttpStatus.FOUND);
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> resp = (Map<String, Object>) body.get("response");
        String providerId = resp.get("id") != null ? String.valueOf(resp.get("id")) : null;
        String email      = resp.get("email") != null ? String.valueOf(resp.get("email")) : null;
        String name       = resp.get("name")  != null ? String.valueOf(resp.get("name"))
                                                      : (email != null ? email.split("@")[0] : "naver_" + providerId);

        if (providerId == null || providerId.trim().isEmpty()) {
            HttpHeaders h = new HttpHeaders();
            h.setLocation(URI.create(feCallback + "#error=no_id"));
            return new ResponseEntity<>(h, HttpStatus.FOUND);
        }
        if (email == null || email.trim().isEmpty()) {
            HttpHeaders h = new HttpHeaders();
            h.setLocation(URI.create(feCallback + "#error=email_scope_required"));
            return new ResponseEntity<>(h, HttpStatus.FOUND);
        }

        // 업서트
        HashMap<String,Object> p = new HashMap<>();
        p.put("provider", "NAVER");
        p.put("providerId", providerId);
        UserDTO user = userMapper.findByProviderAndProviderId(p);

        if (user == null) {
            UserDTO byEmail = userMapper.findByEmail(email);
            if (byEmail != null) {
                HashMap<String,Object> up = new HashMap<>();
                up.put("provider", "NAVER");
                up.put("providerId", providerId);
                up.put("email", email);
                userMapper.updateProviderLink(up);
                user = userMapper.findByEmail(email);
            } else {
                UserDTO newbie = new UserDTO();
                newbie.setEmail(email);
                newbie.setUsername(name);
                newbie.setProvider("NAVER");
                newbie.setProviderId(providerId);
                String dummy = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder()
                        .encode(java.util.UUID.randomUUID().toString());
                newbie.setPassword(dummy);
                newbie.setAddress(" ");
                newbie.setPhoneNumber(" ");
                userMapper.insertOauthUser(newbie);

                user = userMapper.findByProviderAndProviderId(p);
            }
        }

        // 우리 JWT 발급 → FE로 302
        String access  = JwtUtil.generateAccessToken(email);
        String refresh = JwtUtil.generateRefreshToken(email);

        String redirect = feCallback
                + "#access="  + URLEncoder.encode(access,  StandardCharsets.UTF_8)
                + "&refresh=" + URLEncoder.encode(refresh, StandardCharsets.UTF_8);

        HttpHeaders h = new HttpHeaders();
        h.setLocation(URI.create(redirect));
        return new ResponseEntity<>(h, HttpStatus.FOUND);
    }
    
    // =========================
    // Kakao OAuth
    // ========================= 
    
    // 동의화면 URL
    @GetMapping("/oauth/kakao/url")
    public ResponseEntity<Map<String,String>> kakaoAuthUrl() {
        String url = OAuthProps.KAKAO_AUTH_URL
                + "?client_id="    + URLEncoder.encode(OAuthProps.KAKAO_CLIENT_ID, StandardCharsets.UTF_8)
                + "&redirect_uri=" + URLEncoder.encode(OAuthProps.KAKAO_REDIRECT_URI, StandardCharsets.UTF_8)
                + "&response_type=code"
                + "&scope="        + URLEncoder.encode(OAuthProps.KAKAO_SCOPE, StandardCharsets.UTF_8)
                + "&prompt=login";
        return ResponseEntity.ok(java.util.Collections.singletonMap("url", url));
    }

    // 콜백
    @GetMapping("/oauth/kakao/callback")
    public ResponseEntity<Void> kakaoCallback(
            @RequestParam(required=false) String code,
            @RequestParam(required=false) String error) {

        final String feCallback = "http://localhost:3000/oauth/kakao/callback";

        if (error != null || code == null || code.isBlank()) {
            HttpHeaders h = new HttpHeaders();
            h.setLocation(URI.create(feCallback + "#error=" +
                    URLEncoder.encode(error == null ? "no_code" : error, StandardCharsets.UTF_8)));
            return new ResponseEntity<>(h, HttpStatus.FOUND);
        }

        RestTemplate rt = new RestTemplate();

        // 1) code -> access_token
        MultiValueMap<String,String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "authorization_code");
        form.add("client_id", OAuthProps.KAKAO_CLIENT_ID);
        form.add("redirect_uri", OAuthProps.KAKAO_REDIRECT_URI);
        form.add("code", code);
        if (OAuthProps.KAKAO_CLIENT_SECRET != null && !OAuthProps.KAKAO_CLIENT_SECRET.isBlank()) {
            form.add("client_secret", OAuthProps.KAKAO_CLIENT_SECRET);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String,String>> req = new HttpEntity<>(form, headers);

        // GoogleTokenResponse 재사용 가능(필드 동일)
        com.app.dto.auth.GoogleTokenResponse kTok =
                rt.postForObject(OAuthProps.KAKAO_TOKEN_URL, req, com.app.dto.auth.GoogleTokenResponse.class);

        if (kTok == null || kTok.access_token == null) {
            HttpHeaders h = new HttpHeaders();
            h.setLocation(URI.create(feCallback + "#error=token_exchange_failed"));
            return new ResponseEntity<>(h, HttpStatus.FOUND);
        }

        // 2) userinfo
        HttpHeaders h2 = new HttpHeaders();
        h2.setBearerAuth(kTok.access_token);
        HttpEntity<Void> req2 = new HttpEntity<>(h2);

        @SuppressWarnings("unchecked")
        Map<String,Object> body = rt.exchange(
                OAuthProps.KAKAO_USERINFO, HttpMethod.GET, req2, Map.class).getBody();

        if (body == null) {
            HttpHeaders h = new HttpHeaders();
            h.setLocation(URI.create(feCallback + "#error=userinfo_failed"));
            return new ResponseEntity<>(h, HttpStatus.FOUND);
        }

        String providerId = String.valueOf(body.get("id"));
        Map<String,Object> account = (Map<String,Object>) body.get("kakao_account");
        String email = (account != null && account.get("email") != null) ? String.valueOf(account.get("email")) : null;
        Map<String,Object> profile = (account != null) ? (Map<String,Object>) account.get("profile") : null;
        String name = (profile != null && profile.get("nickname") != null)
                ? String.valueOf(profile.get("nickname"))
                : (email != null ? email.split("@")[0] : "kakao_" + providerId);

        if (providerId == null || providerId.isBlank()) {
            HttpHeaders h = new HttpHeaders();
            h.setLocation(URI.create(feCallback + "#error=no_id"));
            return new ResponseEntity<>(h, HttpStatus.FOUND);
        }
        
        // email 권한이 없어 가짜 이메일 부여 
        if (email == null || email.isBlank()) {
            email = "kakao_" + providerId + "@kakao.local";
        }

        // 3) 업서트 (provider='KAKAO')
        HashMap<String,Object> p = new HashMap<>();
        p.put("provider", "KAKAO");
        p.put("providerId", providerId);

        com.app.dto.UserDTO user = userMapper.findByProviderAndProviderId(p);

        // 가짜 이메일인지 확인
        boolean isPseudoEmail = (email != null && email.endsWith("@kakao.local"));

        if (user == null) {
            // ① 진짜 이메일일 때만 기존 계정과 연결
            if (!isPseudoEmail) {
                com.app.dto.UserDTO byEmail = userMapper.findByEmail(email);
                if (byEmail != null) {
                    HashMap<String,Object> up = new HashMap<>();
                    up.put("provider", "KAKAO");
                    up.put("providerId", providerId);
                    up.put("email", email);
                    userMapper.updateProviderLink(up);
                    user = userMapper.findByEmail(email); // 연결 후 재조회
                }
            }

            // ② 그래도 없으면 신규 생성 (가짜/진짜 이메일 모두 허용)
            if (user == null) {
                com.app.dto.UserDTO newbie = new com.app.dto.UserDTO();
                // 가능하면 이메일은 소문자로 저장
                newbie.setEmail(email != null ? email.toLowerCase(java.util.Locale.ROOT) : null);
                newbie.setUsername(name);
                newbie.setProvider("KAKAO");
                newbie.setProviderId(providerId);
                String dummy = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder()
                        .encode(java.util.UUID.randomUUID().toString());
                newbie.setPassword(dummy);
                newbie.setAddress(" ");
                newbie.setPhoneNumber(" ");
                userMapper.insertOauthUser(newbie);

                user = userMapper.findByProviderAndProviderId(p);
            }
        }

        // 4) JWT 발급 + 프런트로 리다이렉트
        String access  = com.app.security.JwtUtil.generateAccessToken(email);
        String refresh = com.app.security.JwtUtil.generateRefreshToken(email);

        String redirect = feCallback + "#access=" + URLEncoder.encode(access, StandardCharsets.UTF_8)
                                       + "&refresh=" + URLEncoder.encode(refresh, StandardCharsets.UTF_8);
        HttpHeaders h = new HttpHeaders();
        h.setLocation(URI.create(redirect));
        return new ResponseEntity<>(h, HttpStatus.FOUND);
    }
    
}