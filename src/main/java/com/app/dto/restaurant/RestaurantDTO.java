package com.app.dto.restaurant;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@JsonIgnoreProperties(ignoreUnknown = true)
@NoArgsConstructor
@AllArgsConstructor
@Data
public class RestaurantDTO {
	private Long id;
	
	@JsonProperty("restrntNm")
    private String name;
	
	@JsonProperty("restrntSumm")
    private String description;
	
    private String category;
    private double avgRating;
    private Integer ratingCount;
    private double soloIndex;
    private String photoUrl;
    
    @JsonProperty("mapLat")
    private double latitude;
    
    @JsonProperty("mapLot")
    private double longitude;
    
    @JsonProperty("restrntAddr")
    private String address;
    
    @JsonProperty("restrntInqrTel")
    private String phone;
    
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    
    private List<RestaurantTagDTO> tags;
}
