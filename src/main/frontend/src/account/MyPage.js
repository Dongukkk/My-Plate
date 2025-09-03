import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import './MyPage.css';

export default function MyPage() {
  const [me, setMe] = useState(null);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const r = await api.get('/me'); // { id, email, name, role } 형태
        if (mounted) setMe(r.data);
      } catch (e) {
        const data = e?.response?.data;
        setMsg(typeof data === 'string' ? data : (data?.message || '불러오기 실패'));
      }
    })();

    return () => { mounted = false; };
  }, []);

  const onLogout = () => {
    localStorage.removeItem('access');
    navigate('/login', { replace: true });
  };

  const role = useMemo(
    () => String(me?.role || '').toUpperCase(),
    [me]
  );

  const providerName = useMemo(
  () => String(me?.provider || 'MYPLATE').toUpperCase(), 
  [me]
  );

  const initials = useMemo(() => {
    const base = me?.name || me?.username || me?.email || '?';
    const parts = String(base).trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const second = parts[1]?.[0] ?? '';
    return (first + second || first || '?').toUpperCase();
  }, [me]);

  if (msg) return <div className="lp-myp-wrap"><div className="lp-myp-error">에러: {msg}</div></div>;
  if (!me)  return <div className="lp-myp-wrap"><div className="lp-myp-loading">불러오는 중…</div></div>;

  return (
    <div className="lp-myp-wrap">
      <div className="lp-myp-card">
        <div className="lp-myp-header">
          <div className="lp-myp-avatar" aria-hidden>{initials}</div>
          <div className="lp-myp-id">
            <div className="lp-myp-name">{me.name || me.username || '사용자'}</div>
            <div className="lp-myp-email">{me.email}</div>
          </div>
          {/* 역할 뱃지*/ }
          {role && <span className={`myp-badge ${role === 'ADMIN' ? 'is-admin' : 'is-user'}`}>{role}</span>}

          {/* 로그인 제공자(provider) 뱃지 */}
          {providerName && <span className={`myp-badge prov-${providerName.toLowerCase()}`}>{providerName}</span>}
        </div>

        <div className="lp-myp-body">
          {/* 필요한 정보 더 넣고 싶으면 여기에 섹션 추가 */}
          <div className="lp-myp-row">
            <span className="lp-myp-key">이메일</span>
            <span className="lp-myp-val">{me.email}</span>
          </div>
          <div className="lp-myp-row">
            <span className="lp-myp-key">이름</span>
            <span className="lp-myp-val">{me.name || me.username}</span>
          </div>
        </div>

        <div className="lp-myp-actions">
          {role === 'ADMIN' && (
            <Link to="/admin" className="lp-myp-link">관리자 페이지로</Link>
          )}
          <button className="lp-myp-logout" onClick={onLogout}>로그아웃</button>
        </div>
      </div>
    </div>
  );
}