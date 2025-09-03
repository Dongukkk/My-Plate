import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../api/api';
import AuthLayout from '../components/AuthLayout';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);     // 기본 로그인 버튼 로딩
  const [sso, setSso] = useState('');                // 'google' | 'naver' | 'kakao' | ''  (소셜 로딩표시)

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/mypage';

  // 기본 이메일/비번 로그인
  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading || sso) return;
    setLoading(true);
    setMsg('로그인 시도 중...');

    try {
      const res = await api.post('/login', { email, password });

      const access =
        res.data?.access ?? res.data?.accessToken ?? res.data?.token ?? res.data?.jwt ?? null;
      const refresh =
        res.data?.refresh ?? res.data?.refreshToken ?? null;

      if (!access) {
        setMsg('응답에 access 토큰이 없습니다.');
        return;
      }

      localStorage.setItem('access', access);
      if (refresh) localStorage.setItem('refresh', refresh);

      setPassword('');
      setMsg('성공! 이동합니다...');
      navigate(from, { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      setMsg(typeof data === 'string' ? data : (data?.message || `로그인 실패 (status ${status ?? '??'})`));
    } finally {
      setLoading(false);
    }
  };

  // 공통: 소셜 시작 헬퍼
  const startSso = async (provider, urlPath, movingMsg, failMsg) => {
    if (loading || sso) return;
    setSso(provider);
    setMsg(movingMsg);
    try {
      const { data } = await api.get(urlPath, { baseURL: '/api' }); // 백엔드가 동의화면 URL 생성
      if (!data?.url) {
        setMsg(failMsg);
        setSso('');
        return;
      }
      window.location.href = data.url; // 동의화면으로 이동(페이지 전환)
    } catch (e) {
      console.error(e);
      setMsg(failMsg);
      setSso('');
    }
  };

  // 구글 OAuth
  const goGoogle = () =>
    startSso('google', '/oauth/google/url', '구글 로그인으로 이동합니다...', '구글 로그인 시작 중 오류가 발생했습니다.');

  // 네이버 OAuth
  const goNaver = () =>
    startSso('naver', '/oauth/naver/url', '네이버 로그인으로 이동합니다...', '네이버 로그인 시작 중 오류가 발생했습니다.');

  // 카카오 OAuth
  const goKakao = () =>
    startSso('kakao', '/oauth/kakao/url', '카카오 로그인으로 이동합니다...', '카카오 로그인 시작 중 오류가 발생했습니다.');

  const anyBusy = loading || !!sso;

  return (
    <AuthLayout imageSrc="/login-hero.jpg" title="My Plate">
      <h2 className="lp-login-title">로그인</h2>
      <p className="lp-login-sub">계정에 로그인하여 맞춤형 추천을 받아보세요</p>

      <form onSubmit={onSubmit} className="lp-login-form">
        <label className="lp-login-field">
          <span className="lp-login-label">이메일</span>
          <input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={anyBusy}
          />
        </label>

        <label className="lp-login-field">
          <span className="lp-login-label">비밀번호</span>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={anyBusy}
          />
        </label>

        <div className="lp-login-row lp-login-between">
          <label className="lp-login-checkbox">
            <input type="checkbox" disabled={anyBusy} /> 자동 로그인
          </label>
          <Link to="/forgot" className="lp-login-link">비밀번호를 잊으셨나요?</Link>
        </div>

        <button className="lp-login-btnPrimary" disabled={anyBusy} aria-busy={loading}>
          {loading ? '로그인 중…' : '로그인'}
        </button>
      </form>

      {msg && <div className="lp-login-hint">{msg}</div>}

      <div className="lp-login-divider">또는</div>

      <div className="lp-login-row lp-login-gap8">
        <button
          className="lp-login-btnGhost"
          type="button"
          onClick={goKakao}
          disabled={anyBusy}
          aria-busy={sso === 'kakao'}
        >
          <img src={`${process.env.PUBLIC_URL}/images/icon/sns/kakao.png`} className='lp-login-btnGhost-img'></img>
        </button>
        <button
          className="lp-login-btnGhost"
          type="button"
          onClick={goNaver}
          disabled={anyBusy}
          aria-busy={sso === 'naver'}
        >
          <img src={`${process.env.PUBLIC_URL}/images/icon/sns/naver.png`} className='lp-login-btnGhost-img'></img>
        </button>

        <button
          className="lp-login-btnGhost"
          type="button"
          onClick={goGoogle}
          disabled={anyBusy}
          aria-busy={sso === 'google'}
        >
          <img src={`${process.env.PUBLIC_URL}/images/icon/sns/google.png`} className='lp-login-btnGhost-img'></img>
        </button>
      </div>

      <div className="lp-login-foot">
        <span>계정이 없으신가요?</span>
        <Link to="/register" className="lp-login-linkStrong">회원가입</Link>
      </div>
    </AuthLayout>
  );
}