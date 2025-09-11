package com.app.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class AdminActionDTO {

	private long id;
    private long reportId;  
    private String  itemType;
    private long reporterId; 
    private String action;      
    private String  statusAfter;
	private String excerpt;
	private String memo;
	private String createdAt;
	
	private Long restaurantId;
	
}
