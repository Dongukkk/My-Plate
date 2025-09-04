import { useState, useEffect } from "react";
import { getRestaurantReviews } from "../api/api";
import "./ReviewModal.css";

const ReviewModal = ({ restaurantId, onClose }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const reviewsPerPage = 4; // 페이지당 보여줄 리뷰 수

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                // 백엔드 API를 호출하여 전체 리뷰 데이터를 가져옵니다.
                // 이 예시에서는 페이지네이션 처리를 프론트엔드에서 합니다.
                // 더 효율적인 방법은 백엔드에서 페이지네이션을 처리하는 것입니다.
                const data = await getRestaurantReviews(restaurantId);
                setReviews(data);
                setLoading(false);
            } catch (e) {
                console.error("리뷰를 불러오는 데 실패했습니다:", e);
                setError("리뷰를 불러오는 데 실패했습니다.");
                setLoading(false);
            }
        };
        fetchReviews();
    }, [restaurantId]);

    // 현재 페이지에 해당하는 리뷰 목록 계산
    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

    // 총 페이지 수 계산
    const totalPages = Math.ceil(reviews.length / reviewsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) return <div>리뷰를 불러오는 중입니다...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>전체 리뷰 ({reviews.length})</h3>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    {currentReviews.length > 0 && (
                        <ul className="review-list">
                            {currentReviews.map((review) => (
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
                    )}
                </div>
                {totalPages > 1 && (
                    <div className="pagination">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => paginate(i + 1)}
                                className={currentPage === i + 1 ? "active" : ""}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewModal;