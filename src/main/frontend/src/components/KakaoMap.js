import { useEffect, useState, useRef } from "react";
import axios from "axios";

const { kakao } = window;

function KakaoMap({
  isSinglePoint = false,
  centerLat = 36.3504119,
  centerLng = 127.3845475,
  level = 7,
  selectedRestaurant,
  onRestaurantsUpdate,
}) {
  const mapRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  const openInfoRef = useRef(null);
  const fetchTimeoutRef = useRef(null);
  const kakaoMapRef = useRef(null);

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
          map: kakaoMapRef.current,
          zIndex: 1,
        });

        const infoContent = `
          <div style="
            padding:12px;
            font-size:13px;
            line-height:1.5;
            min-width:200px;
            max-width:260px;
            white-space:normal;
            word-break:break-word;
            background:#fff;
            border-radius:8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: 'Arial', sans-serif;
          ">
          <div style="margin-bottom:8px;">
            <a href="/restaurants/detail/${restaurant.id}"
              style="
                display:block;
                font-size:16px;
                font-weight:bold;
                color:#333;
                text-decoration:none;
                transition: all 0.2s;
              "
              onmouseover="this.style.color='#ff6600'; this.style.textDecoration='underline';"
              onmouseout="this.style.color='#333'; this.style.textDecoration='none';">
              ${restaurant.restrntNm}
            </a>
          </div>
          <p style="margin:0 0 4px 0;">⭐ ${restaurant.avgRating ?? "정보 없음"} (${restaurant.ratingCount})</p>
          <p style="margin:0 0 4px 0;">📍 ${restaurant.restrntAddr ?? "정보 없음"}</p>
          <p style="margin:0;">📞 ${restaurant.restrntInqrTel ?? "정보 없음"}</p>
        </div>
        `;

        const info = new kakao.maps.InfoWindow({
          content: infoContent,
          removable: true,
          position,
          zIndex: 9999,
        });

        kakao.maps.event.addListener(marker, "click", () => {
          if (openInfoRef.current) openInfoRef.current.close();
          info.open(kakaoMapRef.current, marker);
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
    kakaoMapRef.current = new kakao.maps.Map(container, options);

    if (!isSinglePoint) {
      const handleBoundsChanged = () => {
        if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = setTimeout(() => {
          fetchMarkers(kakaoMapRef.current.getBounds());
        }, 500);
      };

      const handleMapClick = () => {
        if (openInfoRef.current) {
          openInfoRef.current.close();
          openInfoRef.current = null;
        }
      };

      fetchMarkers(kakaoMapRef.current.getBounds());
      kakao.maps.event.addListener(kakaoMapRef.current, "bounds_changed", handleBoundsChanged);
      kakao.maps.event.addListener(kakaoMapRef.current, "click", handleMapClick);

      return () => {
        kakao.maps.event.removeListener(kakaoMapRef.current, "bounds_changed", handleBoundsChanged);
        kakao.maps.event.removeListener(kakaoMapRef.current, "click", handleMapClick);
        if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
        markers.forEach((marker) => marker.setMap(null));
        setMarkers([]);
        if (openInfoRef.current) openInfoRef.current.close();
      };
    } else {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(centerLat, centerLng),
        map: kakaoMapRef.current,
      });
      setMarkers([marker]);
      if (onRestaurantsUpdate) onRestaurantsUpdate([]);
    }
  }, [isSinglePoint, centerLat, centerLng, level]);

  useEffect(() => {
    if (!selectedRestaurant || !kakaoMapRef.current) return;

    const moveLatLon = new kakao.maps.LatLng(
      selectedRestaurant.mapLat,
      selectedRestaurant.mapLot
    );
    kakaoMapRef.current.panTo(moveLatLon);

    markers.forEach((m) => m.setMap(null));

    const marker = new kakao.maps.Marker({
      position: moveLatLon,
      map: kakaoMapRef.current,
      zIndex: 1,
    });

    const infoContent = `
      <div style="
        padding:12px;
        font-size:13px;
        line-height:1.5;
        min-width:200px;
        max-width:260px;
        white-space:normal;
        word-break:break-word;
        background:#fff;
        border-radius:8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: 'Arial', sans-serif;
      ">
        <div style="margin-bottom:8px;">
          <a href="/restaurants/detail/${selectedRestaurant.id}" 
            style="
              display:block;
              font-size:16px;
              font-weight:bold;
              color:#333;
              text-decoration:none;
              transition: all 0.2s;
            "
            onmouseover="this.style.color='#ff6600'; this.style.textDecoration='underline';"
            onmouseout="this.style.color='#333'; this.style.textDecoration='none';">
            ${selectedRestaurant.restrntNm}
          </a>
        </div>
        <p style="margin:0 0 4px 0;">⭐ ${selectedRestaurant.avgRating ?? "정보 없음"} (${selectedRestaurant.ratingCount})</p>
        <p style="margin:0 0 4px 0;">📍 ${selectedRestaurant.restrntAddr ?? "정보 없음"}</p>
        <p style="margin:0;">📞 ${selectedRestaurant.restrntInqrTel ?? "정보 없음"}</p>
      </div>
    `;

    const info = new kakao.maps.InfoWindow({
      content: infoContent,
      removable: true,
      position: moveLatLon,
      zIndex: 9999,
    });

    if (openInfoRef.current) openInfoRef.current.close();
    info.open(kakaoMapRef.current, marker);
    openInfoRef.current = info;

    setMarkers([marker]);
    
  }, [selectedRestaurant]);

  return <div id="kakao-map" style={{ width: "100%", height: "100%", marginTop: "10px" }} ref={mapRef}></div>;
}

export default KakaoMap;