import { useEffect} from "react";

const{kakao} = window;

function KakaoMap({ lat, lng }) {
  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !kakao.maps) return;

    const container = document.getElementById("kakao-map");
    const options = {
      center: new kakao.maps.LatLng(lat, lng),
      level: 1,
    };
    const map = new kakao.maps.Map(container, options);

    // 마커 생성
    const marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(lat, lng),
      map: map,
    });
  }, [lat, lng]);

  return <div id="kakao-map" style={{ width: "100%", height: "300px", marginTop: "10px" }}></div>;
}

export default KakaoMap;