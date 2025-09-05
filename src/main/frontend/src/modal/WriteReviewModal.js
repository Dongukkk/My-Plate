import { useState, useEffect } from "react";
import "./WriteReviewModal.css";
import axios from "axios";
import { useSelector } from 'react-redux';

function WriteReviewModal({ restaurantId, initialReviewData, onClose, onReviewSubmitted }) {
  const user = useSelector(state => state.user);
  const [rating, setRating] = useState(initialReviewData ? initialReviewData.rating : 0);
  const [menuScore, setMenuScore] = useState(initialReviewData ? initialReviewData.menuScore : 1);
  const [seatScore, setSeatScore] = useState(initialReviewData ? initialReviewData.seatScore : 1);
  const [reviewComment, setReviewComment] = useState(initialReviewData ? initialReviewData.reviewComment : "");


    useEffect(() => {
        if (initialReviewData) {
            setRating(initialReviewData.rating);
            setMenuScore(initialReviewData.menuScore);
            setSeatScore(initialReviewData.seatScore);
            setReviewComment(initialReviewData.reviewComment);
        }
    }, [ initialReviewData ]);

  const handleSubmit = async () => {
    if (!reviewComment) {
      alert("리뷰 내용을 작성해주세요.");
      return;
    }

    if (rating === 0) {
    alert("별점을 선택해주세요.");
    return;
}
    
    const reviewData = {
      restaurantId: Number(restaurantId),
      userId: user.id,
      rating,
      menuScore,
      seatScore,
      reviewComment,
    };

    try {
      const access = localStorage.getItem('access');
        if (initialReviewData) {
            // 💡 리뷰 수정 (PUT)
            await axios.put(`/api/reviews/${initialReviewData.id}`, reviewData, {
                headers: { 'Authorization': `Bearer ${access}` }
            });
            alert("리뷰가 성공적으로 수정되었습니다!");
        } else {
            // 💡 리뷰 작성 (POST)
            await axios.post(`/api/restaurants/${restaurantId}/reviews`, reviewData, {
                headers: { 'Authorization': `Bearer ${access}` }
            });
            alert("리뷰가 성공적으로 등록되었습니다!");
        }
      onClose();
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error("리뷰 제출 실패:", error);
      alert("리뷰 제출에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="wr-modal-backdrop">
      <div className="wr-modal-content">
        <h2>{initialReviewData ? "리뷰 수정" : "리뷰 작성"}</h2>
        <div className="wr-review-form">
          <label>
            <label>
            별점:
            <div className="wr-star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`wr-star ${rating >= star ? "active" : ""}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </label>
          </label>
          <div style={{display:'flex', justifyContent:'space-between'}}>
          <div
            className={`wr-score-box ${menuScore === 0 ? "active" : ""}`}
            onClick={() => setMenuScore(menuScore === 1 ? 0 : 1)}
          >
            혼밥 메뉴가 다양함
          </div>

          <div
            className={`wr-score-box ${seatScore === 0 ? "active" : ""}`}
            onClick={() => setSeatScore(seatScore === 1 ? 0 : 1)}
          >
            혼밥 좌석이 많음
          </div>
          </div>
          <label>
            리뷰 내용:
            <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} 
                style={{height:'200px'}}/>
          </label>
        </div>
        <div className="wr-modal-actions">
          <button onClick={handleSubmit}>{initialReviewData ? "수정" : "제출"}</button>
          <button onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
}

export default WriteReviewModal;