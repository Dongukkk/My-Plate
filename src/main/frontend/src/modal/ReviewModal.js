import { useState, useEffect, useRef } from "react";
import { getRestaurantReviews } from "../api/api";
import "./ReviewModal.css";
import { useSelector } from "react-redux";
import axios from "axios";
import WriteReviewModal from "./WriteReviewModal";

const ReviewModal = ({ restaurant, onClose, onReviewSubmitted, fetchReview, onDeleteReview }) => {
    const user = useSelector(state => state.user);

    const [ reviews, setReviews ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);
    const [ currentPage, setCurrentPage ] = useState(1);
    const reviewsPerPage = 4;

    const [ selectedReviewId, setSelectedReviewId ] = useState(null);
    const menuRef = useRef(null);

    const [ isWriteReviewModalOpen, setIsWriteReviewModalOpen ] = useState(false);
    const [ reviewToEdit, setReviewToEdit ] = useState(null);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const data = await getRestaurantReviews(restaurant.id);
            setReviews(data);
            setLoading(false);
        } catch (e) {
            console.error("리뷰를 불러오는 데 실패했습니다:", e);
            setError("리뷰를 불러오는 데 실패했습니다.");
            setLoading(false);
        }
        fetchReview();
    };

    useEffect(() => {
        fetchReviews();
    }, [ restaurant.id ]);

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

    const handleEditReview = (review) => {
        setReviewToEdit(review);
        setIsWriteReviewModalOpen(true);
        setSelectedReviewId(null);
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("정말 리뷰를 삭제하시겠습니까?")) {
            return;
        }
        try {
            onDeleteReview(reviewId);
            fetchReviews();
            
        } catch (error) {
            console.error("리뷰 삭제 실패:", error);
            alert("리뷰 삭제에 실패했습니다.");
        }
        setSelectedReviewId(null);
    };

    const handleReviewSubmitted = () => {
        fetchReviews();
        setIsWriteReviewModalOpen(false);
        if (onReviewSubmitted) {
            onReviewSubmitted();
        }
    };

    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

    const totalPages = Math.ceil(reviews.length / reviewsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) return <div>리뷰를 불러오는 중입니다...</div>;
    if (error) return <div>{error}</div>;

    return (
        <>
            <div className="modal-overlay">
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>전체 리뷰 ({reviews.length})</h3>
                        <button onClick={onClose} className="modal-close-btn">&times;</button>
                    </div>
                    <div className="modal-body">
                        {currentReviews.length > 0 ? (
                            <ul className="review-list">
                                {currentReviews.map((review) => (
                                    <li key={review.id} className="rd-review-item">
                                        <div className="review-header">
                                            <div className="review-author" style={{ display: 'flex', padding: '10px 0', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex' }}>
                                                    <div style={{ fontSize: '20px' }}>{review.username}
                                                        {(user && user.id && user.id === review.userId) && <span style={{fontSize:'14px', color:'gray'}}>(나)</span>}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'end' }}>
                                                        {review.menuScore === 0 && <span className="review-solo-feature">혼밥메뉴가 다양함</span>}
                                                        {review.seatScore === 0 && <span className="review-solo-feature">혼밥좌석이 많음</span>}
                                                    </div>
                                                </div>
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
                                                            {(user && user.id && user.id === review.userId) &&
                                                                <div className="review-menu-item"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditReview(review);
                                                                    }}
                                                                >
                                                                    수정
                                                                </div>
                                                            }
                                                            {(user && user.id && user.id === review.userId) &&
                                                                <div className="review-menu-item"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteReview(review.id);
                                                                    }}
                                                                >
                                                                    삭제
                                                                </div>
                                                            }
                                                            {!(user && user.id && user.id === review.userId) &&
                                                                <div className="review-menu-item"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                    }}
                                                                >
                                                                    신고
                                                                </div>
                                                            }

                                                        </div>
                                                    )}

                                                </div>

                                            </div>
                                            <span className="review-rating">
                                                {Array.from({ length: review.rating }, (_, i) => (
                                                    <span key={i} className="star">⭐</span>
                                                ))}
                                                <div style={{ display: 'inline-block', marginLeft: '5px', verticalAlign: 'bottom', fontSize: '14px', color: 'gray' }}>{`(${review.rating})`}</div>
                                            </span>
                                        </div>
                                        <p className="review-comment">{review.reviewComment}</p>
                                        <div style={{ width: '100%', textAlign: 'end' }}>
                                            <span className="review-date" style={{ fontSize: '14px', color: 'gray' }}>{review.updatedAt ? review.updatedAt + `(수정됨)` : review.createdAt}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div>아직 작성된 리뷰가 없습니다.</div>
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
            {isWriteReviewModalOpen && (
                <WriteReviewModal
                    restaurant={restaurant}
                    initialReviewData={reviewToEdit}
                    onClose={() => setIsWriteReviewModalOpen(false)}
                    onReviewSubmitted={handleReviewSubmitted}
                    fetchReviews={fetchReviews}
                />
            )}
        </>
    );
};

export default ReviewModal;