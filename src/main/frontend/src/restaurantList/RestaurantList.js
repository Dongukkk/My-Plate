import RestaurantCard from './RestaurantCard';
import { useState } from 'react';
import '../restaurantList/RestaurantList.css'; // CSS 파일 불러오기

// 더미 데이터
const dummyRestaurants = [
    {
        id: 1,
        name: "라멘 바 이치만",
        rating: 4.8,
        reviewCount: 124,
        description: "정통 식자재와 간편한 손님 응대 및 빠른 서비스를 제공하는 카운터 스타일의 라멘 가게.",
        deliveryTime: "10-15 분",
        distance: "1km",
        isBCard: true
    },
    {
        id: 2,
        name: "김치 하우스",
        rating: 4.6,
        reviewCount: 187,
        description: "김치찌개와 김치볶음밥 등 바쁜 현대인에게 한 끼를 제공하는 한식 레스토랑.",
        deliveryTime: "15-25 분",
        distance: "1.6km",
        isBCard: false
    }
];

function RestaurantList(){
  const [restaurants, setRestaurants] = useState(dummyRestaurants);

  return (
    <div className="app-container">
      <main>
        <aside className="filter-sidebar">

        </aside>
        <div className="restaurant-list">
          <div className="list-header">
            <h2>레스토랑 목록</h2>
            <p>검색 결과: {restaurants.length}개의 레스토랑</p>
            <select>
              <option>평점 순 (높은순)</option>
            </select>
          </div>
          <div className="restaurant-grid">
            {restaurants.map(restaurant => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RestaurantList;