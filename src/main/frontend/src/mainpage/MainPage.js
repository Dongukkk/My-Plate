import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getRestaurants } from '../api/api';
import '../mainpage/MainPage.css';


function MainPage() {
    const navigate = useNavigate();

    const [ratedRestaurants, setRatedRestaurants] = useState([]);
    const [soloRestaurants, setSoloRestaurants] = useState([]);
    const [reviewedRestaurants, setReviewedRestaurants] = useState([]);
    const [welfareRestaurants, setWelfareRestaurants] = useState([]);
    
    const [ratedIndex, setRatedIndex] = useState(0);
    const [soloIndex, setSoloIndex] = useState(0);
    const [reviewedIndex, setReviewedIndex] = useState(0);
    const [welfareIndex, setWelfareIndex] = useState(0);

    useEffect(() => {
        const fetchAllRestaurants = async () => {
            try {
                const ratedResponse = await getRestaurants({
                    sort: 'avg_Rating',
                    direction: 'DESC',
                    limit: 5
                });
                setRatedRestaurants(ratedResponse.data);

                const soloResponse = await getRestaurants({
                    sort: 'solo_index',
                    direction: 'ASC',
                    limit: 5
                });
                setSoloRestaurants(soloResponse.data);

                const reviewedResponse = await getRestaurants({
                    sort: 'review_Count',
                    direction: 'DESC',
                    limit: 5
                });
                setReviewedRestaurants(reviewedResponse.data);

                const welfareResponse = await getRestaurants({
                    tag: '복지카드사용',
                    direction: 'DESC',
                    limit: 5
                });
                setWelfareRestaurants(welfareResponse.data);

            } catch (error) {
                console.error('맛집 목록을 가져오는 데 실패했습니다:', error);
            }
        };
        fetchAllRestaurants();
    }, []);

    const handleNext = (setter, list, currentIndex) => {
        setter(Math.min(currentIndex + 1, Math.max(0, list.length - 3)));
    };

    const handlePrev = (setter, currentIndex) => {
        setter(Math.max(currentIndex - 1, 0));
    };

    const RestaurantCard = ({ restaurant }) => (
        <div className="mainpage-restaurant">
            <div 
                className="restaurant-image" 
                style={{ backgroundImage: `url(${restaurant.photoUrl || '/images/restaurant/BASIC_RESTAURANT_IMAGE.jpg'})` }}
            ></div>
            <h4>{restaurant.restrntNm} <span style={{ color: "#f97316" }}>⭐ {restaurant.avgRating}</span></h4>
            <div className="mainpage-tags">
                {restaurant.tags.map((tag, index) => (
                    <span key={index}>#{tag.tag}</span>
                ))}
            </div>
        </div>
    );

    const RestaurantSlider = ({ title, list, currentIndex, setIndex }) => (
        <section className="mainpage-container">
            <h3 className="text-xl font-bold mb-5">{title}</h3>
            <div className="mainpage-slider-container">
                <button 
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handlePrev(setIndex, currentIndex)} 
                    className="slider-arrow prev-arrow"
                    disabled={currentIndex === 0}
                >
                    {'<'}
                </button>
                <div className="mainpage-restaurant-list-wrapper">
                    <div 
                        className="mainpage-restaurant-list" 
                        style={{ transform: `translateX(-${currentIndex * 25}%)` }}
                    >
                        {list.length > 0 ? (
                            list.map((restaurant) => (
                                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                            ))
                        ) : (
                            <p>맛집 정보를 불러오는 중입니다...</p>
                        )}
                        <div className="mainpage-more-card" onClick={() => navigate(`/restaurantList`)}>
                            <div className="more-text-container">
                                <span className="text-4xl">→</span>
                                <h4>더 많은 맛집<br />탐색하기</h4>
                            </div>
                        </div>
                    </div>
                </div>
                <button 
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleNext(setIndex, list, currentIndex)} 
                    className="slider-arrow next-arrow"
                    disabled={currentIndex >= Math.max(0, list.length - 3)}
                >
                    {'>'}
                </button>
            </div>
        </section>
    );

    return (
        <>

            <section className="mainpage-hero">
                <video muted autoPlay loop>
                    <source src={`${process.env.PUBLIC_URL}/video/MAIN_VIDEO.mp4`} type="video/mp4"></source>
                </video>
                <div className="text">
                    <h2>혼자서도 맛있게, MY PLATE</h2>
                    <p>당신을 위한 맞춤형 혼밥 맛집 추천 서비스</p>
                    <div>
                        <button className="mainpage-btn-orange" onClick={() => navigate(`/restaurantList`)}>맛집 탐색하기</button>
                        <button className="mainpage-btn-white" onClick={() => navigate(`/map`)}>지도로 보기</button>
                    </div>
                </div>
            </section>

            <RestaurantSlider 
                title="💥 오늘의 추천 맛집"
                list={ratedRestaurants}
                currentIndex={ratedIndex}
                setIndex={setRatedIndex}
            />

            <RestaurantSlider
                title="🍚 혼밥 하기 쉬운 맛집"
                list={soloRestaurants}
                currentIndex={soloIndex}
                setIndex={setSoloIndex}
            />
            
            <RestaurantSlider
                title="✨ 가장 인기 있는 맛집"
                list={reviewedRestaurants}
                currentIndex={reviewedIndex}
                setIndex={setReviewedIndex}
            />

            <RestaurantSlider
                title="👍 복지카드 사용 가능 맛집"
                list={welfareRestaurants}
                currentIndex={welfareIndex}
                setIndex={setWelfareIndex}
            />

            <section className="mainpage-services">
                <div className="mainpage-container mainpage-grid">
                    <div className="mainpage-service-card">
                        <h4>🔍 맛집 검색</h4>
                        <p>지역, 음식 종류, 가격대 등 다양한 필터로 
                            <br/>나에게 맞는 혼밥 맛집을 찾아보세요.</p>
                        <button className="mainpage-btn-orange" onClick={() => navigate(`/restaurantList`)}>검색하기</button>
                    </div>
                    <div className="mainpage-service-card">
                        <h4>🚗 지도로 보기</h4>
                        <p>내 주변의 혼밥인 추천 식당들을 
                            <br/>지도에서 확인하고 방문해보세요.</p>
                        <button className="mainpage-btn-orange" onClick={() => navigate(`/map`)}>지도 보기</button>
                    </div>
                    <div className="mainpage-service-card">
                        <h4>📋 맛집 리스트</h4>
                        <p>다양한 테마별 인기 맛집 리스트를 
                            <br/>확인하고 나만의 맛집을 경험해보세요.</p>
                        <button className="mainpage-btn-orange" onClick={() => navigate(`/restaurantList`)}>리스트 보기</button>
                    </div>
                </div>
            </section>


        </>

    );
}

export default MainPage;