package com.app.dto.restaurant;

import lombok.Data;

@Data
public class ReviewDTO {
	private Long id;
    private Long restaurantId;
    private Long userId;
    private String username;
    private Integer rating;
    private Integer soloScore;
    private String reviewComment;
    private String status;
    private String createdAt;
    private String updatedAt;
    private String deletedAt;
    
    private Integer menuScore;
    private Integer seatScore;
}
