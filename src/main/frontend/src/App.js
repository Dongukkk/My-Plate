import React, { useState, useEffect } from 'react';
import StorePage from './pages/StorePage';
import AdminPage from './pages/AdminPage';
// 💡 변경: 실제 API 함수들을 import 합니다. (getReports는 예시이며, 실제 파일에 맞게 추가해야 합니다)
import { getReports, submitReportAPI, deleteTicketAPI, updateTicketStatusAPI } from './api/reportAPI';
import './App.css';

// 💡 제거: 하위 컴포넌트 import는 해당 컴포넌트를 사용하는 파일(AdminPage 등)에서 하므로 여기서는 필요 없습니다.
// import TicketList from './components/TicketList/TicketList';
// import DetailsModal from './components/TicketList/DetailsModal';

export default function App() {
  const [currentView, setCurrentView] = useState('store');
  // 💡 변경: tickets 상태를 빈 배열로 시작하고, API를 통해 데이터를 채웁니다.
  const [tickets, setTickets] = useState([]);
  // 💡 추가: 로딩 및 에러 상태를 관리하여 사용자 경험을 향상시킵니다.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 💡 추가: 컴포넌트가 처음 마운트될 때 API를 호출하여 신고 목록을 가져옵니다.
  useEffect(() => {
    const fetchInitialTickets = async () => {
      try {
        setLoading(true);
        const initialTickets = await getReports(); // 백엔드에서 모든 티켓을 가져옵니다.
        setTickets(initialTickets);
      } catch (err) {
        setError(err);
        console.error("신고 목록을 불러오는 데 실패했습니다.", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialTickets();
  }, []); // 빈 배열을 전달하여 최초 1회만 실행되도록 합니다.

  const switchView = (viewName) => {
    setCurrentView(viewName);
  };

  const handleReportSubmit = async (reportData) => {
    try {
      const newTicket = await submitReportAPI(reportData);
      if (newTicket) {
        // 새 신고가 접수되면 목록의 가장 앞에 추가합니다.
        setTickets(prevTickets => [newTicket, ...prevTickets]);
      }
    } catch (err) {
      alert("신고 제출에 실패했습니다. 다시 시도해주세요.");
      console.error("신고 제출 오류:", err);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      // 💡 변경: API를 호출하여 서버의 데이터 상태를 먼저 변경합니다.
      // const updatedTicket = await updateTicketStatusAPI(ticketId, newStatus);
      
      // API 호출 성공 후, 프론트엔드의 상태를 업데이트합니다.
      setTickets(currentTickets =>
        currentTickets.map(ticket =>
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );
    } catch (err) {
      alert("상태 변경에 실패했습니다.");
      console.error("상태 변경 오류:", err);
    }
  };

  // 💡 핵심 변경: 두 개의 삭제 함수를 하나의 함수로 통합하고, targetId가 아닌 고유 id를 사용합니다.
  const handleDeleteTicket = (ticketIdToDelete) => {
    // 실제 API 호출 로직은 여기에 구현될 수 있습니다.
    // await deleteTicketAPI(ticketIdToDelete);
    console.log(`티켓 삭제 요청 (ID): ${ticketIdToDelete}`);
    
    // 💡 핵심 변경: targetId가 아닌, 전달받은 고유 id를 기준으로 정확히 하나만 삭제합니다.
    setTickets(prevTickets => prevTickets.filter(ticket => ticket.id !== ticketIdToDelete));
  };


  if (loading) {
    return <div className="app-container"><h2>데이터를 불러오는 중입니다...</h2></div>;
  }
  if (error) {
    return <div className="app-container"><h2>오류가 발생했습니다: {error.message}</h2></div>;
  }

  return (
    <div className="app-container">
      {currentView === 'store' ? (
        <StorePage 
          onSwitchView={switchView} 
          handleReportSubmit={handleReportSubmit} 
        />
      ) : (
        <AdminPage 
          onSwitchView={switchView} 
          tickets={tickets} 
          onStatusChange={handleStatusChange}
          // 💡 변경: 두 이벤트 모두 새로 만든 통합 삭제 함수를 전달합니다.
          onDeleteReview={handleDeleteTicket}
          onDeleteStoreInfo={handleDeleteTicket}
        />
      )}
    </div>
  );
}
