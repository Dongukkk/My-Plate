import { useNavigate } from "react-router-dom";

const RestaurantCard = ({ restaurant, selectedTag, onTagClick }) => {
  const navigate = useNavigate();

  return (
    <div className="restaurant-card">
      <div className="rc-card-image"></div>
      <div className="rc-card-content">
        <h3>{restaurant.restrntNm}</h3>
        <div className="rc-tags-container" style={{ marginBottom: "8px" }}>
          {restaurant.tags && restaurant.tags.map((t, idx) => (
            <span 
              key={idx} 
              className={`rc-tag-badge ${selectedTag === t.tag ? 'active-tag' : ''}`}
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
            onClick={() => navigate(`/restaurants/detail/${restaurant.id}`)}
            >
            상세 보기
            </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;