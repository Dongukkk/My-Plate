// AdminContent.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./admin-content.css";

axios.defaults.baseURL = "http://localhost:8080";

/* helpers */
const arr = (p) => (Array.isArray(p) ? p : (p?.items || p?.list || p?.rows || []));
const fmtDate = (v) => (v ? String(v).slice(0, 10) : "-");
const today = () => new Date().toISOString().slice(0, 10);
const pickDate = (x) => x?.updatedAt || x?.updated_at || x?.createdAt || x?.created_at || null;

const mapStatus = (s = "") => {
    const k = String(s).toUpperCase();
    if (k.includes("IN_PROGRESS")) return "처리중";
    if (k.includes("RESOLVED")) return "완료";
    if (k.includes("REJECT")) return "반려";
    return "대기";
};
const toServerStatus = (label = "") =>
    ({ "대기": "PENDING", "처리중": "IN_PROGRESS", "완료": "RESOLVED", "반려": "REJECTED" }[label] || "PENDING");
const toServerDecision = (label = "") =>
    ({ "무시": "IGNORE", "경고": "WARN", "컨텐츠 숨기기": "HIDE", "승인": "APPROVE", "거절": "REJECT" }[label] || "IGNORE");

/* 페이저 */
function buildPageWindow(cur, total, maxNums = 5) {
    if (total <= maxNums) return Array.from({ length: total }, (_, i) => i + 1);
    if (cur <= 3) return [1, 2, 3, 4, 5, "..."];
    if (cur >= total - 2) return ["...", total - 4, total - 3, total - 2, total - 1, total];
    return ["...", cur - 2, cur - 1, cur, cur + 1, cur + 2, "..."];
}
const Pager = ({ page, total, onPage }) => {
    if (total <= 1) return null;
    const items = buildPageWindow(page, total);
    return (
        <div className="admin-pager">
            <button className="admin-pagebtn" disabled={page <= 1} onClick={() => onPage(page - 1)}>이전</button>
            {items.map((it, idx) =>
                it === "..." ? (
                    <span key={`e-${idx}`} className="admin-ellipsis-btn">…</span>
                ) : (
                    <button key={it} className={`admin-pagebtn ${page === it ? "on" : ""}`} onClick={() => onPage(it)}>
                        {it}
                    </button>
                )
            )}
            <button className="admin-pagebtn" disabled={page >= total} onClick={() => onPage(page + 1)}>다음</button>
        </div>
    );
};

export default function AdminContent() {
    const navigate = useNavigate();

    // RER / IPC / OHT
    const [pending, setPending] = useState([]);
    const [ipc, setIpc] = useState([]);
    const [oht, setOht] = useState([]);
    const [loadingPending, setLoadingPending] = useState(false);
    const [loadingIpc, setLoadingIpc] = useState(false);
    const [loadingOht, setLoadingOht] = useState(false);

    // 피드(프론트 상태)
    const [feed, setFeed] = useState([]);

    // 모달
    const [pendingModal, setPendingModal] = useState(null);
    const [ipcModal, setIpcModal] = useState(null);
    const [ohtModalOpen, setOhtModalOpen] = useState(false);
    const [feedModalOpen, setFeedModalOpen] = useState(false);

    // IPC 폼
    const [ipcDecision, setIpcDecision] = useState("무시");
    const [ipcState, setIpcState] = useState("처리중");
    const [ipcMemo, setIpcMemo] = useState("");

    useEffect(() => {
        if (!ipcModal) return;
        setIpcDecision("무시");
        setIpcState(ipcModal.status || "처리중");
        setIpcMemo(ipcModal.memo || "");
    }, [ipcModal]);

    /* 데이터 로드 */
    useEffect(() => {
        (async () => {
            // RER
            setLoadingPending(true);
            try {
                const { data } = await axios.get("/api/adminContent/RER");
                const rows = arr(data).map((x) => ({
                    id: x.id,
                    status: mapStatus(x.status),
                    text: x.reason ?? "-",
                    reporterId: x.reporterId ?? null,
                    place: x.placeName ?? "-",
                    date: fmtDate(pickDate(x)),
                    type: "가게정보",
                }));
                rows.sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.id ?? 0) - (a.id ?? 0));
                setPending(rows);
            } finally {
                setLoadingPending(false);
            }

            // IPC
            setLoadingIpc(true);
            try {
                const { data } = await axios.get("/api/adminContent/IPC");
                const rows = arr(data).map((x) => ({
                    id: x.id,
                    title: "부적절한 콘텐츠 신고",
                    reason: x.reason ?? "-",
                    reporterId: x.reporterId ?? null,
                    date: fmtDate(pickDate(x)),
                    excerpt: x.excerpt ?? "",
                    memo: x.memo ?? "",
                    status: mapStatus(x.status),
                }));
                rows.sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.id ?? 0) - (a.id ?? 0));
                setIpc(rows);
            } finally {
                setLoadingIpc(false);
            }

            // OHT
            setLoadingOht(true);
            try {
                const { data } = await axios.get("/api/adminContent/OHT");
                const rows = arr(data).map((x) => ({
                    id: x.id,
                    text: x.reason ?? x.text ?? "-",
                    reporterId: x.reporterId ?? null,
                    date: fmtDate(pickDate(x)),
                }));
                rows.sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.id ?? 0) - (a.id ?? 0));
                setOht(rows);
            } finally {
                setLoadingOht(false);
            }
        })();
    }, []);

    /* 공통 업데이트 */
    const updateReport = async (type, id, payload) => {
        const t = String(type).toLowerCase();
        return axios.post(`/api/reports/${t}/${id}`, payload, { headers: { "Content-Type": "application/json" } });
    };

    /* 피드 */
    const pushFeed = (title, tag, text) =>
        setFeed((prev) => [{ id: Date.now(), title, date: today(), tag, text }, ...prev].slice(0, 3));

    /* RER 승인/거절 */
    const approvePending = async (row) => {
        const prev = pending;
        setPending((list) => list.filter((p) => p.id !== row.id));
        pushFeed("승인됨(가게 정보)", row.place || "-", row.text);
        try {
            await updateReport("rer", row.id, { status: "RESOLVED", decision: "APPROVE", memo: "프론트 승인 처리" });
        } catch {
            alert("승인 저장 실패. 되돌립니다.");
            setPending(prev);
        }
    };
    const rejectPending = async (row) => {
        const prev = pending;
        setPending((list) => list.filter((p) => p.id !== row.id));
        try {
            await updateReport("rer", row.id, { status: "REJECTED", decision: "REJECT", memo: "프론트 거절 처리" });
        } catch {
            alert("거절 저장 실패. 되돌립니다.");
            setPending(prev);
        }
    };

    /* IPC 저장 */
    const saveIpcAction = async () => {
        if (!ipcModal) return;
        const payload = {
            decision: toServerDecision(ipcDecision),
            status: toServerStatus(ipcState),
            memo: ipcMemo, // reason은 보존
        };
        const prev = ipc;
        setIpc((rows) => rows.map((r) => (r.id === ipcModal.id ? { ...r, status: ipcState, memo: ipcMemo } : r)));
        try {
            await updateReport("ipc", ipcModal.id, payload);
            setIpcModal(null);
        } catch {
            alert("저장 실패. 되돌립니다.");
            setIpc(prev);
        }
    };
    
    /* 페이징 */
    const PENDING_SIZE = 5, IPC_SIZE = 5;
    const [pendingPage, setPendingPage] = useState(1);
    const [ipcPage, setIpcPage] = useState(1);
    const pendingPages = Math.max(1, Math.ceil(pending.length / PENDING_SIZE));
    const ipcPages = Math.max(1, Math.ceil(ipc.length / IPC_SIZE));
    useEffect(() => { if (pendingPage > pendingPages) setPendingPage(pendingPages); }, [pending.length, pendingPages, pendingPage]);
    useEffect(() => { if (ipcPage > ipcPages) setIpcPage(ipcPages); }, [ipc.length, ipcPages, ipcPage]);
    const pendingView = useMemo(() => pending.slice((pendingPage - 1) * PENDING_SIZE, pendingPage * PENDING_SIZE), [pending, pendingPage]);
    const ipcView = useMemo(() => ipc.slice((ipcPage - 1) * IPC_SIZE, ipcPage * IPC_SIZE), [ipc, ipcPage]);

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <h2 className="admin-logo"><img src="https://i.imgur.com/tiY7WKl.png" alt="My Plate Logo" className="admin-logo-img" /></h2>
                <nav>
                    <ul>
                        <li onClick={() => navigate("/adminMain")}>홈</li>
                        <li onClick={() => navigate("/adminrestaurants")}>식당 관리</li>
                        <li onClick={() => navigate("/adminUser")}>사용자 관리</li>
                        <li onClick={() => navigate("/adminContent")}>콘텐츠 관리</li>
                        <li onClick={() => navigate("/adminanalysis")}>분석 대시보드</li>
                    </ul>
                </nav>
            </aside>

            <div className="admin-content-page">
                <div className="admin-content-header"><div><h2 className="admin-content-title">콘텐츠 관리</h2></div></div>

                {/* 상단: RER 수정 요청 */}
                <section className="admin-section admin-pending">
                    <div className="admin-section-header"><h3 className="admin-section-title">수정 요청 대기 중인 콘텐츠</h3></div>
                    <div className="admin-desk-wrap">
                        <table className="admin-desk admin-pending-desk">
                            {/* ✅ 고정 컬럼 폭: 버튼 정렬 보장 */}
                            <colgroup>
                                <col className="col-type" />
                                <col className="col-text" />
                                <col className="col-reporter" />
                                <col className="col-date" />
                                <col className="col-actions" />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th className="t-type">유형</th>
                                    <th className="t-text">콘텐츠</th>
                                    <th className="t-reporter">리포터 ID</th>
                                    <th className="t-date">제출/변경일</th>
                                    <th className="t-actions">작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingPending && (<tr><td colSpan={5} className="admin-empty">불러오는 중…</td></tr>)}
                                {!loadingPending && pendingView.length === 0 && (<tr><td colSpan={5} className="admin-empty">대기 중인 콘텐츠가 없습니다.</td></tr>)}
                                {!loadingPending && pendingView.map((row) => (
                                    <tr key={row.id}>
                                        <td><span className="admin-chip admin-chip--review">{row.type}</span></td>
                                        <td className="admin-ellipsis">{row.text}</td>
                                        <td className="ta-center">{row.reporterId ?? "-"}</td>
                                        <td className="ta-center">{row.date || "-"}</td>
                                        <td className="ta-center">
                                            <div className="admin-actions">
                                                <button className="admin-bttn admin-bttn--xs admin-bttn--primary" onClick={() => setPendingModal(row)}>확인</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pager page={pendingPage} total={pendingPages} onPage={setPendingPage} />
                </section>

                {/* 하단: 좌 IPC / 우 OHT + 피드 */}
                <div className="admin-page-grid">
                    {/* 좌: IPC */}
                    <section className="admin-section admin-reports">
                        <div className="admin-section-header"><h3 className="admin-section-title">부적절한 콘텐츠</h3></div>
                        {loadingIpc && <div className="admin-empty">불러오는 중…</div>}
                        {!loadingIpc && ipcView.length === 0 && <div className="admin-empty">신고된 항목이 없습니다.</div>}
                        <div className="admin-report-list">
                            {ipcView.map((r) => (
                                <article key={r.id} className="admin-report-card">
                                    <div className="admin-report-top">
                                        <div className="admin-report-title"><span className="admin-flag" /> {r.title}</div>
                                        <div className="admin-report-meta">
                                            <button className="admin-bttn admin-bttn--sm admin-bttn--danger" onClick={() => setIpcModal(r)}>내용</button>
                                        </div>
                                    </div>
                                    <p className="admin-report-reason">{r.reason}</p>
                                    <div className="admin-report-target"><b>리포터 ID</b>: {r.reporterId ?? "-"}</div>
                                    {r.excerpt && <div className="admin-report-excerpt">{r.excerpt}</div>}
                                </article>
                            ))}
                        </div>
                        <Pager page={ipcPage} total={ipcPages} onPage={setIpcPage} />
                    </section>

                    {/* 우: OHT + 피드 */}
                    <aside className="admin-sidecol">
                        <section className="admin-section">
                            <div className="admin-section-header">
                                <h3 className="admin-section-title">기타 문의</h3>
                                <button className="admin-view" onClick={() => setOhtModalOpen(true)}>모두 보기</button>
                            </div>
                            {loadingOht && <div className="admin-empty">불러오는 중…</div>}
                            {!loadingOht && oht.slice(0, 5).length === 0 && <div className="admin-empty">문의가 없습니다.</div>}
                            <ul className="admin-feed admin-feed--compact">
                                {oht.slice(0, 5).map((q) => (
                                    <li key={q.id}>
                                        <div>
                                            <div className="admin-feed-head"><strong>리포터 ID: {q.reporterId ?? "-"}</strong></div>
                                            <p className="admin-ellipsis">{q.text}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="admin-section">
                            <div className="admin-section-header">
                                <h3 className="admin-section-title">최근 승인 피드</h3>
                                <button className="admin-view" onClick={() => setFeedModalOpen(true)}>모두 보기</button>
                            </div>
                            <div className="admin-approved-grid small-gap">
                                {feed.slice(0, 3).map((f) => (
                                    <div key={f.id} className="admin-approved-card">
                                        <div className="admin-approved-top">
                                            <div className="admin-approved-kind">{f.title}</div>
                                            <div className="admin-approved-date">{f.date}</div>
                                        </div>
                                        {f.text && <p className="admin-approved-text admin-ellipsis-3">{f.text}</p>}
                                        <div className="admin-approved-bottom"><span className="admin-approved-tag">{f.tag}</span></div>
                                    </div>
                                ))}
                                {feed.length === 0 && <div className="admin-empty">표시할 항목이 없습니다.</div>}
                            </div>
                        </section>
                    </aside>
                </div>
            </div>

            {/* 모달: RER 상세 */}
            {pendingModal && (
                <div className="admin-modal-overlay" onClick={(e) => { if (e.target.classList.contains("admin-modal-overlay")) setPendingModal(null); }} role="dialog" aria-modal="true">
                    <div className="admin-modal admin-modal-pending">
                        <div className="admin-modal-header">
                            <h3>수정 요청 상세</h3>
                            <button className="admin-modal-close" onClick={() => setPendingModal(null)} aria-label="닫기">×</button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-form-grid">
                                <div className="admin-field"><div className="admin-label">유형</div><div className="admin-inputlike">가게정보</div></div>
                                <div className="admin-field"><div className="admin-label">제출/변경일</div><div className="admin-inputlike">{pendingModal.date || "-"}</div></div>
                                <div className="admin-field"><div className="admin-label">리포터 ID</div><div className="admin-inputlike">{pendingModal.reporterId ?? "-"}</div></div>
                                <div className="admin-field"><div className="admin-label">식당</div><div className="admin-inputlike">{pendingModal.place}</div></div>
                            </div>
                            <div className="admin-field" style={{ marginTop: 8 }}>
                                <div className="admin-label">요청 내용</div>
                                <div className="admin-textlike">{pendingModal.text}</div>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-bttn admin-bttn--primary admin-bttn--sm" onClick={() => { approvePending(pendingModal); setPendingModal(null); }}>승인</button>
                            <button className="admin-bttn admin-bttn--ghost admin-bttn--sm" onClick={() => { rejectPending(pendingModal); setPendingModal(null); }}>거절</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 모달: IPC 상세/처리 */}
            {ipcModal && (
                <div className="admin-modal-overlay" onClick={(e) => { if (e.target.classList.contains("admin-modal-overlay")) setIpcModal(null); }} role="dialog" aria-modal="true">
                    <div className="admin-modal admin-modal-report">
                        <div className="admin-modal-header">
                            <h3>신고 상세 / 처리</h3>
                            <button className="admin-modal-close" onClick={() => setIpcModal(null)} aria-label="닫기">×</button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-form-grid">
                                <div className="admin-field"><div className="admin-label">일자</div><div className="admin-inputlike">{ipcModal.date}</div></div>
                                <div className="admin-field"><div className="admin-label">리포터 ID</div><div className="admin-inputlike">{ipcModal.reporterId ?? "-"}</div></div>
                            </div>
                            <div className="admin-field" style={{ marginTop: 8 }}>
                                <div className="admin-label">사유</div>
                                <div className="admin-textlike">{ipcModal.reason}</div>
                            </div>
                            {ipcModal.excerpt && (
                                <div className="admin-field" style={{ marginTop: 6 }}>
                                    <div className="admin-label">발생 위치 / 해당 내용</div>
                                    <div className="admin-textlike">{ipcModal.excerpt}</div>
                                </div>
                            )}
                            <div className="admin-divider" />
                            <div className="admin-form-grid">
                                <label className="admin-field">
                                    <div className="admin-label">조치</div>
                                    <select className="admin-select" value={ipcDecision} onChange={(e) => setIpcDecision(e.target.value)}>
                                        <option>무시</option>
                                        <option>경고</option>
                                        <option>컨텐츠 숨기기</option>
                                    </select>
                                </label>
                                <label className="admin-field">
                                    <div className="admin-label">상태</div>
                                    <select className="admin-select" value={ipcState} onChange={(e) => setIpcState(e.target.value)}>
                                        <option>대기</option>
                                        <option>처리중</option>
                                        <option>완료</option>
                                        <option>반려</option>
                                    </select>
                                </label>
                            </div>
                            <label className="admin-field" style={{ marginTop: 6 }}>
                                <div className="admin-label">메모(관리자용)</div>
                                <textarea className="admin-textarea" rows={3} value={ipcMemo} onChange={(e) => setIpcMemo(e.target.value)} placeholder="처리 사유/증빙 등을 기록하세요." />
                            </label>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-bttn admin-bttn--ghost admin-bttn--sm" onClick={() => setIpcModal(null)}>닫기</button>
                            <button className="admin-bttn admin-bttn--primary admin-bttn--sm" onClick={saveIpcAction}>저장</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 모달: 기타 문의 전체 */}
            {ohtModalOpen && (
                <div className="admin-modal-overlay" onClick={(e) => { if (e.target.classList.contains("admin-modal-overlay")) setOhtModalOpen(false); }} role="dialog" aria-modal="true">
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <h3>기타 문의 전체</h3>
                            <button className="admin-modal-close" onClick={() => setOhtModalOpen(false)} aria-label="닫기">×</button>
                        </div>
                        <div className="admin-modal-body">
                            <ul className="admin-feed">
                                {oht.map((q) => (
                                    <li key={q.id}>
                                        <div>
                                            <div className="admin-feed-head">
                                                <strong>리포터 ID: {q.reporterId ?? "-"}</strong>
                                                <span>{q.date}</span>
                                            </div>
                                            <p>{q.text}</p>
                                        </div>
                                    </li>
                                ))}
                                {oht.length === 0 && <li className="admin-empty">표시할 항목이 없습니다.</li>}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* 모달: 승인 피드 전체 */}
            {feedModalOpen && (
                <div className="admin-modal-overlay" onClick={(e) => { if (e.target.classList.contains("admin-modal-overlay")) setFeedModalOpen(false); }} role="dialog" aria-modal="true">
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <h3>최근 승인 피드 전체</h3>
                            <button className="admin-modal-close" onClick={() => setFeedModalOpen(false)} aria-label="닫기">×</button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-approved-grid admin-approved-grid--modal">
                                {feed.map((f) => (
                                    <div key={f.id} className="admin-approved-card">
                                        <div className="admin-approved-top"><div className="admin-approved-kind">{f.title}</div></div>
                                        {f.text && <p className="admin-approved-text">{f.text}</p>}
                                        <div className="admin-approved-bottom"><span className="admin-approved-tag">{f.tag}</span></div>
                                    </div>
                                ))}
                                {feed.length === 0 && <div className="admin-empty">표시할 항목이 없습니다.</div>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
