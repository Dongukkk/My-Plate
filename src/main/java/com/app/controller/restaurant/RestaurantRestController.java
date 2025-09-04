package com.app.controller.restaurant;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.dto.restaurant.BookmarkDTO;
import com.app.dto.restaurant.RestaurantDTO;
import com.app.dto.restaurant.RestaurantTagDTO;
import com.app.dto.restaurant.TagCodeDTO;
import com.app.security.JwtUtil;
import com.app.service.ApiRestaurantService;
import com.app.service.UserService;
import com.app.service.restaurant.BookmarkService;
import com.app.service.restaurant.RestaurantService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class RestaurantRestController {
	
	@Autowired
	ApiRestaurantService apiRestaurantService; 
	
	@Autowired
	RestaurantService restaurantService;
	
	@Autowired
	BookmarkService bookmarkService;
	
	@Autowired
	UserService userService;
	
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
    	    @RequestParam(required = false) String query,
    	    @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "limit", defaultValue = "99999") int limit) {
		List<RestaurantDTO> restList = restaurantService.findAllRestaurants(sort, direction, tag, query, page, limit);
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
        return ResponseEntity.ok(restaurants);
    }
	
	@GetMapping("/api/restaurants/{id}/tags")
    public List<RestaurantTagDTO> getRestaurantTags(@PathVariable("id") int restaurantId) {
        return restaurantService.getTagsByRestaurantId(restaurantId);
    }
	
	@GetMapping("/api/restaurants/tagCodes")
	public List<TagCodeDTO> getAllTagCodes() {
        return restaurantService.getAllTagCodes();
    }
	
	@PostMapping("/api/bookmarks/{restaurantId}")
	public ResponseEntity<Void> toggleBookmark(@PathVariable Long restaurantId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null) {
            return ResponseEntity.status(401).build();
        }
        
        String header = authHeader.trim();
        if (!header.toLowerCase().startsWith("bearer ")) {
            return ResponseEntity.status(401).build();
        }
        String token = header.substring(7).trim();
        
        try {
            String userEmail = JwtUtil.validateToken(token);

            Long userId = userService.getUserIdByEmail(userEmail);
            
            bookmarkService.toggleBookmark(userId, restaurantId);

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }
	
	@GetMapping("/api/bookmarks/me")
    public ResponseEntity<List<BookmarkDTO>> getMyBookmarks(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.toLowerCase().startsWith("bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authHeader.substring(7).trim();
        try {
            String userEmail = JwtUtil.validateToken(token);
            Long userId = userService.getUserIdByEmail(userEmail);
            List<BookmarkDTO> bookmarks = bookmarkService.getBookmarksbyUserId(userId); // 실제 북마크 목록을 가져오는 서비스 메서드
            return ResponseEntity.ok(bookmarks);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }
}
