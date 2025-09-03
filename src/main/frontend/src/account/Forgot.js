import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import AuthLayout from '../components/AuthLayout';
import './Forgot.css'; // 일반 CSS

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading || !emailValid) return;

    setLoading(true);
    setOk(false);
    setMsg('요청 중…');

    try {
      await api.post('/users/forgot-password', { email });
      setOk(true);
      setMsg('재설정 링크를 이메일로 보냈습니다. 메일함을 확인하세요.');
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      setOk(false);
      setMsg(typeof data === 'string'
        ? data
        : (data?.message || `요청 실패 (status ${status ?? '??'})`));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout imageSrc="/login-hero.jpg" title="My Plate">
      <h2 className="lp-forgot-title">비밀번호 재설정</h2>
      <p className="lp-forgot-sub">
        가입하신 이메일 주소로 비밀번호 재설정 링크를 보내드립니다.
      </p>

      <form onSubmit={onSubmit} className="lp-forgot-form">
        <label className="lp-forgot-field">
          <span className="lp-forgot-label">이메일</span>
          <input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </label>

        <button
          className="lp-forgot-btnPrimary"
          disabled={loading || !emailValid}
          aria-busy={loading}
        >
          {loading ? '전송 중…' : '재설정 링크 전송'}
        </button>
      </form>

      {msg && <div className={`lp-forgot-hint ${ok ? 'ok' : ''}`}>{msg}</div>}

      <div className="lp-forgot-foot">
        <Link to="/login" className="lp-forgot-link">로그인 페이지로 돌아가기</Link>
      </div>
    </AuthLayout>
  );
}