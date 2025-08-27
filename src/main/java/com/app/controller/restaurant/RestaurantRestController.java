package com.app.controller.restaurant;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.dto.restaurant.RestaurantDTO;
import com.app.service.ApiRestaurantService;
import com.app.service.restaurant.RestaurantService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class RestaurantRestController {
	
	@Autowired
	ApiRestaurantService apiRestaurantService; 
	
	@Autowired
	RestaurantService restaurantService;
	
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
	
	@GetMapping("/api/restaurants/getAllRestaurants")
    public List<RestaurantDTO> getAllRestaurants() {
		List<RestaurantDTO> restList = restaurantService.findAllRestaurants();
		System.out.println(restList);
		return restList;
	}
}
