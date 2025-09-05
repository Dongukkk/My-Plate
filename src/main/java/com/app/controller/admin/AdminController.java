package com.app.controller.admin;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.app.dto.admin.AdminActionDTO;
import com.app.dto.admin.AdminReportDTO;
import com.app.dto.admin.AdminRestaurantDTO;
import com.app.dto.admin.AdminUserDTO;
import com.app.service.admin.AdminService;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class AdminController {
	
	@Autowired
	AdminService adminService;

	/* 식당 조회 */
	@GetMapping("/api/adminRestaurant")
	public List<AdminRestaurantDTO> registerRestaurantList() {
		return adminService.findRestaurantList();
	}
	
	/* 식당 수정 */
    @GetMapping("/api/adminRestaurant/{id}")
    public AdminRestaurantDTO findRestaurantById(@PathVariable long id) {
        return adminService.findRestaurantById(id);
    }
    @PostMapping("/api/adminRestaurant/{id}")
    public ResponseEntity<Void> updateByPost(@PathVariable long id, @RequestBody AdminRestaurantDTO dto) {
        dto.setId((long) id);
        int n = adminService.modifyAdminRestaurant(dto);
        return (n == 1) ? ResponseEntity.ok().build()
                        : ResponseEntity.notFound().build();
    }
    
    /* 식당 추가 */
    @PostMapping("/api/adminRestaurant")
    public ResponseEntity<Long> create(@RequestBody AdminRestaurantDTO dto) {
    	adminService.saveAdminRestaurant(dto);
        return ResponseEntity.ok(dto.getId());
    }
	
    /* 식당 소프트 삭제 */
	@DeleteMapping("/api/adminRestaurant/{id}")
	public int registerDeleteRestaurant(@PathVariable long id) {
		return adminService.DeleteAdminRestaurant(id);
	}
	
	
	/* 사용자 조회 */
	@GetMapping("/api/adminUser")
	public List<AdminUserDTO> registerUserList() {
		return adminService.findUserList();
	}
	
    /* 사용자 소프트 삭제 */
	@DeleteMapping("/api/adminUser/{id}")
	public int registerDeleteUser(@PathVariable long id) {
		return adminService.DeleteAdminUser(id);
	}
	
	/* 사용자 수정 */
    @GetMapping("/api/adminUser/{id}")
    public AdminUserDTO findUserById(@PathVariable long id) {
        return adminService.findUserById(id);
    }
    @PostMapping("/api/adminUser/{id}")
    public ResponseEntity<Void> updateByPost(@PathVariable long id, @RequestBody AdminUserDTO dto) {
        dto.setId(id);
        int n = adminService.modifyAdminUser(dto);
        return (n == 1) ? ResponseEntity.ok().build()
                        : ResponseEntity.notFound().build();
    }
    
    
	/* 신고 목록 조회 */
	@GetMapping("/api/adminUser/reports")
	public List<AdminReportDTO> findUserReportList() {
		return adminService.findUserReportList();
	}
	@GetMapping("/api/adminContent/OTH")
	public List<AdminReportDTO> findOTHReportList() {
		return adminService.findOTHReportList();
	}
	@GetMapping("/api/adminContent/RER")
	public List<AdminReportDTO> findRERReportList() {
		return adminService.findRERReportList();
	}
	@GetMapping("/api/adminContent/IPC")
	public List<AdminReportDTO> findIPCReportList() {
		return adminService.findIPCReportList();
	}
	
	
	/* 신고 업데이트 (UR) */
	@GetMapping("/api/reports/ur/{id}")
	public AdminReportDTO getURReport(@PathVariable long id) {
	    return adminService.searchURReportsById(id);
	}
	@PostMapping("/api/reports/ur/{id}")
	public ResponseEntity<?> updateURReport(@PathVariable long id, @RequestBody AdminReportDTO dto) {
	    dto.setId(id);
	    dto.setReportedItemType("UR");
	    AdminReportDTO report = adminService.searchURReportsById(id);
	    if (report != null) {
	        dto.setReporterId(report.getReporterId());
	    }
	    int result = adminService.processReport(dto);
	    return (result == 1) ? ResponseEntity.ok().body("처리 완료")
	                         : ResponseEntity.status(HttpStatus.BAD_REQUEST).body("처리 실패");
	}

	/* 신고 업데이트 (OTH) */
	@GetMapping("/api/reports/oth/{id}")
	public AdminReportDTO getOTHReport(@PathVariable long id) {
	    return adminService.searchOTHReportsById(id);
	}
	@PostMapping("/api/reports/oth/{id}")
	public ResponseEntity<?> updateOTHReport(@PathVariable long id, @RequestBody AdminReportDTO dto) {
	    dto.setId(id);
	    dto.setReportedItemType("OTH");
	    AdminReportDTO report = adminService.searchOTHReportsById(id);
	    if (report != null) {
	        dto.setReporterId(report.getReporterId());
	    }
	    int result = adminService.processReport(dto);
	    return (result == 1) ? ResponseEntity.ok().body("처리 완료")
	                         : ResponseEntity.status(HttpStatus.BAD_REQUEST).body("처리 실패");
	}

	/* 신고 업데이트 (RER) */
	@GetMapping("/api/reports/rer/{id}")
	public AdminReportDTO getRERReport(@PathVariable long id) {
	    return adminService.searchRERReportsById(id);
	}
	@PostMapping("/api/reports/rer/{id}")
	public ResponseEntity<?> updateRERReport(@PathVariable long id, @RequestBody AdminReportDTO dto) {
	    dto.setId(id);
	    dto.setReportedItemType("RER");
	    AdminReportDTO report = adminService.searchRERReportsById(id);
	    if (report != null) {
	        dto.setReporterId(report.getReporterId());
	    }
	    int result = adminService.processReport(dto);
	    return (result == 1) ? ResponseEntity.ok().body("처리 완료")
	                         : ResponseEntity.status(HttpStatus.BAD_REQUEST).body("처리 실패");
	}

	/* 신고 업데이트 (IPC) */
	@GetMapping("/api/reports/ipc/{id}")
	public AdminReportDTO getIPCReport(@PathVariable long id) {
	    return adminService.searchIPCReportsById(id);
	}
	@PostMapping("/api/reports/ipc/{id}")
	public ResponseEntity<?> updateIPCReport(@PathVariable long id, @RequestBody AdminReportDTO dto) {
	    dto.setId(id);
	    dto.setReportedItemType("IPC");
	    AdminReportDTO report = adminService.searchIPCReportsById(id);
	    if (report != null) {
	        dto.setReporterId(report.getReporterId());
	    }
	    int result = adminService.processReport(dto);
	    return (result == 1) ? ResponseEntity.ok().body("처리 완료")
	                         : ResponseEntity.status(HttpStatus.BAD_REQUEST).body("처리 실패");
	}
	
	
	/* 최근 처리 이력 */
	@GetMapping("/api/adminActions/UR")
	public List<AdminActionDTO> findRecentActionsUR() {
		return adminService.findRecentActionsUR();
	}
	@GetMapping("/api/adminActions/OTH")
	public List<AdminActionDTO> findRecentActionsOTH() {
		return adminService.findRecentActionsOTH();
	}
	@GetMapping("/api/adminActions/RER")
	public List<AdminActionDTO> findRecentActionsRER() {
		return adminService.findRecentActionsRER();
	}
	@GetMapping("/api/adminActions/IPC")
	public List<AdminActionDTO> findRecentActionsIPC() {
		return adminService.findRecentActionsIPC();
	}
	
	@PostMapping("/api/reports/{type}/{id}")
	public ResponseEntity<?> processReport( @PathVariable("type") String type, @PathVariable("id") long id, @RequestBody AdminReportDTO dto) {
	    dto.setId(id);
	    dto.setReportedItemType(type.toUpperCase());
	    int result = adminService.processReport(dto);
	    if (result == 1) {
	        return ResponseEntity.ok().body("처리 완료");
	    } else {
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("처리 실패");
	    }
	}
	
}
