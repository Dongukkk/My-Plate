package com.app.dto.admin;

import java.util.List;

import com.app.dto.restaurant.RestaurantTagDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class AdminRestaurantDTO {

	private Long id;
	  private String name;
	  private String description;
	  private String category;

	  private Double avgRating;
	  private Integer ratingCount;
	  private Double soloIndex;

	  private String photoUrl;
	  private String address;
	  private String phone;
	  private String status;

	  private String createdAt;
	  private String updatedAt;

	  private Boolean welfare;
	  private List<RestaurantTagDTO> tags;
	  private List<Long> tagIds;
	
}
