package com.app.dto.admin;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class AdminRestaurantDTO {

	private Long id;
    private String name;
    private String description;
    private String category;

    private Double avgRating;
    private Double rating_count;
    private Double solo_index;

    private String photo_url;
    private String address;
    private String phone;
    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
	
}
