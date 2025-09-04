// src/components/ReviewApp.js
import React, { useState } from 'react';
import GuideModal from './GuideModal'; // 바로 아래에서 만들 파일
import './ReviewApp.css'; // 바로 아래에서 만들 파일

const ReviewApp = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="review-app-container">
      <h2>맛집 리뷰 작성하기</h2>
      <textarea placeholder="음식에 대한 솔직한 리뷰를 남겨주세요..." />
      <div className="button-group">
        <button className="guide-button" onClick={openModal}>
          📸 사진 촬영 가이드 보기
        </button>
        <button className="submit-button">리뷰 등록</button>
      </div>

      {isModalOpen && <GuideModal onClose={closeModal} />}
    </div>
  );
};

export default ReviewApp;