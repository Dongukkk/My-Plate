package com.app.dto.user;



import java.util.Date;

import lombok.Data;

@Data
public class BookmarkItemDTO {

	private Long restaurantId;
	private String name;
	private String roadAddress;
	private Double avgRating;
	private Integer reviewCount;
	private Date bookmarkedAt;
}
