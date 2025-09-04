import React, { useState } from 'react';
import ReportModal from '../report/Report';
import { REPORT_CONFIG } from '../constants/reportConfig';
import { submitReportAPI } from '../api/reportAPI';

const SirenIcon = ({ size = 16 }) => ( <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <path d="M7 12a5 5 0 0 1 10 0"/><path d="M5 20a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2H5v-2Z"/><path d="M21 12h1"/><path d="M2 12h1"/><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/><path d="m6.34 17.66-1.41 1.41"/></svg> );

const StorePage = ({ onSwitchView, handleReportSubmit }) => {
    const [reportContext, setReportContext] = useState(null);
    const isModalOpen = !!reportContext;

    // 💡 변경: 리뷰 데이터의 ID를 다양하게 수정하고, 목록을 늘렸습니다.
    const reviews = [
      { id: 'rev-cde345', author: '김**', content: '정말 맛있어요! 인생 치킨입니다.', hasPhoto: true },
      { id: 'rev-fgh678', author: '이**', content: '배달이 빨라서 좋네요.', hasPhoto: false },
      { id: 'rev-ijk901', author: '박**', content: '가격이 조금 비싸지만 맛은 확실합니다.', hasPhoto: true },
      { id: 'rev-lmn234', author: '최**', content: '다음에도 또 시켜먹을게요!', hasPhoto: false },
    ];
    const storeInfo = {
      name: '맛있닭 치킨',
      address: '서울시 강남구 테헤란로 123',
    };

    const openReportModal = (type, id) => setReportContext({ type, id });
    const closeReportModal = () => setReportContext(null);
    
    return (
        <div className="page-container">
            <header className="page-header">
                <div className="container">
                    <h1>{storeInfo.name} (가게 상세)</h1>
                    <button onClick={() => onSwitchView('admin')} className="button button-dark">운영자 페이지로</button>
                </div>
            </header>
            <main className="container">
                <div className="card">
                    <div className="card-header">
                        <h2>가게 정보</h2>
                        <button onClick={() => openReportModal('store', 'store-info')} className="button button-report">
                            <SirenIcon size={16} /> 정보 수정 신고
                        </button>
                    </div>
                    <p><strong>주소:</strong> {storeInfo.address}</p>
                </div>
                
                <div className="card">
                    <h2>리뷰 ({reviews.length}개)</h2>
                    <div className="review-list">
                        {reviews.map(review => (
                            <div key={review.id} className="review-item">
                                <div className="review-content">
                                    <p>"{review.content}"</p>
                                    <p className="review-author">- {review.author}</p>
                                </div>
                                {/* 이제 각기 다른 ID로 신고를 접수할 수 있습니다. */}
                                <button onClick={() => openReportModal('review', review.id)} className="review-report-button" aria-label={`${review.id} 리뷰 신고하기`}>
                                    <SirenIcon size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {isModalOpen && (
                <ReportModal
                    isOpen={isModalOpen}
                    onClose={closeReportModal}
                    onSubmit={handleReportSubmit}
                    reportContext={reportContext}
                    reportConfig={REPORT_CONFIG}
                />
            )}
        </div>
    );
};

export default StorePage;

