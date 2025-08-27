package com.app.controller.restaurant;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.service.ApiRestaurantService;

@RestController
public class RestaurantRestController {
	
	@Autowired
	ApiRestaurantService apiRestaurantService; 
	
	@GetMapping("/api/restaurants/save")
    public String saveRestaurants() {
        try {
            apiRestaurantService.saveRestaurants(); // 저장 실행
            return "식당 데이터 저장 완료!";
        } catch (Exception e) {
            e.printStackTrace();
            return "저장 중 오류 발생: " + e.getMessage();
        }
    }
}
