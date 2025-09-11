import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/store';

export default function OAuthCallback() {
  const [msg, setMsg] = useState('로그인 처리중…');
  const { provider } = useParams();            // google | naver
  const { hash, search, state } = useLocation();      // #access=..&refresh=.. (기본), 혹시 ? 로 넘어와도 대응
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const raw =
      (hash && hash.startsWith('#') ? hash.slice(1) : '') ||
      (search && search.startsWith('?') ? search.slice(1) : '');

    const p = new URLSearchParams(raw);
    const error   = p.get('error');
    const access  = p.get('access');
    const refresh = p.get('refresh');
    const from = p.get('from') || '/';

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

    fetch('/api/me', {
      headers: { Authorization: `Bearer ${access}` },
    })
      .then(res => res.json())
      .then(userData => {
        dispatch(setUser(userData));
        setMsg('로그인 완료! 잠시 후 이동합니다…');

        navigate(from, { replace: true });
      })
      .catch(err => {
        console.error(err);
        setMsg('사용자 정보를 가져오지 못했습니다.');
      });
  }, [hash, search, provider, navigate]);
}