import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../api/api';
import AuthLayout from '../components/AuthLayout';
import './Login.css'; 

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/mypage';

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setMsg('로그인 시도 중...');

    try {
      const res = await api.post('/login', { email, password });
      const token =
        res.data?.access ?? res.data?.accessToken ?? res.data?.token ?? res.data?.jwt ?? null;

      if (token) {
        localStorage.setItem('access', token);
        setPassword('');
        setMsg('성공! 이동합니다...');
        navigate(from, { replace: true });
      } else {
        setMsg('응답에 토큰이 없습니다.');
      }
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      setMsg(typeof data === 'string' ? data : (data?.message || `로그인 실패 (status ${status ?? '??'})`));
    } finally {
      setLoading(false);
    }
  };

     // 구글 OAuth 
  const goGoogle = async () => {
    try {
      setMsg('구글 로그인으로 이동합니다...');
      // 백엔드가 동의화면 URL을 만들어 줌
      const { data } = await api.get('/oauth/google/url');
      if (!data?.url) {
        setMsg('구글 로그인 URL 생성 실패');
        return;
      }

      window.location.href = data.url;

        } catch (e) {
      console.error(e);
      setMsg('구글 로그인 시작 중 오류가 발생했습니다.');
    }
  };

  return (
    <AuthLayout imageSrc="/login-hero.jpg" title="My Plate">
      <h2 className="login-title">로그인</h2>
      <p className="login-sub">계정에 로그인하여 맞춤형 추천을 받아보세요</p>

      <form onSubmit={onSubmit} className="login-form">
        <label className="login-field">
          <span className="login-label">이메일</span>
          <input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="login-field">
          <span className="login-label">비밀번호</span>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <div className="login-row login-between">
          <label className="login-checkbox">
            <input type="checkbox" /> 자동 로그인
          </label>
          <Link to="/forgot" className="login-link">비밀번호를 잊으셨나요?</Link>
        </div>

        <button className="login-btnPrimary" disabled={loading}>
          {loading ? '로그인 중…' : '로그인'}
        </button>
      </form>

      {msg && <div className="login-hint">{msg}</div>}

      <div className="login-divider">또는</div>

      <div className="login-row login-gap8">
        <button className="login-btnGhost" type="button">카카오</button>
        <button className="login-btnGhost" type="button">네이버</button>
        <button className="login-btnGhost" type="button" onClick={goGoogle}>구글</button>
      </div>

      <div className="login-foot">
        <span>계정이 없으신가요?</span> <br></br>
        <Link to="/register" className="login-linkStrong">회원가입</Link>
      </div>
    </AuthLayout>
  );
}