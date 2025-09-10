package com.app.dto.restaurant;

import lombok.Data;

@Data
public class OperationTimeDTO {

	private long id;
    private long restaurantId;
    private int dayOfWeek;
    private int slotIndex;
    private String openTime;
    private String closeTime;
    private String status;
    private String createdAt;
    private String updatedAt;
    private String deletedAt;
}
