package com.app.controller.admin;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.app.dto.admin.AdminRestaurantDTO;
import com.app.service.admin.AdminService;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class AdminController {
	
	@Autowired
	AdminService adminService;

	@GetMapping("/api/adminRestaurant")
	public List<AdminRestaurantDTO> registerRestaurantList() {
		
		return adminService.findRestaurantList();
	}
	
	
	@DeleteMapping("/api/adminRestaurant/{id}")
	public int registerDeleteRestaurant(@PathVariable long id) {
		
		return adminService.DeleteAdminRestaurant(id);
	}
	
}
