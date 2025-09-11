import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAlert } from "../ui/alert-center"; // ✅ 전역 알림 훅
import "./admin-login.css";

//axios.defaults.baseURL = "http://localhost:8080";
//axios.defaults.withCredentials = true;

export default function AdminLogin() {
    const nav = useNavigate();
    const { alert } = useAlert();

    const [form, setForm] = useState({
        username: "",
        password: "",
        remember: false,
    });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
    };

    const canSubmit = Boolean(form.username.trim() && form.password.trim() && !loading);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;

        setLoading(true);

        try {
            const payload = { email: form.username.trim(), password: form.password };
            await axios.post("/api/admin/login", payload);

            if (form.remember) localStorage.setItem("mp_admin_authed", "1");
            else localStorage.removeItem("mp_admin_authed");

            alert("로그인되었습니다.", { autoCloseMs: 1200 });
            nav("/adminMain");
        } catch (e) {
            const status = e?.response?.status ?? 0;
            let msg = "로그인 실패";
            if (status === 401) msg = "아이디/비밀번호가 일치하지 않습니다.";
            else if (status === 403) msg = "관리자 전용 계정만 로그인할 수 있습니다.";
            else if (status === 0) msg = "서버 또는 네트워크 오류가 발생했습니다.";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login">
            <div className="admin-login-wrap">
                <div className="admin-brand">
                    <span className="admin-brand-name">
                        <img src={"https://i.imgur.com/Q5H1oqv.png"} alt="My Plate Logo" />
                    </span>
                </div>

                <h1 className="admin-login-title">관리자 전용 로그인</h1>
                <p className="admin-login-sub">관리자 계정의 이메일 및 비밀번호로 로그인할 수 있습니다.</p>

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
                            onClick={() => nav("/adminRequest")}
                        >
                            비밀번호를 잊으셨나요?
                        </button>
                    </div>

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
                        onClick={() => nav("/adminRequest")}
                    >
                        관리자 계정 요청하기
                    </button>
                </p>
            </div>
        </div>
    );
}
