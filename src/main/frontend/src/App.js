import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register'; 
import MyPage from './pages/MyPage';
import AdminPage from './pages/AdminPage'; 
import ProtectedRoute from './routes/ProtectedRoute';
import Forbidden from './pages/Forbidden';
import Forgot from './pages/Forgot';
import Reset from './pages/Reset';
import GoogleCallback from './pages/GoogleCallback';

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

        {/* 관리자만 */}
        <Route element={<ProtectedRoute roles={['Admin']} />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

         {/* ➕ Forbidden 페이지 */}
        <Route path="/forbidden" element={<Forbidden />} />

        {/* 기본 */}
        <Route path="*" element={<Navigate to="/login" replace />} />

        <Route path='/reset' element={<Reset />} />

        {/* 구글 */}
        <Route path="/oauth/google/callback" element={<GoogleCallback />} />

      </Routes>
    </BrowserRouter>
  );
}