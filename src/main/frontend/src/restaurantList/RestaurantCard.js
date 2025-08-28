const RestaurantCard = ({ restaurant }) => {
  return (
    <div className="restaurant-card">
      <div className="rc-card-image"></div>
      <div className="rc-card-content">
        <h3>{restaurant.restrntNm}</h3>
        <div className="rc-rating-info">
          ⭐ {restaurant.avgrating} ({restaurant.ratingCount})
        </div>
        <div className="rc-description">
            <span>주소 : {restaurant.restrntAddr}</span><br/>
            <span>전화번호 : {restaurant.restrntInqrTel}</span><br/><br/>
            {restaurant.restrntSumm}
        </div>
        <div className="rc-info-badges">
          
          
        </div>
        <div className="rc-card-actions">
          <button className="rc-details-button">상세 보기</button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;