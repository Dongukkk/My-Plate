package com.app.dto.admin;

import java.time.LocalDateTime;

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
    private String reason;
    private String status;
    private LocalDateTime createdAt;
    
}
