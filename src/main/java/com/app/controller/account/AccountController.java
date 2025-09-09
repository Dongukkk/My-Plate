package com.app.controller.account;

import com.app.dto.account.PasswordChangeRequest;
import com.app.dto.user.BookmarkItemDTO;
import com.app.security.JwtUtil;
import com.app.service.AccountService;
import com.app.service.UserService;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.exceptions.TokenExpiredException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AccountController {

    @Autowired
    private AccountService accountService;
    
    @Autowired
    private UserService userService;

    /** Authorization 헤더의 Bearer 토큰에서 이메일(subject) 추출 */
    private String currentEmail(HttpServletRequest req) {
        String auth = req.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "NO_TOKEN");
        }

        String token = auth.substring(7);
        try {
            // ✅ JwtUtil은 기존 그대로 사용 (subject=email 반환)
            return JwtUtil.validateToken(token);
        } catch (TokenExpiredException e) {
            // 만료 → 401 (프론트 인터셉터가 /api/refresh 시도)
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "TOKEN_EXPIRED");
        } catch (JWTVerificationException e) {
            // 시그니처/형식 오류 → 401
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN");
        }
    }

    /** 비밀번호 변경 */
    @PostMapping("/password/change")
    public ResponseEntity<Map<String, Object>> changePassword(
            @RequestBody PasswordChangeRequest req,
            HttpServletRequest request
    ) {
        String email = currentEmail(request);   // JWT에서 이메일 추출
        System.out.println("[pw-change] email(from token) = " + email);

        accountService.changePassword(email, req);

        return ResponseEntity.ok(
                Collections.singletonMap("message", "비밀번호가 변경되었습니다.")
        );
    }
    
    @GetMapping("/account/bookmarks")
    public List<BookmarkItemDTO> myBookmarksV2(HttpServletRequest req) {
        String auth = req.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer "))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "NO_TOKEN");
        List<BookmarkItemDTO> bookmarks = userService.getMyBookmarks(auth);
        System.out.println(bookmarks);
        return bookmarks;
        
    }
}