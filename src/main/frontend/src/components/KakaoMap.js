import { useEffect, useState, useRef } from "react";
import axios from "axios";

const { kakao } = window;

function KakaoMap({
  isSinglePoint = false,
  centerLat = 36.3504119,
  centerLng = 127.3845475,
  level = 7,
}) {
  const mapRef = useRef(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (!kakao || !kakao.maps) return;

    const container = document.getElementById("kakao-map");
    const center = new kakao.maps.LatLng(centerLat, centerLng);
    const options = {
      center: center,
      level: level,
    };
    const newMap = new kakao.maps.Map(container, options);
    mapRef.current = newMap;

    if (!isSinglePoint) {
      fetchMarkers(newMap.getBounds());

      kakao.maps.event.addListener(newMap, "bounds_changed", function () {
        if (window.debounceTimeout) {
          clearTimeout(window.debounceTimeout);
        }
        window.debounceTimeout = setTimeout(() => {
          fetchMarkers(newMap.getBounds());
        }, 500);
      });
    } else {
      new kakao.maps.Marker({
        position: new kakao.maps.LatLng(centerLat, centerLng),
        map: newMap,
      });
    }

    return () => {
      if (newMap) {
        kakao.maps.event.removeListener(newMap, "bounds_changed", fetchMarkers);
      }
    };
  }, [isSinglePoint, centerLat, centerLng, level]);

  const fetchMarkers = async (bounds) => {
    markers.forEach((marker) => marker.setMap(null));
    setMarkers([]);

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

      const newMarkers = sortedRestaurants.map((restaurant) => {
        return new kakao.maps.Marker({
          position: new kakao.maps.LatLng(restaurant.mapLat, restaurant.mapLot),
          map: mapRef.current,
        });
      });

      setMarkers(newMarkers);
    } catch (error) {
      console.error("마커 데이터를 불러오는 중 오류 발생:", error);
    }
  };

  return (
    <div
      id="kakao-map"
      style={{ width: "100%", height: "100%", marginTop: "10px" }}
    ></div>
  );
}

export default KakaoMap;
