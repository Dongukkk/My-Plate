import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import api from '../api/api';

/**
 * 사용법
 * - 로그인만 필요:  <Route element={<ProtectedRoute />}><Route path="/mypage" .../></Route>
 * - 역할 필요:     <Route element={<ProtectedRoute roles={['ADMIN']} />}> ... </Route>
 */
    export default function ProtectedRoute({ roles = [] }) {
    const location = useLocation();
    const [status, setStatus] = useState('checking'); // 'checking' | 'ok' | 'login' | 'forbidden'

    useEffect(() => {
        let mounted = true;

        (async () => {
        const token = localStorage.getItem('access');

        // 1) 토큰 없음 → 로그인
        if (!token) {
            if (mounted) setStatus('login');
            return;
        }

        // 2) 역할 요구 없으면 통과
        const needsRoles = Array.isArray(roles) ? roles : [roles];
        if (needsRoles.length === 0) {
            if (mounted) setStatus('ok');
            return;
        }

        // 3) 역할 확인 (/me)
        try {
            const r = await api.get('/me'); // ex) { id, email, name, role } 또는 { roles: [...] }

            // 서버 응답 표준화: 배열 형태로 만들고 모두 소문자 처리
            const toLC = v => String(v).toLowerCase();
            const owned = (Array.isArray(r.data?.roles)
            ? r.data.roles
            : (r.data?.role ? [r.data.role] : [])
            ).map(toLC);

            const required = needsRoles.map(toLC);

            const hasRole = required.some(req => owned.includes(req));
            if (mounted) setStatus(hasRole ? 'ok' : 'forbidden');
        } catch (e) {
            // (401/403 시 인터셉터에서 토큰 제거 + /login 유도하더라도) 안전하게 로그인 처리
            if (mounted) setStatus('login');
        }
        })();

        return () => { mounted = false; };
    }, [roles]);

    if (status === 'checking') return <div style={{ padding: 20 }}>확인 중…</div>;

    if (status === 'login') {
        // 원래 가려던 위치를 state에 담아 전달 → 로그인 성공 후 돌려보낼 때 사용
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (status === 'forbidden') return <Navigate to="/forbidden" replace />;

    return <Outlet />;
    }