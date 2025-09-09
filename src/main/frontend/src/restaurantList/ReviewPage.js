import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyReviews } from "../api/api";
import './ReviewPage.css';
import SideBarMenu from "../components/SideBarMenu";
import { useSelector } from "react-redux";

function ReviewPage() {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const user = useSelector((state) => state.user);

    const fetchReviews = async () => {
        if (!user || !user.id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await getMyReviews(user.id);
            setReviews(response);
        } catch (e) {
            console.error("리뷰를 불러오는 데 실패했습니다:", e);
            setError("리뷰 목록을 불러오는 데 실패했습니다. 로그인 상태를 확인해주세요.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchReviews();
    }, [user.id]);

    if (loading) {
        return (
            <div className="rp-review-page rp-rl-page">
                <SideBarMenu />
                <div className="rp-rl-container">
                    <p>로딩 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rp-review-page rp-rl-page">
                <SideBarMenu />
                <div className="rp-rl-container">
                    <p className="rp-error-message">{error}</p>
                </div>
            </div>
        );
    }

    if (!user || !user.id) {
        return (
            <div className="rp-review-page rp-rl-page">
                <SideBarMenu />
                <div className="rp-rl-container">
                    <div className="rp-review-list">
                        <div className="rp-list-header">
                            <h2>내가 남긴 리뷰</h2>
                        </div>
                        <p>로그인 후 리뷰 목록을 확인할 수 있습니다.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="rp-review-page rp-rl-page">
                <SideBarMenu />
                <div className="rp-rl-container">
                    <div className="rp-review-list">
                        <div className="rp-list-header">
                            <h2>내가 남긴 리뷰</h2>
                        </div>
                        <div className="rp-no-reviews-container">
                             <img 
                                src={`${process.env.PUBLIC_URL}/images/icon/noresult/REVIEW_NORESULT.png`} 
                                alt="리뷰 없음" 
                                style={{ width: '60%', margin: '0 auto', display: 'block' }}
                            />
                             <p>작성된 리뷰가 없습니다.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rp-review-page rp-rl-page">
            <SideBarMenu />
            <div className="rp-rl-container">
                <main className='rp-rl-main'>
                    <div className="rp-review-list">
                        <div className="rp-list-header">
                            <h2>내가 남긴 리뷰</h2>
                        </div>
                        {loading ? (
                            <div className="rp-loading-message">로딩 중...</div>
                        ) : error ? (
                            <div className="rp-error-message">{error}</div>
                        ) : (
                            <div className="rp-review-list-container">
                                {reviews.length > 0 ? (
                                    reviews.map((review) => (
                                        <div key={review.reviewId} className="rp-review-card">
                                            <div className="rp-review-text">
                                                {Array.from({ length: review.rating }, (_, i) => (
                                                <span key={i} className="star" style={{fontSize:'20px'}}>⭐</span>
                                                ))}
                                                <div style={{ display: 'flex', alignItems: 'end', marginTop:'10px' }}>
                                                    {review.menuScore === 0 && <span className="review-solo-feature" style={{marginLeft:'0px'}}>혼밥메뉴가 다양함</span>}
                                                    {review.seatScore === 0 && <span className="review-solo-feature">혼밥좌석이 많음</span>}
                                                </div>
                                                <p className="rp-review-date">{review.createdAt}</p>
                                                <p className="rp-review-content-text">{review.reviewComment}</p>
                                            </div>
                                            <div className="rp-restaurant-info">
                                                <div className="rp-restaurant-image" 
                                                    style={{ backgroundImage: `url(${review.restaurantPhotoUrl || '/images/restaurant/BASIC_RESTAURANT_IMAGE.jpg'})` }}
                                                    onClick={() => navigate(`/restaurants/detail/${review.restaurantId}`)}
                                                ></div>
                                                <div className="rp-restaurant-details">
                                                    <h4>{review.restaurantName}</h4>
                                                    <span>⭐ {review.restaurantAvgRating}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rp-no-reviews">
                                        <p>작성된 리뷰가 없습니다.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default ReviewPage;