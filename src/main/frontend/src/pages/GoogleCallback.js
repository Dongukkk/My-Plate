import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GoogleCallback() {
  const [msg, setMsg] = useState('구글 로그인 처리중…');
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : '';
    const p = new URLSearchParams(hash);
    const error   = p.get('error');
    const access  = p.get('access');
    const refresh = p.get('refresh');

    if (error) {
      setMsg('로그인 실패: ' + error);
      return;
    }
    if (!access || !refresh) {
      setMsg('토큰이 없습니다.');
      return;
    }
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    setMsg('로그인 완료! 잠시 후 이동합니다…');
    setTimeout(() => navigate('/mypage'), 600);
  }, [navigate]);

  return <div style={{ padding: 24 }}>{msg}</div>;
}