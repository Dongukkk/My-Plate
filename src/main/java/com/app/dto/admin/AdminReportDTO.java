package com.app.dto.admin;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class AdminReportDTO {
	
    long id;
    long reporter_id ;
    String reported_item_type;
    String reason;
    String status;
    LocalDateTime created_at;
}
