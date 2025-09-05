package com.app.dto.restaurant;

import lombok.Data;

@Data
public class MenuDTO {

	private Long id;
    private Long restaurantId;
    private String menu;
    private int price;
    private String description;
    private String originInfo;
    private String status;
    private String createdAt;
    private String updatedAt;
    private String deletedAt;
	
}
