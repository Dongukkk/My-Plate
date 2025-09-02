import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export default function OAuthCallback() {
  const [msg, setMsg] = useState('로그인 처리중…');
  const { provider } = useParams();            // google | naver
  const { hash, search } = useLocation();      // #access=..&refresh=.. (기본), 혹시 ? 로 넘어와도 대응
  const navigate = useNavigate();

  useEffect(() => {
    const raw =
      (hash && hash.startsWith('#') ? hash.slice(1) : '') ||
      (search && search.startsWith('?') ? search.slice(1) : '');

    const p = new URLSearchParams(raw);
    const error   = p.get('error');
    const access  = p.get('access');
    const refresh = p.get('refresh');

    if (error) {
      setMsg(`${(provider || '').toUpperCase()} 로그인 실패: ${error}`);
      return;
    }
    if (!access || !refresh) {
      setMsg('토큰이 없습니다.');
      return;
    }

    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);

    setMsg('로그인 완료! 잠시 후 이동합니다…');
    const t = setTimeout(() => navigate('/mypage', { replace: true }), 500);
    return () => clearTimeout(t);
  }, [hash, search, provider, navigate]);

  return <div style={{ padding: 24 }}>{msg}</div>;
}