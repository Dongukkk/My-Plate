import React from 'react';
import './TicketList.css';
import { REPORT_CONFIG } from '../../constants/reportConfig';

// onViewDetails, onStatusChange 함수를 props로 받습니다.
const TicketList = ({ tickets, onStatusChange, onViewDetails }) => {

  const getReasonText = (reasonValue, type) => {
    const reason = REPORT_CONFIG.reasons[type]?.find(r => r.value === reasonValue);
    return reason ? reason.label : reasonValue;
  };

  return (
    <>
      {/* 💡 변경: h3 태그는 AdminPage에서 관리하도록 이동하는 것을 권장합니다. */}
      {/* <h3>접수된 신고 목록 ({tickets.length}건)</h3> */}
      <div className="table-wrapper">
        {tickets.length > 0 ? (
          <table className="report-table">
            <thead>
              <tr>
                <th>대상 ID</th>
                <th>신고 유형</th>
                <th>신고 사유</th>
                <th>접수 시간</th>
                <th>상태</th>
                <th>상세 내용</th>
                <th>조치</th> {/* '첨부 파일' -> '조치'로 변경 */}
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket.id}>
                  <td>{ticket.targetId}</td>
                  <td>{REPORT_CONFIG.types[ticket.type] || ticket.type}</td>
                  <td>{getReasonText(ticket.reason, ticket.type)}</td>
                  <td>{ticket.timestamp}</td>
                  <td>
                    <span className={`status-badge status-${ticket.status}`}>
                      {REPORT_CONFIG.status[ticket.status] || ticket.status}
                    </span>
                  </td>
                  {/* 상세 내용 클릭 시 onViewDetails 함수 호출 */}
                  <td
                    className="truncate clickable"
                    title="클릭하여 상세 내용 보기"
                    onClick={() => onViewDetails(ticket.details)}
                  >
                    {ticket.details || '-'}
                  </td>
                  {/* 확인/완료 버튼 추가 */}
                  <td className="action-buttons">
                    <button
                      className="btn btn-confirm"
                      onClick={() => onStatusChange(ticket.id, 'in_progress')}
                      disabled={ticket.status !== 'new'}
                    >
                      확인
                    </button>
                    <button
                      className="btn btn-resolve"
                      onClick={() => onStatusChange(ticket.id, 'resolved')}
                      disabled={ticket.status === 'resolved'}
                    >
                      완료
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-tickets">접수된 신고가 없습니다.</p>
        )}
      </div>
    </>
  );
};

export default TicketList;
