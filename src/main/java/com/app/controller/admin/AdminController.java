package com.app.controller.admin;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

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
	@GetMapping("/api/adminContent/OHT")
	public List<AdminReportDTO> findOHTReportList() {
		return adminService.findOHTReportList();
	}
	@GetMapping("/api/adminContent/RER")
	public List<AdminReportDTO> findRERReportList() {
		return adminService.findRERReportList();
	}
	@GetMapping("/api/adminContent/IPC")
	public List<AdminReportDTO> findIPCReportList() {
		return adminService.findIPCReportList();
	}
	
	
	/* 신고 업데이트 */
	@GetMapping("/api/reports/ur/{id}")
	public AdminReportDTO getURReport(@PathVariable long id) {
	    return adminService.searchURReportsById(id);
	}
	@PostMapping("/api/reports/ur/{id}")
	public ResponseEntity<Void> updateURReport(@PathVariable long id, @RequestBody AdminReportDTO dto) {
	    dto.setId(id);
	    int n = adminService.updateURReport(dto);
	    return (n == 1) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
	}

	@GetMapping("/api/reports/oht/{id}")
	public AdminReportDTO getOHTReport(@PathVariable long id) {
	    return adminService.searchOHTReportsById(id);
	}
	@PostMapping("/api/reports/oht/{id}")
	public ResponseEntity<Void> updateOHTReport(@PathVariable long id, @RequestBody AdminReportDTO dto) {
	    dto.setId(id);
	    int n = adminService.updateOHTReport(dto);
	    return (n == 1) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
	}

	@GetMapping("/api/reports/rer/{id}")
	public AdminReportDTO getRERReport(@PathVariable long id) {
	    return adminService.searchRERReportsById(id);
	}
	@PostMapping("/api/reports/rer/{id}")
	public ResponseEntity<Void> updateRERReport(@PathVariable long id, @RequestBody AdminReportDTO dto) {
	    dto.setId(id);
	    int n = adminService.updateRERReport(dto);
	    return (n == 1) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
	}

	@GetMapping("/api/reports/ipc/{id}")
	public AdminReportDTO getIPCReport(@PathVariable long id) {
	    return adminService.searchIPCReportsById(id);
	}
	@PostMapping("/api/reports/ipc/{id}")
	public ResponseEntity<Void> updateIPCReport(@PathVariable long id, @RequestBody AdminReportDTO dto) {
	    dto.setId(id);
	    int n = adminService.updateIPCReport(dto);
	    return (n == 1) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
	}
	
	
	
}
