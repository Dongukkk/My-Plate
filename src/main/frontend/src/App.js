import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './account/Login';
import Register from './account/Register'; 
import MyPage from './account/MyPage';
import ProtectedRoute from './routes/ProtectedRoute';
import Forbidden from './account/Forbidden';
import Forgot from './account/Forgot';
import Reset from './account/Reset';
import OAuthCallback from './account/OAuthCallback';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<Forgot />} />

        {/* 로그인만 필요 */}
        <Route element={<ProtectedRoute />}>
          <Route path="/mypage" element={<MyPage />} />
        </Route>


         {/* ➕ Forbidden 페이지 */}
        <Route path="/forbidden" element={<Forbidden />} />

        {/* 기본 */}
        <Route path="*" element={<Navigate to="/login" replace />} />

        <Route path='/reset' element={<Reset />} />

        {/* 구글, 네이버, 카카오 콜백 */}
        <Route path="/oauth/:provider/callback" element={<OAuthCallback />} />

      </Routes>
    </BrowserRouter>
  );
}