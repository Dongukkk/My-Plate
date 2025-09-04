import React, { useState } from 'react';
import TicketList from '../components/TicketList/TicketList';
import DetailsModal from '../components/TicketList/DetailsModal';

// AdminPage.js 파일 내부에 CSS를 추가하여 하나의 파일로 만듭니다.
const styles = `
.container {
    width: 100%;
    max-width: 1000px;
    padding: 20px;
    box-sizing: border-box;
    margin: 0 auto;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.card-header h2 {
    font-size: 2rem;
    color: #333;
}

.button {
    padding: 10px 20px;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s, color 0.3s;
    border: none;
}

.button-primary {
    background-color: #007bff;
    color: white;
}

.button-primary:hover {
    background-color: #0056b3;
}

.card {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.card h3 {
    margin-top: 0;
    font-size: 1.5rem;
    color: #495057;
    border-bottom: 2px solid #e9ecef;
    padding-bottom: 10px;
    margin-bottom: 20px;
}

.resolved-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.resolved-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.resolved-item-text {
    flex-grow: 1;
    font-size: 0.9rem;
    color: #6c757d;
}

.resolved-item-buttons {
    display: flex;
    gap: 10px;
}

.button-danger {
    background-color: #dc3545;
    color: white;
}

.button-danger:hover {
    background-color: #c82333;
}

.button-info {
    background-color: #ffc107;
    color: #333;
}

.button-info:hover {
    background-color: #e0a800;
}
`;

const AdminPage = ({ onSwitchView, tickets, onStatusChange, onDeleteReview, onDeleteStoreInfo }) => {
    const [selectedDetails, setSelectedDetails] = useState(null);

    // 티켓 상태에 따라 목록을 분리합니다.
    const unresolvedTickets = (tickets || []).filter(ticket => ticket.status !== 'resolved');
    const resolvedTickets = (tickets || []).filter(ticket => ticket.status === 'resolved');

    const handleViewDetails = (details) => {
        setSelectedDetails(details);
    };

    const handleCloseDetailsModal = () => {
        setSelectedDetails(null);
    };

    return (
        <div className="container">
            {/* 스타일 태그를 여기에 추가하여 컴포넌트 내부에 CSS를 포함시킵니다. */}
            <style>{styles}</style>
            
            <div className="card-header">
                <h2>신고 관리 시스템</h2>
                <button onClick={() => onSwitchView('store')} className="button button-primary">
                    가게 페이지로
                </button>
            </div>
            
            <div className="card">
                <h3>접수된 신고 목록 ({unresolvedTickets.length}건)</h3>
                <TicketList
                    tickets={unresolvedTickets}
                    onStatusChange={onStatusChange}
                    onViewDetails={handleViewDetails}
                />
            </div>
            
            <div className="card">
                <h3>조치 완료 목록 ({resolvedTickets.length}건)</h3>
                <div className="resolved-list">
                    {resolvedTickets.map(ticket => (
                        <div key={ticket.id} className="resolved-item">
                            <span className="resolved-item-text">
                                <strong>[{ticket.type === 'review' ? '리뷰' : '가게 정보'}]</strong> {ticket.details}
                            </span>
                            <div className="resolved-item-buttons">
                                {ticket.type === 'review' ? (
                                    <button
                                        onClick={() => onDeleteReview(ticket.targetId)}
                                        className="button button-danger"
                                    >
                                        리뷰 삭제
                                    </button>
                                ) : (
                                    <button
                                    onClick={() => onDeleteStoreInfo(ticket.id)} // ticket.targetId -> ticket.id
                                    className="button button-info"
                                    >
                                        정보 삭제
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <DetailsModal
                isOpen={selectedDetails !== null}
                onClose={handleCloseDetailsModal}
                details={selectedDetails}
            />
        </div>
    );
};

export default AdminPage;
