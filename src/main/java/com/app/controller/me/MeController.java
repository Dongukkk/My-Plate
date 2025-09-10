package com.app.controller.me;

import com.app.dto.stats.MonthlyStatDTO;
import com.app.dto.user.ReviewBrief;
import com.app.dto.user.UserStats;
import com.app.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MeController {

    private final UserService userService;

    // 이름 변경
    @PostMapping(value = "/me/name", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateName(
            @RequestHeader(name = "Authorization", required = false) String authorization,
            @RequestBody Map<String, Object> body
    ) {
        String username = Objects.toString(body.get("username"), "").trim();
        if (username.isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "username 필수"));
        }

        // 서비스에 위임 (Authorization 헤더 그대로 전달)
        userService.updateMyName(authorization, username);
        return ResponseEntity.ok().build();
    }

    // KPI
    @GetMapping("/me/stats")
    public ResponseEntity<UserStats> stats(
            @RequestHeader(name = "Authorization", required = false) String authorization
    ) {
        return ResponseEntity.ok(userService.getMyStats(authorization));
    }
    
    // 리뷰 목록
    @GetMapping("/me/reviews")
    public ResponseEntity<List<ReviewBrief>> recentReviews(
            @RequestHeader(name = "Authorization", required = false) String authorization,
            @RequestParam(name = "limit", defaultValue = "3") int limit) {
        return ResponseEntity.ok(userService.getMyRecentReviews(authorization, limit));
    }
    
    @GetMapping("/me/stats/monthly")
    public ResponseEntity<List<MonthlyStatDTO>> monthlyStats(
            @RequestHeader(name = "Authorization", required = false) String authorization,
            @RequestParam(name = "months", defaultValue = "12") int months
    ) {
        return ResponseEntity.ok(userService.getMyMonthlyStats(authorization, months));
    }
}