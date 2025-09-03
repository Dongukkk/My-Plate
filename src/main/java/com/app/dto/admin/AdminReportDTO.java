package com.app.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class AdminReportDTO {
	
	private long id;
    private long reporterId;  
    private String reportedItemType;
    private String decision;
    private String excerpt;
    private String memo;
    private String reason;
    private String status;
    private String createdAt;
    private String updatedAt;
    
}
