import React, { useMemo, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import api from '../api/api';
import './Reset.css';

function useResetToken() {
    const { search } = useLocation();
    return new URLSearchParams(search).get('token');
    }

    export default function Reset() {
    const token = useResetToken();
    const navigate = useNavigate();

    const [pw, setPw] = useState('');
    const [pw2, setPw2] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (!token) setMsg('유효하지 않은 링크입니다. 메일의 링크를 다시 확인해주세요.');
    }, [token]);

    const pwValid = useMemo(() => pw.length >= 6, [pw]);
    const pwSame  = useMemo(() => pw && pw === pw2, [pw, pw2]);
    const disabled = loading || !token || !pwValid || !pwSame;

    const onSubmit = async (e) => {
        e.preventDefault();
        if (disabled) return;

        setLoading(true);
        setMsg('비밀번호 변경 중…');

        try {
        // api 인스턴스가 baseURL('/api')라면 경로는 '/users/reset-password'가 맞아요.
        await api.post('/users/reset-password', {
            token,
            newPassword: pw,
        });

        setMsg('비밀번호가 변경되었습니다. 로그인해 주세요.');
        setTimeout(() => navigate('/login', { replace: true }), 1000);
        } catch (err) {
        const data = err?.response?.data;
        setMsg(typeof data === 'string' ? data : data?.message || '변경 실패');
        } finally {
        setLoading(false);
        }
    };

    return (
        <AuthLayout imageSrc={null} title="My Plate">
        <h2 className="lp-reset-title">비밀번호 재설정</h2>
        <p className="lp-reset-sub">새 비밀번호를 입력해주세요.</p>

        <form onSubmit={onSubmit} className="lp-reset-form">
            <label className="lp-reset-field">
            <span className="lp-reset-label">새 비밀번호</span>
            <input
                type="password"
                placeholder="6자 이상"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                required
            />
            {!pwValid && pw.length > 0 && (
                <span className="lp-reset-help">비밀번호는 6자 이상이어야 합니다.</span>
            )}
            </label>

            <label className="lp-reset-field">
            <span className="lp-reset-label">비밀번호 확인</span>
            <input
                type="password"
                placeholder="다시 입력"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                required
            />
            {!pwSame && pw2.length > 0 && (
                <span className="lp-reset-help">비밀번호가 일치하지 않습니다.</span>
            )}
            </label>

            <button className="lp-reset-btnPrimary" disabled={disabled}>
            {loading ? '변경 중…' : '비밀번호 변경'}
            </button>
        </form>

        {msg && <div className="lp-reset-hint">{msg}</div>}

        <div className="lp-reset-foot">
            문제가 있나요? <Link to="/forgot" className="lp-reset-link">다시 링크 받기</Link>
        </div>
        </AuthLayout>
    );
    }