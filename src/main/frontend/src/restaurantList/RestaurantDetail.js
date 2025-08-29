import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import SideBarMenu from "../components/SideBarMenu";
import "../restaurantList/RestaurantDetail.css";
import KakaoMap from "../components/KakaoMap";

function RestaurantDetail() {
  const navigate = useNavigate();

  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/restaurants/${id}`);
        setRestaurant(response.data);
        console.log(restaurant);
      } catch (e) {
        console.error(e);
      }
    };
    fetchRestaurant();
  }, [id]);

  if (!restaurant) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="restaurantDetail-page">
      <SideBarMenu/>
      <div className="rd-container">
        <div className="rd-represent">
          <div class="rd-restaurant-header">
            <div>
              <h2>{restaurant.restrntNm}</h2>
              <p>일본 음식 · 스시 · 아시아 퓨전 ⭐ {restaurant.avgrating} ({restaurant.ratingCount} 리뷰)</p>
            </div>
            <div>
              <button>리뷰 작성하기</button>
              <button className="button-color-gray">공유</button>
              <button className="button-color-gray">저장</button>
              <button className="button-color-gray" onClick={() => navigate(`/restaurantList`)}>레스토랑 목록으로 돌아가기</button>
            </div>
          </div>
          <div className="rd-repr-image">
            <h1>사진</h1>
          </div>
          
        </div>
        <div className="rd-info">
            <main class="rd-main">
            <div class="rd-card">
              <h3>혼밥 지수 <span class="rd-badge">8.5/10</span></h3>
              <p>혼자 식사하는 손님에게 받은 평점 기반입니다. 혼밥 포인트가 있는 박 수석이 있습니다.</p>
              <ul>
                <li>쾌적 배치: 1인 테이블, 바 좌석, 개인 공간 배려</li>
                <li>설명기: 친절한 직원 서비스</li>
                <li>취향 옵션: 1인 메뉴, 소포장 제공</li>
              </ul>
            </div>


            <div class="rd-card">
              <h3>메뉴 하이라이트</h3>
              <div class="rd-menu-item">시그니처 스시 플래터 - ₩32,000</div>
              <div class="rd-menu-item">육즙 테리아키 - ₩38,000</div>
              <div class="rd-menu-item">프리미엄 세트 - ₩25,000</div>
              <div class="rd-menu-item">말차 티라미수 - ₩12,000</div>
            </div>

            <div class="rd-card">
              <h3>특별 이벤트</h3>
              <div class="rd-event-item">스시 만들기 클래스 - 1인 ₩35,000</div>
              <div class="rd-event-item">사케 시음의 밤 - 1인 ₩45,000</div>
            </div>

            <div class="rd-card">
              <h3>리뷰 ({restaurant.ratingCount})</h3>
              <div class="rd-review-item">
                <strong>박지훈</strong> ⭐⭐⭐⭐⭐ <br/>
                “혼자 와서 세트로 즐길 수 있는 구성이 좋습니다. 종종 오겠습니다.”
              </div>
              <div class="rd-review-item">
                <strong>이수연</strong> ⭐⭐⭐⭐ <br/>
                “음식 퀄리티는 좋아요. 다만 혼자 먹기엔 양이 많네요.”
              </div>
              <div class="rd-review-item">
                <strong>최준호</strong> ⭐⭐⭐⭐⭐ <br/>
                “사케 시음 이벤트 재밌었어요! 추천합니다.”
              </div>
              <button>더 많은 리뷰 보기</button>
            </div>
          </main>

          <aside class="rd-right-info">
            <h3>영업시간</h3>
            <p>월~금: 오전 11시 - 오후 10시<br/>토: 오전 12시 - 오후 10시<br/>일: 오전 12시 - 오후 9시</p>
            <h3>주소</h3>
            <p>{restaurant.restrntAddr}</p>
            {restaurant.mapLat && restaurant.mapLot && (
              <div style={{height:"300px", border:"1px solid black", borderRadius:"5px"}}>
                <KakaoMap points={[{ lat:restaurant.mapLat, lng:restaurant.mapLot}]} level={1}/>
              </div>
              
            )}
            <h3>전화번호</h3>
            <p>{restaurant.restrntInqrTel}</p>
            <button>전화하기</button>
          </aside>
        </div>
        
      </div>

    </div>
    
  );
}

export default RestaurantDetail;