import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import SideBarMenu from "../components/SideBarMenu";
import "../restaurantList/RestaurantDetail.css";
import KakaoMap from "../components/KakaoMap";
import { DEFAULT_IMAGE_URL } from "./RestaurantCard"

import { useSelector } from 'react-redux';
import { getMyBookmarks, toggleBookmark, getRestaurantDetail, getRestaurantReviews, getOperationTimesByRestaurantId, getOperationTimesForToday } from "../api/api";
import ReviewModal from "../modal/ReviewModal";
import { calculateSoloIndex, calculateSoloLevel } from "../utils/calculate";
import WriteReviewModal from "../modal/WriteReviewModal";

const daysOfWeek = [ 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT' ];
const today = new Date().getDay();

function RestaurantDetail() {
  const navigate = useNavigate();

  const user = useSelector(state => state.user);

  const { id } = useParams();
  const [ restaurant, setRestaurant ] = useState(null);
  const [ bookmarked, setBookmarked ] = useState(false);

  const [ menus, setMenus ] = useState([]);
  const [ operationTimes, setOperationTimes ] = useState([]);
  const [ todayOperationTimes, setTodayOperationTimes ] = useState([]);
  const [isCurrentlyOpen, setIsCurrentlyOpen] = useState(false);

  const bookmarkURL = bookmarked
    ? "/images/restaurant/bookmark/BOOKMARK_ON.png"
    : "/images/restaurant/bookmark/BOOKMARK_OFF.png";

  const shareURL = "/images/restaurant/bookmark/BOOKMARK_SHARE.png";

  const [ reviews, setReviews ] = useState([]);
  const [ isModalOpen, setIsModalOpen ] = useState(false);  //리뷰 더보기 모달
  const [ isWriteReviewModalOpen, setIsWriteReviewModalOpen ] = useState(false);  //리뷰 작성 모달
  const [ reviewToEdit, setReviewToEdit ] = useState(null)

  const [ selectedReviewId, setSelectedReviewId ] = useState(null);
  const menuRef = useRef(null);

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
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setSelectedReviewId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMenuClick = (reviewId) => {
    setSelectedReviewId(selectedReviewId === reviewId ? null : reviewId);
  };

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const response = await getRestaurantDetail(id);
        const tags = Array.isArray(response.data.tags)
          ? response.data.tags
          : [];
        setRestaurant({ ...response.data, tags });
        console.log('start');

        const menusResponse = await axios.get(`/api/restaurants/${id}/menus`);
        console.log('end');
        setMenus(menusResponse.data);

        const operationTimesData = await getOperationTimesByRestaurantId(id);
        setOperationTimes(operationTimesData);

        const todayTimesData = await getOperationTimesForToday(id);
        setTodayOperationTimes(todayTimesData);

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
  }, [ id, user ]);


  useEffect(() => {
    const checkOpenStatus = () => {
      if (todayOperationTimes.length === 0) {
        setIsCurrentlyOpen(false);
        return;
      }
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeInMinutes = currentHours * 60 + currentMinutes;

      for (const timeSlot of todayOperationTimes) {
        // 예: "2025-09-08 10:00:00" -> "10:00"
        const openTime = timeSlot.openTime.split(' ')[ 1 ].substring(0, 5);
        const closeTime = timeSlot.closeTime.split(' ')[ 1 ].substring(0, 5);

        const [ openHour, openMinute ] = openTime.split(':').map(Number);
        const [ closeHour, closeMinute ] = closeTime.split(':').map(Number);

        const openTimeInMinutes = openHour * 60 + openMinute;
        const closeTimeInMinutes = closeHour * 60 + closeMinute;

        if (currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes) {
          setIsCurrentlyOpen(true);
          return;
        }
      }
      setIsCurrentlyOpen(false);
    };

    checkOpenStatus();
    const intervalId = setInterval(checkOpenStatus, 60000);

    return () => clearInterval(intervalId);
  }, [ todayOperationTimes ]);

  const handleReviewClick = () => {
    if (!user || !user.id) {
      alert("로그인 후 리뷰를 작성할 수 있습니다.");
      return;
    }
    setReviewToEdit(null);
    setIsWriteReviewModalOpen(true);
  };

  const handleReviewSubmitted = () => {
    setRestaurant(prevRestaurant => ({
      ...prevRestaurant,
      ratingCount: prevRestaurant.ratingCount + 1
    }));

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

  const handleDeleteReview = async (reviewId) => {

    if (!window.confirm("정말 리뷰를 삭제하시겠습니까?")) {
      return;
    }
    try {
      const access = localStorage.getItem('access');
      await axios.delete(`/api/reviews/${reviewId}`, {
        headers: {
          'Authorization': `Bearer ${access}`
        }
      });
      alert("리뷰가 삭제되었습니다.");
      fetchReviews();

      setRestaurant(prevRestaurant => ({
        ...prevRestaurant,
        ratingCount: prevRestaurant.ratingCount - 1
      }));
    } catch (error) {
      console.error("리뷰 삭제 실패:", error);
      alert("리뷰 삭제에 실패했습니다.");
    }
  };

  const handleEditReview = (review) => {
    setReviewToEdit(review);
    setIsWriteReviewModalOpen(true);
  };

  if (!restaurant) {
    return <div>로딩 중...</div>;
  }
  const sampleImageUrl = restaurant && (restaurant.photoUrl || DEFAULT_IMAGE_URL);

  const levelBadge = {
    1: "/images/icon/soloBadge/SOLO_BADGE_1.png",
    2: "/images/icon/soloBadge/SOLO_BADGE_2.png",
    3: "/images/icon/soloBadge/SOLO_BADGE_3.png",
  };
  const badgeSize = 20;
  const soloLevel = calculateSoloLevel(restaurant.soloIndex);

  const groupOperationTimesByDay = (times) => {
    const grouped = {};
    times.forEach(item => {
      const day = item.dayOfWeek;
      if (!grouped[ day ]) {
        grouped[ day ] = [];
      }
      grouped[ day ].push(item);
    });
    return grouped;
  };
  const groupedTimes = groupOperationTimesByDay(operationTimes);


  return (
    <>
      <div className="restaurantDetail-page">
        <SideBarMenu />
        <div className="rd-container">
          <div className="rd-represent">
            <div className="rd-restaurant-header">
              <div>
                <h2>{restaurant.restrntNm}</h2>
                <p>{restaurant.tags && restaurant.tags.length > 0
                  ? restaurant.tags.join(' · ')
                  : ''} ⭐ {restaurant.avgRating} ({restaurant.ratingCount} 리뷰)</p>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div className="rd-bookmark" style={{ backgroundImage: `url(${shareURL})` }} title="공유"></div>
                <div className="rd-bookmark" style={{ backgroundImage: `url(${bookmarkURL})` }} title="북마크" onClick={bookMarkToggle}></div>

              </div>
            </div>
            <div className="rd-repr-image" style={{ backgroundImage: `url(${sampleImageUrl})` }}></div>

          </div>
          <div className="rd-info">
            <main className="rd-main">
              <div className="rd-card">
                <h3>혼밥 지수 <img
                  src={levelBadge[ soloLevel ]}
                  alt={`Solo Badge Level ${soloLevel}`}
                  style={{ width: `${badgeSize*3}px`, height: `${badgeSize}px`, marginTop:'10px'}}
                /></h3>
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
                      className="rd-gauge-fill rd-gauge-red"
                      style={{ width: `${calculateSoloIndex(restaurant.avgSeatScore)}%` }}
                    ></div>
                  </div>
                </div>
              </div>


              <div className="rd-card">
                <h3>메뉴</h3>
                {menus.length > 0 ? (
                  menus.map((menu) => (
                    <div key={menu.id} className="rd-menu-item">
                      <div className="rd-menu-item-name" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{menu.menu}</span><span>₩{menu.price.toLocaleString()}</span>
                      </div>
                      <div className="rd-menu-item-info">
                        <span style={{ fontSize: '12px', color: 'gray' }}>{menu.description}</span> | <span style={{ fontSize: '10px', color: 'gray' }}>{menu.originInfo}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>메뉴 정보가 없습니다.</p>
                )}
              </div>

              <div className="rd-card" style={{ minHeight: '300px' }}>
                <h3>리뷰 ({restaurant.ratingCount})</h3>
                {reviews.length > 0 ? (
                  <ul style={{ listStyleType: 'none', padding: 0, minHeight: '200px' }}>
                    {reviews.slice(0, 3).map((review) => (
                      <li key={review.id} className="rd-review-item">
                        <div className="review-header">
                          <div className="review-author" style={{ display: 'flex', padding: '10px 0', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex' }}>
                              <div style={{ fontSize: '24px' }}>{review.userId}</div>
                              <div style={{ display: 'flex', alignItems: 'end' }}>
                                {review.menuScore === 0 && <span className="review-solo-feature">혼밥메뉴가 다양함</span>}
                                {review.seatScore === 0 && <span className="review-solo-feature">혼밥좌석이 많음</span>}
                              </div>
                            </div>
                            {(user && user.id && user.id === review.userId) &&
                              <div style={{ cursor: 'pointer', position: 'relative', alignContent: 'center' }}>
                                <p style={{ writingMode: 'vertical-rl', letterSpacing: '1px', margin: 'auto' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMenuClick(review.id);
                                  }}
                                >
                                  •••
                                </p>

                                {selectedReviewId === review.id && (
                                  <div className="review-menu-dropdown" ref={menuRef} >
                                    <div className="review-menu-item"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditReview(review);
                                      }}
                                    >
                                      수정
                                    </div>
                                    <div className="review-menu-item"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteReview(review.id);
                                      }}
                                    >
                                      삭제
                                    </div>
                                  </div>
                                )}
                              </div>
                            }
                          </div>
                          <span className="review-rating">
                            {Array.from({ length: review.rating }, (_, i) => (
                              <span key={i} className="star">⭐</span>
                            ))}
                            <div style={{ display: 'inline-block', marginLeft: '5px', verticalAlign: 'bottom', fontSize: '14px', color: 'gray' }}>{`(` + review.rating + `)`}</div></span>
                        </div>
                        <p className="review-comment">{review.reviewComment}</p>
                        <div style={{ width: '100%', textAlign: 'end' }}>
                          <span className="review-date" style={{ fontSize: '14px', color: 'gray' }}>{review.updatedAt ? review.updatedAt + `(수정됨)` : review.createdAt}</span>
                        </div>

                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ minHeight: '200px' }}>아직 작성된 리뷰가 없습니다.</div>
                )}
                {reviews.length > 3 && <button onClick={() => setIsModalOpen(true)}>더 많은 리뷰 보기</button>}
              </div>
            </main>

            <aside className="rd-right-info">
              <h3>
                영업시간
                <span className={`operation-status ${isCurrentlyOpen ? 'open' : 'closed'}`}>
                  {isCurrentlyOpen ? '영업 중' : '영업 종료'}
                </span>
              </h3>


              <hr style={{ margin: '20px 0' }} />

              {Object.keys(groupedTimes).length > 0 ? (
                Object.keys(groupedTimes).sort().map(day => (
                  <div key={day} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', padding:'2px' }}
                    className={parseInt(day) === today ? 'highlight-today' : ''}
                  >
                    <div style={{ fontWeight: 'Bold' }}>{daysOfWeek[ day ]}: </div>
                    <div>
                      {groupedTimes[ day ].map((time, index) => (
                        <span key={time.id}>
                          {` ${time.openTime.split(' ')[ 1 ].substring(0, 5)} ~ ${time.closeTime.split(' ')[ 1 ].substring(0, 5)}`}
                          {index < groupedTimes[ day ].length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p>운영 시간 정보가 없습니다.</p>
              )}

              <h3>주소</h3>
              <p>{restaurant.restrntAddr}</p>
              {restaurant.mapLat && restaurant.mapLot && (
                <div style={{ height: "300px", borderRadius: "5px" }}>
                  <KakaoMap isSinglePoint={true}
                    centerLat={restaurant.mapLat}
                    centerLng={restaurant.mapLot}
                    level={1}
                  />
                </div>

              )}
              <h3>전화번호</h3>
              <p>{restaurant.restrntInqrTel}</p>
              <button style={{ width: "100%" }}>전화하기</button>
              <button style={{ width: "49%", marginRight: "3px" }}>제보하기</button>
              <button style={{ width: "49%" }} onClick={handleReviewClick}>리뷰 작성하기</button>
            </aside>
          </div>

        </div>


      </div>
      {isModalOpen && (
        <ReviewModal
          restaurantId={id}
          onClose={() => setIsModalOpen(false)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {isWriteReviewModalOpen && (
        <WriteReviewModal
          restaurantId={id}
          initialReviewData={reviewToEdit}
          onClose={() => setIsWriteReviewModalOpen(false)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </>
  );
}

export default RestaurantDetail;