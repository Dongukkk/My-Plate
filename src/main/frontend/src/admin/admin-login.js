import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin-login.css";

export default function AdminLogin() {
    const nav = useNavigate();

    const [form, setForm] = useState({
        username: "",
        password: "",
        remember: false,
    });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setErr("");
        setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
    };

    const canSubmit = form.username.trim() && form.password.trim() && !loading;

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;

        setLoading(true);
        setErr("");

        try {

            const isDemoOK =
                form.username === "admin" && form.password === "admin1234";

            await new Promise((r) => setTimeout(r, 400));
            if (!isDemoOK) throw new Error("INVALID");

            if (form.remember) localStorage.setItem("mp_admin_authed", "1");
            else localStorage.removeItem("mp_admin_authed");

            nav("/adminMain");
        } catch {
            setErr("로그인에 실패했습니다. 아이디/비밀번호를 확인해 주세요.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login">
            <div className="admin-login-wrap">
                {/* 브랜드 */}
                <div className="admin-brand">
                    <span className="admin-brand-name">
                        <img
                            src={"https://i.imgur.com/Q5H1oqv.png"}
                            alt="My Plate Logo"
                            className="admin-logo-img"
                        />
                    </span>
                </div>

                {/* 타이틀 */}
                <h1 className="admin-login-title">관리자 전용 로그인</h1>
                <p className="admin-login-sub">
                    관리자 계정의 이메일 및 비밀번호로 로그인할 수 있습니다.
                </p>

                {/* 폼 */}
                <form className="admin-login-card" onSubmit={onSubmit}>
                    <label className="admin-field">
                        <span className="admin-field-label">관리자 이메일</span>
                        <input
                            className="admin-mp-input"
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={onChange}
                            placeholder="관리자 이메일을 입력하세요"
                            autoComplete="username"
                        />
                    </label>

                    <label className="admin-field">
                        <span className="admin-field-label">비밀번호</span>
                        <div className="admin-pw-row">
                            <input
                                className="admin-mp-input"
                                type={showPw ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={onChange}
                                placeholder="관리자 비밀번호를 입력하세요"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="admin-pw-toggle"
                                onClick={() => setShowPw((v) => !v)}
                                aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
                            >
                                {showPw ? "숨김" : "보기"}
                            </button>
                        </div>
                    </label>

                    <div className="admin-row-between">
                        <label className="admin-remember">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={form.remember}
                                onChange={onChange}
                            />
                            <span>로그인 상태 유지</span>
                        </label>
                        <button
                            type="button"
                            className="admin-link-btn"
                            onClick={() => nav("/admin/forgot-password")}
                        >
                            비밀번호를 잊으셨나요?
                        </button>
                    </div>

                    {err && <div className="admin-error">{err}</div>}

                    <button
                        className="admin-btn-primary"
                        type="submit"
                        disabled={!canSubmit}
                        aria-disabled={!canSubmit}
                    >
                        {loading ? "로그인 중..." : "로그인"}
                    </button>
                </form>

                <div className="admin-divider" role="separator" />
                <p className="admin-help">
                    관리자 계정이 필요하신가요?{" "}
                    <button
                        type="button"
                        className="admin-link-btn strong"
                        onClick={() => nav("/admin/request-account")}
                    >
                        관리자 계정 요청하기
                    </button>
                </p>
            </div>
        </div>
    );
}
