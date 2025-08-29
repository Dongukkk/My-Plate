import { useEffect } from "react";

const { kakao } = window;

function KakaoMap({ points = [], showMarker = true, level = 7}) {
  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !kakao.maps) return;

    const container = document.getElementById("kakao-map");

    const center = points.length > 0 
      ? new kakao.maps.LatLng(points[0].lat, points[0].lng)
      : new kakao.maps.LatLng(33.450701, 126.570667); // 기본값 설정

    const options = {
      center: center,
      level: level,
    };
    const map = new kakao.maps.Map(container, options);

    // showMarker가 true일 때만 마커를 생성합니다.
    if (showMarker) {
      if (points.length === 1) {
        // 좌표가 하나일 경우, 해당 좌표에 마커를 표시합니다.
        new kakao.maps.Marker({
          position: new kakao.maps.LatLng(points[0].lat, points[0].lng),
          map: map,
        });
      } else {
        // 좌표가 두 개 이상일 경우, 첫 번째 좌표를 제외하고 마커를 표시합니다.
        points.forEach((point, index) => {
          if (index > 0) {
            new kakao.maps.Marker({
              position: new kakao.maps.LatLng(point.lat, point.lng),
              map: map,
            });
          }
        });
      }
    }
  }, [points, showMarker]);

  return <div id="kakao-map" style={{ width: "100%", height: "100%", marginTop: "10px" }}></div>;
}

export default KakaoMap;