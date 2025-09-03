import { useNavigate } from "react-router-dom";

export const DEFAULT_IMAGE_URL = "/images/restaurant/BASIC_RESTAURANT_IMAGE.jpg";

const RestaurantCard = ({ restaurant, selectedTags, onTagClick }) => {
  const navigate = useNavigate();

  const sampleImageUrl = restaurant.photoUrl || DEFAULT_IMAGE_URL;

  return (
    <div className="restaurant-card" onClick={() => navigate(`/restaurants/detail/${restaurant.id}`)}>
      <div className="rc-card-image" style={{ backgroundImage: `url(${sampleImageUrl})` }}></div>
      <div className="rc-card-content">
        <h3>{restaurant.restrntNm}</h3>
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