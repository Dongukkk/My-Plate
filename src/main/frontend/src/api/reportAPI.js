// src/api/reportAPI.js
export const createTicket = (reportData) => ({
  id: `TICKET-${Date.now()}`,
  type: reportData.type,
  targetId: reportData.targetId,
  reason: reportData.reason,
  details: reportData.details || '',
  attachmentName: reportData.attachment ? reportData.attachment.name : null,
  status: 'new',
  timestamp: new Date().toLocaleString('ko-KR'),
});

export const submitReportAPI = (reportData) => {
  return new Promise((resolve) => {
    console.log("서버로 신고 데이터 전송:", reportData);
    setTimeout(() => {
      const newTicket = createTicket(reportData);
      resolve(newTicket);
    }, 1000);
  });
}; //-----------껍데기 용


// import axios from 'axios';

// // 이전에 설정한 apiClient 인스턴스를 재사용합니다.
// // 만약 다른 파일에 있다면 import 해서 사용하세요.
// const apiClient = axios.create({
//   baseURL: process.env.REACT_APP_API_BASE_URL || 'https://your-real-api-server.com/api',
// });

// /**
//  * 서버에 새로운 신고 데이터를 전송(생성)합니다. (POST 요청)
//  * @param {object} reportData - 컴포넌트에서 전달받은 신고 데이터 객체
//  * @returns {Promise<object>} 서버로부터 응답받은 생성된 티켓 정보
//  */
// export const submitReportAPI = async (reportData) => {
//   try {
//     // '/reports' 엔드포인트에 reportData를 body에 담아 POST 요청을 보냅니다.
//     // 폼 데이터(파일 포함)를 보내는 경우, 두 번째 인자를 FormData 객체로 보내야 합니다.
//     const response = await apiClient.post('/reports', reportData); 
    
//     // 요청이 성공하면 서버가 생성해서 보내준 새로운 티켓 데이터를 반환합니다.
//     return response.data;
//   } catch (error) {
//     // 네트워크 에러나 서버 에러 발생 시
//     console.error("신고 제출 중 에러 발생:", error);
//     // 에러를 상위 컴포넌트로 전달하여 UI에서 처리할 수 있도록 합니다.
//     throw error;
//   }
// };