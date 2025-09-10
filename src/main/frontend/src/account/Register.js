import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import AuthLayout from '../components/AuthLayout';
import './Register.css';

/* ── 약관/개인정보 본문 ── */
const TERMS_TEXT = `
[이용약관]

1. 용어의 정의
- “서비스”는 회사가 제공하는 웹/모바일 기반 모든 기능을 말합니다.
- “회원”은 본 약관에 동의하고 서비스 이용계약을 체결한 자를 말합니다.

2. 계정 및 보안
- 회원은 정확한 정보를 제공하고 이를 유지해야 합니다.
- 계정의 비밀 유지 책임은 회원에게 있습니다.

3. 이용 제한
- 법령/약관 위반, 시스템 악용 등의 행위를 금지합니다.

4. 콘텐츠 권리
- 회원은 업로드한 콘텐츠의 권리를 보유합니다(서비스 제공을 위한 비독점적 사용권 허용).

5. 면책
- 천재지변 등 회사가 책임질 수 없는 사유로 인한 손해는 책임지지 않습니다.

6. 약관 변경
- 회사는 필요한 경우 약관을 변경할 수 있으며, 변경 시 공지합니다.
`;

const PRIVACY_TEXT = `
[개인정보 처리방침]

1. 수집 항목 및 목적
- 이메일, 비밀번호, 이름 등: 회원가입/서비스 제공/문의 응대
- 접속기록, 쿠키 등: 서비스 이용 통계, 보안

2. 보유 및 이용 기간
- 목적 달성 시 지체 없이 파기하며, 법령에 따라 일정 기간 보관할 수 있습니다.

3. 제3자 제공 및 처리위탁
- 법령에 근거하거나 서비스 제공에 필요한 범위에서만 처리위탁/제공합니다.

4. 정보주체의 권리
- 열람/정정/삭제/처리정지 요구 등의 권리를 행사할 수 있습니다.

5. 안전성 확보조치
- 접근 통제, 암호화, 접속기록 보관 등 보호조치를 시행합니다.

6. 문의
- 개인정보보호 책임자: privacy@example.com
`;

/* ── 스크롤 끝까지 내려야 버튼 활성화되는 모달 (체크 문구 제거) ── */
function TermsModal({ open, title, text, onAgree, onClose }) {
  const boxRef = useRef(null);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAtEnd(false);
    const el = boxRef.current;
    if (!el) return;

    const onScroll = () => {
      const nearEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
      setAtEnd(nearEnd);
    };
    el.addEventListener('scroll', onScroll);
    onScroll(); // 스크롤바가 없으면 즉시 활성화
    return () => el.removeEventListener('scroll', onScroll);
  }, [open, text]);

  if (!open) return null;

  return (
    <div className="lp-modal-overlay" onClick={onClose}>
      <div className="lp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="lp-modal-header">
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="lp-modal-close" onClick={onClose} aria-label="닫기">✕</button>
        </div>

        <div ref={boxRef} className="lp-modal-body">
          <pre className="lp-modal-pre">{text}</pre>
        </div>

        <div className="lp-modal-footer">
          <button
            className={`lp-register-btnPrimary ${atEnd ? '' : 'is-disabled'}`}
            disabled={!atEnd}
            onClick={() => { onAgree?.(); onClose?.(); }}
          >
            동의하고 닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');

  // 동의 상태 (약관 필수, 개인정보 선택)
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);

  const [open, setOpen] = useState({ tos: false, privacy: false });

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
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: pw,
      };
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
    <AuthLayout title="My Plate" brandImageSrc={`https://i.imgur.com/Tp8HxhZ.png`}>
      {/* 하나의 폭 컨테이너로 감싸 정렬 깨짐 방지 */}
      <div className="lp-register-wrap">
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

          {/* 동의 섹션 */}
          <div className="lp-consent">
            <div className="lp-consent-row">
              <label className="lp-consent-left">
                <input
                  type="checkbox"
                  readOnly
                  checked={agree1}
                  onClick={(e) => { e.preventDefault(); setOpen(o => ({ ...o, tos: true })); }}
                />
                <span>서비스 이용약관에 동의합니다.<b className="lp-required"> (필수)</b></span>
              </label>
              <button
                type="button"
                className="lp-consent-link"
                onClick={() => setOpen(o => ({ ...o, tos: true }))}
              >
                약관 보기
              </button>
            </div>

            <div className="lp-consent-row">
              <label className="lp-consent-left">
                <input
                  type="checkbox"
                  readOnly
                  checked={agree2}
                  onClick={(e) => { e.preventDefault(); setOpen(o => ({ ...o, privacy: true })); }}
                />
                <span>개인정보 처리방침에 동의합니다.(선택)</span>
              </label>
              <button
                type="button"
                className="lp-consent-link"
                onClick={() => setOpen(o => ({ ...o, privacy: true }))}
              >
                처리방침 보기
              </button>
            </div>
          </div>

          <button className="lp-register-btnPrimary" disabled={disabled}>
            {loading ? '가입 중…' : '회원가입'}
          </button>
        </form>

        {msg && <div className="lp-register-hint">{msg}</div>}

        <div className="lp-register-foot">
          이미 계정이 있으신가요?
          <Link to="/login" className="lp-register-link">로그인</Link>
        </div>
      </div>

      {/* 모달들 */}
      <TermsModal
        open={open.tos}
        title="이용약관"
        text={TERMS_TEXT}
        onAgree={() => setAgree1(true)}
        onClose={() => setOpen(o => ({ ...o, tos: false }))}
      />
      <TermsModal
        open={open.privacy}
        title="개인정보 처리방침"
        text={PRIVACY_TEXT}
        onAgree={() => setAgree2(true)}
        onClose={() => setOpen(o => ({ ...o, privacy: false }))}
      />
    </AuthLayout>
  );
}