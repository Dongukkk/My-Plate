import React, { useState, useEffect, useCallback } from 'react';
import './Report.css';

// XIcon 컴포넌트
const XIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const ReportModal = ({ isOpen, onClose, onSubmit, reportContext, reportConfig }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const defaultReason = reportConfig.reasons[reportContext.type]?.[0]?.value || '';
      setReason(defaultReason);
      setDetails('');
    }
  }, [isOpen, reportContext.type, reportConfig.reasons]);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    onClose();
  }, [onClose, isSubmitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      alert('신고 사유를 선택해주세요.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        type: reportContext.type,
        targetId: reportContext.id,
        reason,
        details,
      });
      alert('신고가 성공적으로 접수되었습니다!');
      handleClose();
    } catch (error) {
      console.error('신고 제출 중 오류:', error);
      alert('신고 접수 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const reasonOptions = reportConfig.reasons[reportContext.type] || [];

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="report-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>신고하기: {reportConfig.types[reportContext.type] || '신고'}</h2>
          <button onClick={handleClose} disabled={isSubmitting} className="close-button">
            <XIcon />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          {/* 💡 변경: 불필요한 클래스(reason-group, details-group) 제거 */}
          <div className="form-group">
            <label htmlFor="report-reason">신고 사유 *</label>
            <select
              id="report-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              required
            >
              <option value="" disabled>선택</option>
              {reasonOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="report-details">상세 내용 (선택)</label>
            <textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="문제에 대해 자세히 알려주세요."
              disabled={isSubmitting}
            />
          </div>
        </form>
        
        <div className="modal-footer">
          <button type="button" onClick={handleClose} className="button button-secondary" disabled={isSubmitting}>
            취소
          </button>
          <button type="submit" onClick={handleSubmit} className="button button-primary" disabled={isSubmitting}>
            {isSubmitting ? '제출 중...' : '신고 제출'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;

