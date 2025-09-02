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
		return adminService.findUserReportList();
	}
	@GetMapping("/api/adminContent/RER")
	public List<AdminReportDTO> findRERReportList() {
		return adminService.findUserReportList();
	}
	@GetMapping("/api/adminContent/IPC")
	public List<AdminReportDTO> findIPCReportList() {
		return adminService.findUserReportList();
	}
	
}
