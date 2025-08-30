import { useEffect, useRef, useState } from "react";
import KakaoMap from "../components/KakaoMap";
import SideBarMenu from "../components/SideBarMenu";
import "./RestaurantMap.css";
import { useNavigate } from "react-router-dom";

function RestaurantMap() {
  const navigate = useNavigate();
  const [ displayedRestaurants, setDisplayedRestaurants ] = useState([]);

  const menus = [
    "돈까스",
    "김치찌개",
    "제육볶음",
    "초밥",
    "파스타",
    "햄버거",
    "비빔밥",
    "라면",
    "샌드위치",
    "닭갈비",
  ];
  const [ isSpinning, setIsSpinning ] = useState(false);
  const [ result, setResult ] = useState("");
  const slotWrapperRef = useRef(null);

  useEffect(() => {
    const wrapper = slotWrapperRef.current;
    if (wrapper && wrapper.childElementCount === 0) {
      menus.forEach((menu) => {
        const item = document.createElement("div");
        item.className = "rm-slot-item";
        item.textContent = menu;
        wrapper.appendChild(item);
      });
    }
  }, [ menus ]);

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    const totalItems = menus.length;
    const randomIndex = Math.floor(Math.random() * totalItems);
    const selectedMenu = menus[ randomIndex ];

    // 슬롯 이동 높이 (아이템당 60px)
    const offset = -(randomIndex * 60);

    const wrapper = slotWrapperRef.current;
    if (wrapper) {
      wrapper.style.transition = "transform 2.5s cubic-bezier(0.25, 1, 0.5, 1)";
      wrapper.style.transform = `translateY(${offset}px)`;
    }

    setTimeout(() => {
      setResult(selectedMenu);
      setIsSpinning(false);
    }, 2600);
  };

  const handleRestaurantUpdate = (restaurants) => {
    setDisplayedRestaurants(restaurants);
  };

  return (
    <div className="rm-restaurantMap-page">
      <SideBarMenu />
      <div className="rm-container">
        <div className="rm-left">
          <h2>주변 식당</h2>
          <div className="rm-map-container">
            <KakaoMap
              isSinglePoint={false}
              onRestaurantsUpdate={handleRestaurantUpdate}
            />
          </div>
        </div>

        <div className="rm-right">
          <div className="rm-recommend-box">
            <h3>오늘 뭘 먹을지 고민된다면?</h3>
            <div className="rm-slot-machine">
              <div className="rm-slot-wrapper" ref={slotWrapperRef}></div>
            </div>
            <button className="rm-spin-btn" onClick={spin} disabled={isSpinning}>
              {isSpinning ? "돌아가는 중..." : "룰렛 돌리기"}
            </button>
            {result && <div className="rm-result">👉 {result} 당첨!</div>}
          </div>

          <div className="rm-restList">
            <h3>식당 리스트</h3>
            {displayedRestaurants.length > 0 ? (
              displayedRestaurants.map((rest) => (
                <div key={rest.id} className="rm-restaurant-card" onClick={() => navigate(`/restaurants/detail/${rest.id}`)}>
                  <h4>{rest.restrntNm}</h4>
                  <p>⭐ 별점: {rest.avgRating} ({rest.ratingCount})</p>
                  <p>📍 주소: {rest.restrntAddr}</p>
                  <p>📞 전화번호: {rest.restrntInqrTel}</p>
                </div>
              ))
            ) : (
              <p>지도를 움직여 주변 식당을 찾아보세요.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestaurantMap;
