package com.app.dto.restaurant;

import lombok.Data;

@Data
public class BookmarkDTO {

	private Long id;
    private Long userId;
    private Long restaurantId;
    private String status;
    private String createdAt;
    private String updatedAt;
    private String deletedAt;
}
