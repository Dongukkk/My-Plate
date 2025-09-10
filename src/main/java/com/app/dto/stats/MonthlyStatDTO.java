package com.app.dto.stats;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyStatDTO {
	
	private String ym;
	private Integer reviewCount;
	private Integer bookmarkCount;
	private BigDecimal avgRating;	//Oracle AVG()결과 타입이 NUMBER -> MyBatis 기본 매핑 BigDecimal
	
}
