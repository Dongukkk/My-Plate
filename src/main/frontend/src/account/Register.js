import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import AuthLayout from '../components/AuthLayout';
import './Register.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [agree1, setAgree1] = useState(false); // (필수)
  const [agree2, setAgree2] = useState(false); // (선택)
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 유효성
  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  );
  const pwValid = useMemo(() => pw.length >= 6, [pw]);
  const pwSame  = useMemo(() => pw && pw === pw2, [pw, pw2]);

  const disabled =
    loading || !name.trim() || !emailValid || !pwValid || !pwSame || !agree1;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (disabled) return;

    setLoading(true);
    setMsg('가입 처리 중…');

    try {
      // ✅ 백엔드 DTO(UserRegisterRequest: name, email, password)에 맞춰 전송
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: pw,
      };

      // ✅ 경로 백엔드와 일치: /api/users/register (api 인스턴스 baseURL이 /api)
      await api.post('/users/register', payload);

      setMsg('가입 완료! 로그인 페이지로 이동합니다.');
      navigate('/login', { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const text =
        typeof data === 'string'
          ? data
          : data?.message ||
            (status === 409 ? '이미 사용 중인 이메일입니다.' : `회원가입 실패 (status ${status ?? '??'})`);
      setMsg(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    // ✅ imageSrc 전달 제거 → 404 이미지 요청 안 나감
    <AuthLayout title="My Plate">
      <h2 className="lp-register-title">새 사용자 등록</h2>
      <p className="lp-register-sub">맛집 추천을 개인화하려면 계정을 만들어주세요.</p>

      <form onSubmit={onSubmit} className="lp-register-form">
        <label className="lp-register-field">
          <span className="lp-register-label">사용자 이름</span>
          <input
            type="text"
            placeholder="홍길동"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label className="lp-register-field">
          <span className="lp-register-label">이메일</span>
          <input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {!emailValid && email.length > 0 && (
            <span className="lp-register-help">올바른 이메일 형식을 입력하세요.</span>
          )}
        </label>

        <label className="lp-register-field">
          <span className="lp-register-label">비밀번호</span>
          <input
            type="password"
            placeholder="6자 이상"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            required
          />
          {!pwValid && pw.length > 0 && (
            <span className="lp-register-help">비밀번호는 6자 이상이어야 합니다.</span>
          )}
        </label>

        <label className="lp-register-field">
          <span className="lp-register-label">비밀번호 확인</span>
          <input
            type="password"
            placeholder="비밀번호를 다시 입력"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            required
          />
          {!pwSame && pw2.length > 0 && (
            <span className="lp-register-help">비밀번호가 일치하지 않습니다.</span>
          )}
        </label>

        <div className="lp-register-checks">
          <label className="lp-register-check">
            <input
              type="checkbox"
              checked={agree1}
              onChange={(e) => setAgree1(e.target.checked)}
            />
            <span>서비스 이용약관에 동의합니다.(필수)</span>
          </label>
          <label className="lp-register-check">
            <input
              type="checkbox"
              checked={agree2}
              onChange={(e) => setAgree2(e.target.checked)}
            />
            <span>개인정보 처리방침에 동의합니다.(선택)</span>
          </label>
        </div>

        <button className="lp-register-btnPrimary" disabled={disabled}>
          {loading ? '가입 중…' : '회원가입'}
        </button>
      </form>

      {msg && <div className="lp-register-hint">{msg}</div>}

      <div className="lp-register-foot">
        이미 계정이 있으신가요? <Link to="/login" className="lp-register-link">로그인</Link>
      </div>
    </AuthLayout>
  );
}