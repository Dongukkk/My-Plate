import { useEffect, useState, useRef } from "react";
import axios from "axios";

const { kakao } = window;

function KakaoMap({
  isSinglePoint = false,
  centerLat = 36.3504119,
  centerLng = 127.3845475,
  level = 7,
  onRestaurantsUpdate,
}) {
  const mapRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  const openInfoRef = useRef(null);
  const fetchTimeoutRef = useRef(null);

  const fetchMarkers = async (bounds) => {
    
    markers.forEach((marker) => marker.setMap(null));
    setMarkers([]);

    
    if (openInfoRef.current) {
      openInfoRef.current.close();
      openInfoRef.current = null;
    }

    const swLat = bounds.getSouthWest().getLat();
    const swLng = bounds.getSouthWest().getLng();
    const neLat = bounds.getNorthEast().getLat();
    const neLng = bounds.getNorthEast().getLng();

    try {
      const response = await axios.get("/api/restaurants/getRestaurantsInBounds", {
        params: { swLat, swLng, neLat, neLng },
      });

      const restaurants = response.data;
      const sortedRestaurants = restaurants
        .sort((a, b) => b.reviewCount - a.reviewCount)
        .slice(0, 100);

      if (onRestaurantsUpdate) onRestaurantsUpdate(sortedRestaurants);

      const newMarkers = sortedRestaurants.map((restaurant) => {
        const position = new kakao.maps.LatLng(restaurant.mapLat, restaurant.mapLot);
        const marker = new kakao.maps.Marker({
          position,
          map: mapRef.current,
        });

        const infoContent = `
          <div style=" padding:10px; font-size:12px; line-height:1.5; min-width:180px; max-width:250px; white-space:normal; word-break:break-all;">
            <div style="font-size:16px;font-weight:bold;margin-bottom:5px;">${restaurant.restrntNm}</div>
            <p style="margin:0;">⭐ ${restaurant.avgRating ?? "정보 없음"} (${restaurant.ratingCount})</p>
            <p style="margin:0;">📍 ${restaurant.restrntAddr ?? "정보 없음"}</p>
            <p style="margin:0;">📞 ${restaurant.restrntInqrTel ?? "정보 없음"}</p>
          </div>
        `;

        const info = new kakao.maps.InfoWindow({
          content: infoContent,
          removable: true,
          position,
        });

        kakao.maps.event.addListener(marker, "click", () => {
          if (openInfoRef.current) openInfoRef.current.close();
          info.open(mapRef.current, marker);
          openInfoRef.current = info;
        });

        return marker;
      });

      setMarkers(newMarkers);
    } catch (error) {
      console.error("마커 데이터를 불러오는 중 오류 발생:", error);
    }
  };

  useEffect(() => {
    if (!kakao || !kakao.maps) return;

    const container = document.getElementById("kakao-map");
    if (!container) return;

    const center = new kakao.maps.LatLng(centerLat, centerLng);
    const options = { center, level };
    const newMap = new kakao.maps.Map(container, options);
    mapRef.current = newMap;

    if (!isSinglePoint) {
      const handleBoundsChanged = () => {
        if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = setTimeout(() => {
          fetchMarkers(newMap.getBounds());
        }, 500);
      };

      const handleMapClick = () => {
        if (openInfoRef.current) {
          openInfoRef.current.close();
          openInfoRef.current = null;
        }
      };

      fetchMarkers(newMap.getBounds());
      kakao.maps.event.addListener(newMap, "bounds_changed", handleBoundsChanged);
      kakao.maps.event.addListener(newMap, "click", handleMapClick);

      return () => {
        kakao.maps.event.removeListener(newMap, "bounds_changed", handleBoundsChanged);
        kakao.maps.event.removeListener(newMap, "click", handleMapClick);
        if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
        markers.forEach((marker) => marker.setMap(null));
        setMarkers([]);
        if (openInfoRef.current) openInfoRef.current.close();
      };
    } else {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(centerLat, centerLng),
        map: newMap,
      });
      setMarkers([marker]);
      if (onRestaurantsUpdate) onRestaurantsUpdate([]);
    }
  }, [isSinglePoint, centerLat, centerLng, level]);

  return <div id="kakao-map" style={{ width: "100%", height: "100%", marginTop: "10px" }}></div>;
}

export default KakaoMap;