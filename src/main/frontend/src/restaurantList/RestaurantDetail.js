import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import SideBarMenu from "../components/SideBarMenu";
import "../restaurantList/RestaurantDetail.css";
import KakaoMap from "../components/KakaoMap";
import {DEFAULT_IMAGE_URL} from "./RestaurantCard"

import { useSelector } from 'react-redux';
import { getMyBookmarks, toggleBookmark, getRestaurantDetail, getRestaurantReviews } from "../api/api";
import ReviewModal from "../modal/ReviewModal";
import { calculateSoloIndex, calculateSoloIndexPercent } from "../utils/calculate";
import WriteReviewModal from "../modal/WriteReviewModal";


function RestaurantDetail() {
  const navigate = useNavigate();

  const user = useSelector(state => state.user);

  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);

  const bookmarkURL = bookmarked
    ? "/images/restaurant/bookmark/BOOKMARK_ON.png"
    : "/images/restaurant/bookmark/BOOKMARK_OFF.png";

  const shareURL = "/images/restaurant/bookmark/BOOKMARK_SHARE.png";

  const [reviews, setReviews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);  //리뷰 더보기 모달
  const [isWriteReviewModalOpen, setIsWriteReviewModalOpen] = useState(false);  //리뷰 작성 모달


  const fetchReviews = async () => {
    if (!id) {
        return;
    }
    try {
        const data = await getRestaurantReviews(id);
        setReviews(data);
    } catch (e) {
      console.error("리뷰를 가져오는 데 실패했습니다:", e);
    }
  };

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const response = await getRestaurantDetail(id);
        const tags = Array.isArray(response.data.tags)
          ? response.data.tags
          : [];
        setRestaurant({ ...response.data, tags });
        
                console.log(response);

        if (user && user.id) {
          const bookmarks = await getMyBookmarks();
          const isBookmarked = bookmarks.data.some(
            (b) => b.restaurantId === Number(id)
          );
          setBookmarked(isBookmarked);
        } else {
          setBookmarked(false);
        }
      } catch (e) {
        console.error("레스토랑 정보를 가져오는 데 실패했습니다:", e);
      }
    };
    fetchRestaurantData();
    fetchReviews();
  }, [id, user]);

  

  const handleReviewClick = () => {
    if (!user || !user.id) {
      alert("로그인 후 리뷰를 작성할 수 있습니다.");
      return;
    }
    setIsWriteReviewModalOpen(true);
  };

  const handleReviewSubmitted = () => {
    fetchReviews();
  };

  

  const bookMarkToggle = async () => {
    if (!user || !user.id) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }

    try {
      await toggleBookmark(id);
      setBookmarked(!bookmarked);
    } catch (e) {
      console.error("북마크 토글 API 호출 실패:", e);
      alert("북마크 상태 변경에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (!restaurant) {
    return <div>로딩 중...</div>;
  }
  const sampleImageUrl = restaurant && (restaurant.photoUrl || DEFAULT_IMAGE_URL);

  return (
    <>
      <div className="restaurantDetail-page">
        <SideBarMenu/>
        <div className="rd-container">
          <div className="rd-represent">
            <div className="rd-restaurant-header">
              <div>
                <h2>{restaurant.restrntNm}</h2>
                <p>{restaurant.tags && restaurant.tags.length > 0
                                      ? restaurant.tags.join(' · ')
                                      : ''} ⭐ {restaurant.avgRating} ({restaurant.ratingCount} 리뷰)</p>
              </div>
              <div style={{display:"flex",   alignItems: "center"}}>
                <div className="rd-bookmark" style={{ backgroundImage: `url(${shareURL})`}} title="공유"></div>
                <div className="rd-bookmark" style={{ backgroundImage: `url(${bookmarkURL})`}} title="북마크" onClick={bookMarkToggle}></div>
                
              </div>
            </div>
            <div className="rd-repr-image" style={{ backgroundImage: `url(${sampleImageUrl})`}}></div>
            
          </div>
          <div className="rd-info">
              <main className="rd-main">
              <div className="rd-card">
                <h3>혼밥 지수 <span className="rd-badge">{restaurant.soloIndex}/2</span></h3>
                <p>혼자 식사하는 손님에게 받은 평점 기반입니다. 혼밥 포인트가 있는 박 수석이 있습니다.</p>
                <div className="rd-gauge">
                  <div className="rd-gauge-header">
                    <span>혼밥 메뉴 만족도</span>
                    <span>{calculateSoloIndex(restaurant.avgMenuScore)}%</span>
                  </div>
                  <div className="rd-gauge-bar">
                    <div
                      className="rd-gauge-fill"
                      style={{ width: `${calculateSoloIndex(restaurant.avgMenuScore)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="rd-gauge">
                  <div className="rd-gauge-header">
                    <span>혼밥 좌석 만족도</span>
                    <span>{calculateSoloIndex(restaurant.avgSeatScore)}%</span>
                  </div>
                  <div className="rd-gauge-bar">
                    <div
                      className="rd-gauge-fill rd-gauge-green"
                      style={{ width: `${calculateSoloIndex(restaurant.avgSeatScore)}%` }}
                    ></div>
                  </div>
                </div>
              </div>


              <div className="rd-card">
                <h3>메뉴 하이라이트</h3>
                <div className="rd-menu-item">시그니처 스시 플래터 - ₩32,000</div>
                <div className="rd-menu-item">육즙 테리아키 - ₩38,000</div>
                <div className="rd-menu-item">프리미엄 세트 - ₩25,000</div>
                <div className="rd-menu-item">말차 티라미수 - ₩12,000</div>
              </div>

              <div className="rd-card">
                <h3>특별 이벤트</h3>
                <div className="rd-event-item">스시 만들기 클래스 - 1인 ₩35,000</div>
                <div className="rd-event-item">사케 시음의 밤 - 1인 ₩45,000</div>
              </div>

              <div className="rd-card" style={{minHeight:'300px'}}>
                <h3>리뷰 ({restaurant.ratingCount})</h3>
                {reviews.length > 0 ? (
                    <ul style={{ listStyleType: 'none', padding: 0, minHeight:'200px' }}>
                        {reviews.slice(0, 3).map((review) => (
                            <li key={review.id} className="rd-review-item">
                                <div className="review-header">
                                    <div className="review-author" style={{display:'flex', padding:'10px 0', justifyContent:'space-between'}}>
                                      <div style={{display:'flex'}}>
                                        <div style={{fontSize:'24px'}}>{review.userId}</div>
                                        <div style={{display:'flex', alignItems:'end'}}>
                                          {review.menuScore === 0 && <span className="review-solo-feature">혼밥메뉴가 다양함</span>}  
                                          {review.seatScore === 0 && <span className="review-solo-feature">혼밥좌석이 많음</span>}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="review-date" style={{fontSize:'14px', color:'gray', marginLeft:'50px'}}>{review.createdAt}</span>
                                      </div>
                                      
                                    </div>
                                    <span className="review-rating">
                                      {Array.from({ length: review.rating }, (_, i) => (
                                          <span key={i} className="star">⭐</span>
                                      ))}
                                      <div style={{display:'inline-block', marginLeft:'5px', verticalAlign:'bottom', fontSize:'14px', color:'gray'}}>{`(`+review.rating+`)`}</div></span>
                                </div>
                                <p className="review-comment">{review.reviewComment}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div style={{minHeight:'200px'}}>아직 작성된 리뷰가 없습니다.</div>
                )}
                {reviews.length > 3 && <button onClick={() => setIsModalOpen(true)}>더 많은 리뷰 보기</button>}
              </div>
            </main>

            <aside className="rd-right-info">
              <h3>영업시간</h3>
              <p>월~금: 오전 11시 - 오후 10시<br/>토: 오전 12시 - 오후 10시<br/>일: 오전 12시 - 오후 9시</p>
              <h3>주소</h3>
              <p>{restaurant.restrntAddr}</p>
              {restaurant.mapLat && restaurant.mapLot && (
                <div style={{height:"300px", borderRadius:"5px"}}>
                  <KakaoMap isSinglePoint={true}
                    centerLat={restaurant.mapLat}
                    centerLng={restaurant.mapLot}
                    level={1}
                  />
                </div>
                
              )}
              <h3>전화번호</h3>
              <p>{restaurant.restrntInqrTel}</p>
              <button style={{width:"100%"}}>전화하기</button>
              <button style={{width:"49%", marginRight:"3px"}}>제보하기</button> 
              <button style={{width:"49%"}} onClick={handleReviewClick}>리뷰 작성하기</button>
            </aside>
          </div>
          
        </div>
        

      </div>
      {isModalOpen && (
          <ReviewModal
              restaurantId={id}
              onClose={() => setIsModalOpen(false)}
          />
      )}

      {isWriteReviewModalOpen && (
        <WriteReviewModal
          restaurantId={id}
          onClose={() => setIsWriteReviewModalOpen(false)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </>
  );
}

export default RestaurantDetail;