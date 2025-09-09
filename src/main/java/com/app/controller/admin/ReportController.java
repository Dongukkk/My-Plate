package com.app.controller.admin;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.app.dto.admin.AdminReportDTO;
import com.app.service.admin.AdminService;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class ReportController {

	@Autowired
	AdminService adminService;
	
	@PostMapping("/api/reports/ipc")
    public ResponseEntity<?> createIPC(@RequestBody AdminReportDTO dto) {
        // 필수값 검증
        if (dto == null || dto.getReporterId() <= 0) {
            return ResponseEntity.badRequest().body("reporterId is required");
        }
        if (dto.getReportedItemId() <= 0) {
            return ResponseEntity.badRequest().body("reportedItemId (reviewId) is required");
        }

        int r = adminService.createIPCReport(dto); // INSERT 수행, selectKey로 dto.id 채워짐
        if (r > 0) {
            Map<String, Object> body = new HashMap<>();
            body.put("id", dto.getId());     // 생성된 신고ID
            body.put("status", "CREATED");
            return ResponseEntity.status(HttpStatus.CREATED).body(body);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("insert failed");
    }
}
