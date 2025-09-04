import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getMyBookmarks, getRestaurantDetail } from "../api/api";
import RestaurantCard from "../restaurantList/RestaurantCard";
import SideBarMenu from "../components/SideBarMenu";
import '../restaurantList/RestaurantList.css';
import { useNavigate } from "react-router-dom";

function BookmarkList() {
  const user = useSelector((state) => state.user);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookmarks = async () => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const bookmarkResponse = await getMyBookmarks();
      const bookmarkedRestaurantIds = bookmarkResponse.data.map(item => item.restaurantId);

      const restaurantDetailsPromises = bookmarkedRestaurantIds.map(id => getRestaurantDetail(id));
      const restaurantDetailsResponses = await Promise.all(restaurantDetailsPromises);
      
      const bookmarkedRestaurants = restaurantDetailsResponses.map(response => ({
        ...response.data,
        bookmarked: true
      }));

      setRestaurants(bookmarkedRestaurants);
    } catch (e) {
      console.error("북마크 목록을 가져오는 데 실패했습니다:", e);
      setError("북마크 목록을 불러오는 데 실패했습니다. 로그인 상태를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  const handleCardBookmarkToggle = (restaurantId) => {
    setRestaurants(prevRestaurants => prevRestaurants.filter(r => r.id !== restaurantId));

  };
  
  if (loading) {
    return (
      <div className="restaurantList-page">
        <SideBarMenu />
        <div className="rl-container">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="restaurantList-page">
        <SideBarMenu />
        <div className="rl-container">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!user || !user.id) {
    return (
      <div className="restaurantList-page">
        <SideBarMenu />
        <div className="rl-container">
          <h2>북마크 목록</h2>
          <p>로그인 후 북마크 목록을 확인할 수 있습니다.</p>
        </div>
      </div>
    );
  }
  
  if (restaurants.length === 0) {
    return (
      <div className="restaurantList-page">
        <SideBarMenu />
        <div className="rl-container">
          <h2>북마크 목록</h2>
          <p>북마크된 식당이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurantList-page">
      <SideBarMenu />
      <div className="rl-container">
        <main className='restaurant-list-main'>
          <div className="restaurant-list">
            <div className="list-header">
              <h2>북마크 목록</h2>
            </div>
            <div className="restaurant-grid">
              {restaurants.map((restaurant) => (
                <RestaurantCard 
                  key={restaurant.id} 
                  restaurant={restaurant} 
                  selectedTags={[]} 
                  onTagClick={() => {}} 
                  initialBookmarkStatus={true} 
                  onBookmarkToggle={()=>handleCardBookmarkToggle(restaurant.id)}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default BookmarkList;