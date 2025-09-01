package com.app.controller.restaurant;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.dto.restaurant.RestaurantDTO;
import com.app.dto.restaurant.RestaurantTagDTO;
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
    public List<RestaurantDTO> getAllRestaurants(@RequestParam(name = "sort", defaultValue = "name") String sort,
    	    @RequestParam(name = "direction", defaultValue = "ASC") String direction,
    	    @RequestParam(required = false) String tag,
    	    @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "limit", defaultValue = "99999") int limit) {
		List<RestaurantDTO> restList = restaurantService.findAllRestaurants(sort, direction, tag, page, limit);
		System.out.println(page);
		System.out.println(restList);
		return restList;
	}
	
	@GetMapping("/api/restaurants/{id}")
	public RestaurantDTO getRestaurantDetail(@PathVariable Long id) {
        return restaurantService.getRestaurantById(id);
    }
	
	@GetMapping("/api/restaurants/getRestaurantsInBounds")
    public ResponseEntity<List<RestaurantDTO>> getRestaurantsInBounds(
            @RequestParam("swLat") double swLat,
            @RequestParam("swLng") double swLng,
            @RequestParam("neLat") double neLat,
            @RequestParam("neLng") double neLng) {

        List<RestaurantDTO> restaurants = restaurantService.findRestaurantsInBounds(swLat, swLng, neLat, neLng);
        System.out.println(restaurants);
        return ResponseEntity.ok(restaurants);
    }
	
	@GetMapping("/api/restaurants/{id}/tags")
    public List<RestaurantTagDTO> getRestaurantTags(@PathVariable("id") int restaurantId) {
        return restaurantService.getTagsByRestaurantId(restaurantId);
    }
}
