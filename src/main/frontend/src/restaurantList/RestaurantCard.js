const RestaurantCard = ({ restaurant }) => {
  return (
    <div className="restaurant-card">
      <div className="card-image"></div>
      <div className="card-content">
        <h3>{restaurant.restrntNm}</h3>
        <div className="rating-info">
          ⭐ {restaurant.avgrating} ({restaurant.ratingCount})
        </div>
        <div className="description">
            <span>주소 : {restaurant.restrntAddr}</span><br/>
            <span>전화번호 : {restaurant.restrntInqrTel}</span><br/><br/>
            {restaurant.restrntSumm}
        </div>
        <div className="info-badges">
          
          
        </div>
        <div className="card-actions">
          <button className="details-button">상세 보기</button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;