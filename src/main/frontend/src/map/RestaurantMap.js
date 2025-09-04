import { useEffect, useRef, useState } from "react";
import KakaoMap from "../components/KakaoMap";
import SideBarMenu from "../components/SideBarMenu";
import "./RestaurantMap.css";
import { useNavigate } from "react-router-dom";

function RestaurantMap() {
  const navigate = useNavigate();
  const [ displayedRestaurants, setDisplayedRestaurants ] = useState([]);
  const [menus, setMenus] = useState([]);
  const [ isSpinning, setIsSpinning ] = useState(false);
  const [ result, setResult ] = useState("");
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const slotWrapperRef = useRef(null);
  const [ centerCoordinate, setCenterCoordinate ] = useState([null,null]);
  const [ centerLevel, setCenterLevel ] = useState(7);
  const [ recommendedRestaurant, setRecommendedRestaurant] = useState();

  useEffect(() => {
    const restaurantNames = displayedRestaurants.map((rest) => rest.restrntNm);
    setMenus(restaurantNames);

    const wrapper = slotWrapperRef.current;
    if (wrapper) {
      while (wrapper.firstChild) {
        wrapper.removeChild(wrapper.firstChild);
      }
      
      restaurantNames.forEach((name) => {
        const item = document.createElement("div");
        item.className = "rm-slot-item";
        item.textContent = name;
        wrapper.appendChild(item);
      });
      wrapper.style.transform = `translateY(0px)`;
      wrapper.style.transition = 'none';
    }
  }, [result, displayedRestaurants]);

  useEffect(() => {
    
    if (result) {
      const filtered = displayedRestaurants.filter((rest) => rest.restrntNm === result);
      setFilteredRestaurants(filtered);
      console.log(filtered[0]);
      if (filtered[0]){
        setCenterCoordinate([filtered[0].mapLat,filtered[0].mapLot]);
        setRecommendedRestaurant(filtered[0]);
        setCenterLevel(4);
      }
    } else {
      setFilteredRestaurants([]);
    }

    
  }, [result]);

  const spin = () => {
    if (isSpinning || menus.length === 0) return;
    setIsSpinning(true);
    setResult("");

    const wrapper = slotWrapperRef.current;
    if (wrapper) {
      wrapper.style.transition = 'none';
      wrapper.style.transform = `translateY(0px)`;
    }
    
    setTimeout(() => {
      const totalItems = menus.length;
      const randomIndex = Math.floor(Math.random() * totalItems);
      const selectedMenu = menus[randomIndex];
      const offset = -(randomIndex * 60);

      if (wrapper) {
        wrapper.style.transition = "transform 2.5s cubic-bezier(0.25, 1, 0.5, 1)";
        wrapper.style.transform = `translateY(${offset}px)`;
      }

      setTimeout(() => {
        setResult(selectedMenu);
        setIsSpinning(false);
      }, 2600);
    }, 50);
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
              centerLat={centerCoordinate[0] ?? 36.3504119}
              centerLng={centerCoordinate[1] ?? 127.3845475}
              level={centerLevel}
              selectedRestaurant={recommendedRestaurant}
              onRestaurantsUpdate={handleRestaurantUpdate}
            />
          </div>
        </div>

        <div className="rm-right">
          <div className="rm-recommend-box">
            {!result && <div>
            <h3>현재 지도에서 랜덤 음식점 추천</h3>
            <div className="rm-slot-machine">
              <div className="rm-slot-wrapper" ref={slotWrapperRef}></div>
            </div>
            <button className="rm-spin-btn" onClick={spin} disabled={isSpinning}>
              {isSpinning ? "돌아가는 중..." : "룰렛 돌리기"}
            </button>
            </div>}
            {result && <div style={{height:"30px", display:"flex", justifyContent:"space-between"}}><div className="rm-slot-title"> 랜덤 추천 음식점은? </div><div className="rm-slot-close" onClick={()=>{setResult()}}> X </div></div>}
             {filteredRestaurants.length > 0 ? (
                  <div
                    key={filteredRestaurants[0].id}
                    className="rm-restaurant-card"
                    onClick={() => navigate(`/restaurants/detail/${filteredRestaurants[0].id}`)}
                  >
                    <h4>{filteredRestaurants[0].restrntNm}</h4>
                    <p>⭐ 별점: {filteredRestaurants[0].avgRating} ({filteredRestaurants[0].ratingCount})</p>
                    <p>📍 주소: {filteredRestaurants[0].restrntAddr}</p>
                    <p>📞 전화번호: {filteredRestaurants[0].restrntInqrTel}</p>
                  </div>
                ) : (
                  <></>
                )}
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
              <>
                <p>지도를 움직여 주변 식당을 찾아보세요.</p>
                <img src={`${process.env.PUBLIC_URL}/images/icon/noresult/MAP_NORESULT.png`} style={{width:'100%'}}></img>
              </>
              
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestaurantMap;
