import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import AuthLayout from '../components/AuthLayout';
import './Forgot.css'; // ★ 일반 CSS

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  // 간단한 이메일 유효성 (버튼 활성화용)
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
      // 백엔드 준비되면 이 URL을 백 규약에 맞게 바꿔줘
      await api.post('/users/forgot-password', { email });

      // 보통 200/204면 성공
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
      <h2 className="forgot-title">비밀번호 재설정</h2>
      <p className="forgot-sub">
        가입하신 이메일 주소로 비밀번호 재설정 링크를 보내드립니다.
      </p>

      <form onSubmit={onSubmit} className="forgot-form">
        <label className="forgot-field">
          <span className="forgot-label">이메일</span>
          <input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <button
          className="forgot-btnPrimary"
          disabled={loading || !emailValid}
        >
          {loading ? '전송 중…' : '재설정 링크 전송'}
        </button>
      </form>

      {msg && <div className={`forgot-hint ${ok ? 'ok' : ''}`}>{msg}</div>}

      <div className="forgot-foot">
        <Link to="/login" className="forgot-link">로그인 페이지로 돌아가기</Link>
      </div>
    </AuthLayout>
  );
}