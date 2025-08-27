const RestaurantCard = ({ restaurant }) => {
  return (
    <div className="restaurant-card">
      <div className="card-image"></div>
      <div className="card-content">
        <h3>{restaurant.name}</h3>
        <div className="rating-info">
          ⭐ {restaurant.rating} ({restaurant.reviewCount})
        </div>
        <p className="description">{restaurant.description}</p>
        <div className="info-badges">
          <span>{restaurant.distance} 떨어진 곳</span>
          <span>{restaurant.deliveryTime}</span>
          {restaurant.isBCard && <span>💳 복지카드 가능</span>}
        </div>
        <div className="card-actions">
          <button className="details-button">상세 보기</button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;