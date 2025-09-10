import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { changePassword } from '../api/api';
import './PasswordChange.css';

const RULE = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\W]{8,64}$/;

export default function PasswordChange() {
    const [ me, setMe ] = useState(null);
    const [ cur, setCur ] = useState('');
    const [ pwd, setPwd ] = useState('');
    const [ pwd2, setPwd2 ] = useState('');
    const [ err, setErr ] = useState('');
    const [ ok, setOk ] = useState('');
    const [ saving, setSaving ] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const r = await api.get('/me'); // { id,email,username,role,provider,... }
                if (mounted) setMe(r.data);
            } catch {
                if (mounted) setErr('내 정보 로드 실패');
            }
        })();
        return () => { mounted = false; };
    }, []);

    // 순수 소셜은 비번 변경 불가 (백엔드와 규칙 일치)
    const canUseForm = me
        ? ((me.provider || 'MYPLATE').toUpperCase() === 'MYPLATE')
        : false;

    const validate = () => {
        if (!cur) return '현재 비밀번호를 입력하세요.';
        if (!pwd) return '새 비밀번호를 입력하세요.';
        if (!RULE.test(pwd)) return '비밀번호는 8~64자, 영문과 숫자를 포함해야 합니다.';
        if (pwd !== pwd2) return '새 비밀번호가 일치하지 않습니다.';
        return '';
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr(''); setOk('');
        const v = validate();
        if (v) { setErr(v); return; }
        try {
            setSaving(true);
            await changePassword(cur, pwd);
            setOk('비밀번호가 변경되었습니다.');
            setTimeout(() => navigate('/mypage', { replace: true }), 900);
        } catch (e) {
            const msg = e?.response?.data?.message || '변경 실패';
            setErr(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="lp-pw-wrap">
            <div className="lp-pw-card">
                <h2 className="lp-pw-title">비밀번호 변경</h2>

                {!me && <div className="lp-pw-info">내 정보를 불러오는 중…</div>}

                {me && !canUseForm && (
                    <div className="lp-pw-block">
                        이 계정은 소셜 전용 계정입니다. 비밀번호 변경이 불가합니다.
                    </div>
                )}

                {me && canUseForm && (
                    <form className="lp-pw-form" onSubmit={onSubmit}>
                        <label className="lp-pw-label">현재 비밀번호</label>
                        <input
                            className="lp-pw-input"
                            type="password"
                            value={cur}
                            onChange={e => setCur(e.target.value)}
                            autoComplete="current-password"
                        />

                        <label className="lp-pw-label">새 비밀번호</label>
                        <input
                            className="lp-pw-input"
                            type="password"
                            value={pwd}
                            onChange={e => setPwd(e.target.value)}
                            placeholder="영문+숫자 포함 8~64자"
                            autoComplete="new-password"
                        />

                        <label className="lp-pw-label">새 비밀번호 확인</label>
                        <input
                            className="lp-pw-input"
                            type="password"
                            value={pwd2}
                            onChange={e => setPwd2(e.target.value)}
                            autoComplete="new-password"
                        />

                        {err && <div className="lp-pw-error">{err}</div>}
                        {ok && <div className="lp-pw-ok">{ok}</div>}

                        <button className="lp-pw-btn" disabled={saving}>
                            {saving ? '변경 중…' : '비밀번호 변경'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}