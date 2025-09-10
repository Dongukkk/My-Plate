package com.app.controller.admin;

import java.util.Map;
import java.util.Objects;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.app.dto.admin.AdminUserDTO;
import com.app.dto.admin.SessionAdmin;
import com.app.service.admin.AdminService;

//@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
public class AdminLoginController {
	
	@Autowired
	AdminService adminService;
	
	@Autowired(required = false)
    private PasswordEncoder passwordEncoder;
	
	public static class LoginReq {
        public String email;
        public String password;
    }

    /* 관리자 로그인 */
    @PostMapping("/api/admin/login")
    public ResponseEntity<?> login(@RequestBody LoginReq req, HttpSession session) {
        if (req == null || req.email == null || req.email.isBlank() || req.password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "이메일/비밀번호를 확인해주세요."));
        }

        AdminUserDTO u = adminService.findAdminForLoginByEmail(req.email);
        if (u == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인 실패"));
        }

        // 2) 비밀번호 검증
        String dbPw = u.getPassword();
        boolean matches = (passwordEncoder != null && dbPw != null && dbPw.startsWith("$2"))
                ? passwordEncoder.matches(req.password, dbPw)
                : Objects.equals(req.password, dbPw);
        if (!matches) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인 실패"));
        }

        // 3) 세션 저장 (비밀번호는 저장 금지)
        SessionAdmin sa = new SessionAdmin(u.getId(), u.getEmail(), u.getUsername(), u.getRole());
        session.setAttribute("SESSION_ADMIN", sa);

        return ResponseEntity.ok(sa);
    }

    /* 로그아웃 */
    @PostMapping("/api/admin/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("message", "ok"));
    }

    /* 세션 확인 */
    @GetMapping("/api/admin/me")
    public ResponseEntity<?> me(HttpSession session) {
        SessionAdmin sa = (SessionAdmin) session.getAttribute("SESSION_ADMIN");
        if (sa == null) return ResponseEntity.status(401).body(Map.of("message", "no-session"));
        return ResponseEntity.ok(sa);
    }

}
