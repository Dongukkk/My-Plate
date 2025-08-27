package com.app.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Service;

import com.app.dao.restaurant.RestaurantDAO;
import com.app.dto.restaurant.RestaurantDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@PropertySource("classpath:/properties/application.properties")
public class ApiRestaurantService {

	@Autowired
	private RestaurantDAO restaurantDAO;

	@Value("${api.restaurant.service-key}")
	private String serviceKey;
	
	@Value("${api.restaurant.base-url}")
    private String baseUrl;
	
	public String fetchData(int pageNo, int numOfRows) throws Exception{
		
		System.out.println(serviceKey + baseUrl);
        StringBuilder urlBuilder = new StringBuilder(baseUrl);

        urlBuilder.append("?" + URLEncoder.encode("serviceKey","UTF-8") + "=" + serviceKey);
        urlBuilder.append("&" + URLEncoder.encode("pageNo","UTF-8") + "=" + URLEncoder.encode(String.valueOf(pageNo), "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("numOfRows","UTF-8") + "=" + URLEncoder.encode(String.valueOf(numOfRows), "UTF-8"));

        URL url = new URL(urlBuilder.toString());
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();

        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-type", "application/json");

        BufferedReader rd;
        if(conn.getResponseCode() >= 200 && conn.getResponseCode() <= 300) {
            rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        } else {
            rd = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
        }
        
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = rd.readLine()) != null) {
            sb.append(line);
        }
        rd.close();
        conn.disconnect();

        return sb.toString();
	}

	public synchronized void saveRestaurants() throws Exception {

ObjectMapper mapper = new ObjectMapper();
        
        int pageNo = 1;
        int numOfRows = 50;
        int totalCount = 0;
        int totalPages = 0;
        
        do {
            try {
                String jsonResponse = fetchData(pageNo, numOfRows);
                
                if (jsonResponse == null || jsonResponse.isEmpty()) {
                    System.out.println("API 응답이 비어있습니다. 작업을 종료합니다.");
                    break;
                }

                JsonNode root = mapper.readTree(jsonResponse);

                if (totalCount == 0) {
                    JsonNode totalCountNode = root.path("response").path("body").path("totalCount");
                    if (totalCountNode.isMissingNode()) {
                         System.out.println("totalCount 필드를 찾을 수 없습니다. 작업을 종료합니다.");
                         break;
                    }
                    totalCount = totalCountNode.asInt();

                    if (totalCount == 0) {
                         System.out.println("총 0건의 데이터를 발견했습니다. 작업을 종료합니다.");
                         break;
                    }
                    totalPages = (int) Math.ceil((double) totalCount / numOfRows);
                    System.out.println("총 " + totalCount + "건의 데이터를 " + totalPages + "페이지에 걸쳐 저장합니다.");
                }

                JsonNode items = root.path("response").path("body").path("items");

                if (items.isArray()) {
                    for (JsonNode node : items) {
                        RestaurantDTO dto = mapper.treeToValue(node, RestaurantDTO.class);
                        restaurantDAO.saveApiRestaurant(dto);
                    }
                }

            } catch (Exception e) {
                System.err.println("데이터 처리 중 예외 발생: " + e.getMessage());
            }
            
            pageNo++;

        } while (pageNo <= totalPages);

        System.out.println("총 " + totalCount + "건 저장 완료");

	}
}
