import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { toggleBookmark } from "../api/api";
import { useSelector } from 'react-redux';

export const DEFAULT_IMAGE_URL = "/images/restaurant/BASIC_RESTAURANT_IMAGE.jpg";

const RestaurantCard = ({ restaurant, selectedTags, onTagClick, initialBookmarkStatus, onBookmarkToggle }) => {
  const navigate = useNavigate();

  const user = useSelector(state => state.user);

  const [bookmarked, setBookmarked] = useState(initialBookmarkStatus);
  const bookmarkURL = bookmarked
    ? "/images/restaurant/bookmark/BOOKMARK_ON.png"
    : "/images/restaurant/bookmark/BOOKMARK_OFF.png";

  const sampleImageUrl = restaurant.photoUrl || DEFAULT_IMAGE_URL;

  useEffect(() => {
    setBookmarked(initialBookmarkStatus);
  }, [initialBookmarkStatus]);

  const bookMarkToggle = async (e) => {
    e.stopPropagation();

    if (!user || !user.id) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }

    try {
      await toggleBookmark(restaurant.id);

      setBookmarked(!bookmarked);
      
      if (onBookmarkToggle) {
        onBookmarkToggle(restaurant.id);
      }

    } catch (error) {
      console.error("북마크 토글 API 호출 실패:", error);
      alert("즐겨찾기 상태 변경에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="restaurant-card" onClick={() => navigate(`/restaurants/detail/${restaurant.id}`)}>
      <div className="rc-card-image" style={{ backgroundImage: `url(${sampleImageUrl})` }}></div>
      <div className="rc-card-content">
        <div className="rc-card-title" style={{display:'flex', justifyContent:'space-between'}}>
          <h3>{restaurant.restrntNm}</h3>
          <div className="rc-bookmark" style={{ backgroundImage: `url(${bookmarkURL})`}} title="북마크" onClick={bookMarkToggle}></div>
        </div>
        
        <div className="rc-tags-container" style={{ marginBottom: "8px" }}>
          {restaurant.tags && restaurant.tags.map((t, idx) => (
            <span 
              key={idx} 
              className={`rc-tag-badge ${selectedTags.includes(t.tag) ? 'active-tag' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick(t.tag);
              }}
            >
              #{t.tag}
            </span>
          ))}
        </div>
        <div className="rc-rating-info">
          ⭐ {restaurant.avgRating} ({restaurant.ratingCount})
        </div>
        <div className="rc-description">
            <span>주소 : {restaurant.restrntAddr}</span><br/>
            <span>전화번호 : {restaurant.restrntInqrTel}</span><br/><br/>
            {restaurant.restrntSumm}
        </div>
        <div className="rc-info-badges">
          
          
        </div>
        <div className="rc-card-actions">
          <button
            className="rc-details-button" 
            >
            상세 보기
            </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;