package com.app.controller;

import com.app.dto.auth.ForgotPasswordRequest;
import com.app.dto.auth.ResetPasswordRequest;
import com.app.mapper.UserMapper;
import com.app.service.MailService;
import com.app.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import static com.app.security.PasswordUtil.hash; // ✅ 해시 유틸 정적 임포트

@RestController
@RequestMapping("/api/users")
public class PasswordController {

    @Autowired private UserMapper userMapper;
    @Autowired private MailService mailService;
    @Autowired private PasswordResetService passwordResetService;

    // 비밀번호 재설정 메일 발송 (항상 동일 응답: 계정 유무 노출 방지)
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String,String>> forgot(@RequestBody ForgotPasswordRequest req) {
        var user = userMapper.findByEmail(req.email);
        if (user != null) {
            String token = passwordResetService.issue(req.email, 30); // 30분 유효
            String link  = "http://localhost:3002/reset?token=" + token;
            mailService.sendPasswordResetLink(req.email, link);
        }
        return ResponseEntity.ok(
            Map.of("message", "해당 이메일의 계정이 있다면, 재설정 링크를 보냈습니다.")
        );
    }

    // 비밀번호 실제 변경
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String,String>> reset(@RequestBody ResetPasswordRequest req) {
        String email = passwordResetService.verify(req.token);
        if (email == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "토큰이 유효하지 않거나 만료되었습니다."));
        }

        // 해시 생성 후 DB 저장
        String hashed = hash(req.newPassword);
        userMapper.updatePasswordByEmail(email, hashed);

        passwordResetService.consume(req.token); // 일회용 처리
        return ResponseEntity.ok(
            Map.of("message", "비밀번호가 변경되었습니다. 로그인해주세요.")
        );
    }
}