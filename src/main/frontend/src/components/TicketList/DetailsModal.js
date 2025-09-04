import React from 'react';
import './DetailsModal.css'; // 상세 모달 전용 CSS

const DetailsModal = ({ isOpen, onClose, details }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="details-modal-overlay" onClick={onClose}>
      <div className="details-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="details-modal-header">
          <h4>신고 상세 내용</h4>
          <button onClick={onClose} className="details-modal-close-btn">&times;</button>
        </div>
        <div className="details-modal-body">
          {details || '상세 내용이 없습니다.'}
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;
