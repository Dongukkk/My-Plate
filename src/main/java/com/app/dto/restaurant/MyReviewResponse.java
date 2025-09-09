package com.app.dto.restaurant;

import lombok.Data;

@Data
public class MyReviewResponse {
    private Long reviewId;
    private String reviewComment;
    private Integer rating;
    private String createdAt;

    private Integer menuScore;
    private Integer seatScore;
    
    private Long restaurantId;
    private String restaurantName;
    private String restaurantPhotoUrl;
    private double restaurantAvgRating;
}
