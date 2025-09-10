import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin-request.css";

/* 드롭다운 유형 */
const ADMIN_TYPES = [
    { key: "ADMIN", label: "관리자 계정 요청하기" },
    { key: "RESET", label: "비밀번호 재설정 요청하기" },
];

export default function AdminAuthRequest() {
    const nav = useNavigate();
    const [adminType, setAdminType] = useState("ADMIN");
    const [toast, setToast] = useState(null);

    const showToast = (kind, msg) => {
        setToast({ kind, msg });
        setTimeout(() => setToast(null), 2400);
    };

    /* 관리자 계정 요청 */
    const adminDraftKey = "admin_auth_req_admin_draft";
    const [adminForm, setAdminForm] = useState({
        name: "",
        email: "",
        org: "",
        role: "",
        reason: "",
        agree: false,
    });
    const [adminFiles, setAdminFiles] = useState([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(adminDraftKey);
            if (raw) setAdminForm((p) => ({ ...p, ...JSON.parse(raw) }));
        } catch { }
    }, []);
    useEffect(() => {
        const t = setTimeout(() => {
            try { localStorage.setItem(adminDraftKey, JSON.stringify(adminForm)); } catch { }
        }, 250);
        return () => clearTimeout(t);
    }, [adminForm]);

    const adminOnChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAdminForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    };
    const adminOnFiles = (e) => {
        const list = Array.from(e.target.files || []);
        setAdminFiles(list.slice(0, 5));
    };
    const adminReady = useMemo(() =>
        adminForm.name.trim() &&
        /.+@.+\..+/.test(adminForm.email) &&
        adminForm.reason.trim().length >= 10 &&
        adminForm.agree
        , [adminForm]);

    const adminSubmit = (e) => {
        e.preventDefault();
        if (!adminReady) return;
        showToast("success", "관리자 계정 요청이 접수되었습니다.");
        setAdminForm({ name: "", email: "", org: "", role: "", reason: "", agree: false });
        setAdminFiles([]);
        localStorage.removeItem(adminDraftKey);
    };

    /* 비밀번호 재설정 요청 */
    const resetDraftKey = "admin_auth_req_reset_draft";
    const [resetForm, setResetForm] = useState({
        email: "",
        name: "",
        note: "",
        agree: false,
    });

    useEffect(() => {
        try {
            const raw = localStorage.getItem(resetDraftKey);
            if (raw) setResetForm((p) => ({ ...p, ...JSON.parse(raw) }));
        } catch { }
    }, []);
    useEffect(() => {
        const t = setTimeout(() => {
            try { localStorage.setItem(resetDraftKey, JSON.stringify(resetForm)); } catch { }
        }, 250);
        return () => clearTimeout(t);
    }, [resetForm]);

    const resetOnChange = (e) => {
        const { name, value, type, checked } = e.target;
        setResetForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    };
    const resetReady = useMemo(() =>
        /.+@.+\..+/.test(resetForm.email) && resetForm.agree
        , [resetForm]);

    const resetSubmit = (e) => {
        e.preventDefault();
        if (!resetReady) return;
        showToast("success", "비밀번호 재설정 요청이 접수되었습니다. 메일을 확인해주세요.");
        setResetForm({ email: "", name: "", note: "", agree: false });
        localStorage.removeItem(resetDraftKey);
    };

    /* 취소 */
    const onCancel = () => nav(-1);

    return (
        <div className="admin-auth-wrap">
            <header className="admin-auth-hero">
                <h1 className="admin-auth-title">로그인 지원 요청</h1>
                <p className="admin-auth-desc">요청 유형을 선택하고 필요한 정보를 입력해 주세요.</p>
            </header>

            <main className="admin-auth-main">
                <section className="admin-auth-card">
                    {/* 유형 드롭다운 */}
                    <div className="admin-auth-field">
                        <label className="admin-auth-label" htmlFor="admin-auth-type">요청 유형</label>
                        <div className="admin-auth-select-wrap">
                            <select id="admin-auth-type" className="admin-auth-select" value={adminType} onChange={(e) => setAdminType(e.target.value)}
                                >{ADMIN_TYPES.map((t) => (<option key={t.key} value={t.key}>{t.label}</option>))}</select>
                        </div>
                        <p className="admin-auth-help">관리자 계정 요청 또는 비밀번호 재설정을 선택하세요.</p>
                    </div>

                    {/* 유형별 폼 */}
                    {adminType === "ADMIN" ? (
                        <form className="admin-auth-form" onSubmit={adminSubmit}>
                            <div className="admin-auth-grid-2">
                                <div className="admin-auth-field">
                                    <label className="admin-auth-label" htmlFor="admin-auth-name">이름</label>
                                    <input id="admin-auth-name" className="admin-auth-input" type="text" name="name" placeholder="예) 홍길동" value={adminForm.name} onChange={adminOnChange} required />
                                </div>
                                <div className="admin-auth-field">
                                    <label className="admin-auth-label" htmlFor="admin-auth-email">이메일</label>
                                    <input id="admin-auth-email" className="admin-auth-input" type="email" name="email" placeholder="example@domain.com" value={adminForm.email} onChange={adminOnChange} required />
                                </div>
                            </div>

                            <div className="admin-auth-grid-2">
                                <div className="admin-auth-field">
                                    <label className="admin-auth-label" htmlFor="admin-auth-org">소속(선택)</label>
                                    <input id="admin-auth-org" className="admin-auth-input" type="text" name="org" placeholder="예) 마이플레이트 운영팀" value={adminForm.org} onChange={adminOnChange} />
                                </div>
                                <div className="admin-auth-field">
                                    <label className="admin-auth-label" htmlFor="admin-auth-role">직책/역할(선택)</label>
                                    <input id="admin-auth-role" className="admin-auth-input" type="text" name="role" placeholder="예) 매니저" value={adminForm.role} onChange={adminOnChange} />
                                </div>
                            </div>

                            <div className="admin-auth-field">
                                <label className="admin-auth-label" htmlFor="admin-auth-reason">요청 사유</label>
                                <textarea id="admin-auth-reason" className="admin-auth-textarea" name="reason" rows={7}
                                    placeholder={"필요 권한/기능과 사유를 구체적으로 적어주세요.\n(예: 신고 처리/식당 관리 기능 접근 필요)"}
                                    value={adminForm.reason} onChange={adminOnChange} required />
                            </div>

                            <div className="admin-auth-field">
                                <div className="admin-auth-label">증빙 첨부 (선택)</div>
                                <label className="admin-auth-file">
                                    <input type="file" multiple onChange={adminOnFiles} accept="image/*,.pdf,.txt" />
                                    <span className="admin-auth-file-btn">파일 선택</span>
                                    <span className="admin-auth-file-hint">최대 5개, 이미지/PDF/텍스트</span>
                                </label>
                                {!!adminFiles.length && (
                                    <ul className="admin-auth-filelist">{adminFiles.map((f, i) => (<li key={i} title={f.name}>{f.name} <em>({Math.ceil(f.size / 1024)} KB)</em></li>))}</ul>
                                )}
                            </div>

                            <div className="admin-auth-field admin-auth-agree">
                                <label>
                                    <input type="checkbox" name="agree" checked={adminForm.agree} onChange={adminOnChange} />
                                    <span>요청 처리 및 회신을 위한 개인정보 수집·이용에 동의합니다.</span>
                                </label>
                            </div>

                            <div className="admin-auth-actions">
                                <button type="submit" className="admin-auth-btn admin-auth-btn-primary" disabled={!adminReady}> 관리자 계정 요청</button>
                                <button type="button" className="admin-auth-btn admin-auth-btn-secondary" onClick={onCancel}>취소</button>
                                <button type="button" className="admin-auth-btn admin-auth-btn-ghost" 
                                        onClick={() => { setAdminForm({ name: "", email: "", org: "", role: "", reason: "", agree: false }); setAdminFiles([]); localStorage.removeItem(adminDraftKey); }}>초기화</button>
                            </div>
                        </form>
                    ) : (
                        <form className="admin-auth-form" onSubmit={resetSubmit}>
                            <div className="admin-auth-grid-2">
                                <div className="admin-auth-field">
                                    <label className="admin-auth-label" htmlFor="admin-auth-reset-email">이메일</label>
                                    <input id="admin-auth-reset-email" className="admin-auth-input" type="email" name="email" placeholder="example@domain.com" value={resetForm.email} onChange={resetOnChange} required />
                                </div>
                                <div className="admin-auth-field">
                                    <label className="admin-auth-label" htmlFor="admin-auth-reset-name">이름(선택)</label>
                                    <input id="admin-auth-reset-name" className="admin-auth-input" type="text" name="name" placeholder="홍길동" value={resetForm.name} onChange={resetOnChange} />
                                </div>
                            </div>

                            <div className="admin-auth-field">
                                <label className="admin-auth-label" htmlFor="admin-auth-reset-note">추가 메모(선택)</label>
                                <textarea id="admin-auth-reset-note" className="admin-auth-textarea" name="note" rows={6} placeholder={"본인 확인에 도움이 될 정보나 요청 배경을 적어주세요."}
                                    value={resetForm.note} onChange={resetOnChange} />
                            </div>

                            <div className="admin-auth-field admin-auth-agree">
                                <label>
                                    <input type="checkbox" name="agree" checked={resetForm.agree} onChange={resetOnChange} />
                                    <span>요청 처리 및 회신을 위한 개인정보 수집·이용에 동의합니다.</span>
                                </label>
                            </div>

                            <div className="admin-auth-actions">
                                <button type="submit" className="admin-auth-btn admin-auth-btn-primary" disabled={!resetReady}>비밀번호 재설정 요청</button>
                                <button type="button" className="admin-auth-btn admin-auth-btn-secondary" onClick={onCancel}>취소</button>
                                <button type="button" className="admin-auth-btn admin-auth-btn-ghost"
                                    onClick={() => { setResetForm({ email: "", name: "", note: "", agree: false }); localStorage.removeItem(resetDraftKey); }}>초기화</button>
                            </div>
                        </form>
                    )}
                </section>
            </main>

            {toast && (<div className={`admin-auth-toast ${toast.kind === "success" ? "is-success" : "is-error"}`}>{toast.msg}</div>)}
        </div>
    );
}
