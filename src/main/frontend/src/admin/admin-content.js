import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAlert, useConfirm } from "../ui/alert-center"; // 전역 알림 + 확인 모달
import "./admin-content.css";

// axios.defaults.baseURL = "http://localhost:8080";
// axios.defaults.withCredentials = true;

const arr = (p) => (Array.isArray(p) ? p : (p?.items || p?.list || p?.rows || []));
const fmtDate = (v) => (v ? String(v).slice(0, 10) : "-");
const pickDate = (x) => x?.updatedAt || x?.updated_at || x?.createdAt || x?.created_at || null;

const mapStatus = (s = "") => {
    const k = String(s).toUpperCase();
    if (k.includes("IN_PROGRESS")) return "처리중";
    if (k.includes("RESOLVED")) return "완료";
    if (k.includes("REJECT")) return "반려";
    return "대기";
};
const mapRerStatus3 = (s = "") => {
    const k = String(s).toUpperCase();
    if (k.includes("IN_PROGRESS")) return "처리중";
    if (k.includes("RESOLVED") || k.includes("REJECT")) return "완료";
    return "대기";
};

const toServerStatus = (label = "") =>
    ({ 대기: "PENDING", 처리중: "IN_PROGRESS", 완료: "RESOLVED", 반려: "REJECTED" }[label] || "PENDING");
const toServerDecision = (label = "") =>
    ({ 무시: "IGNORE", 경고: "WARN", "컨텐츠 숨기기": "HIDE", 승인: "APPROVE", 거절: "REJECT" }[label] || "IGNORE");

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

const tagTone = (st = "대기") => (st === "완료" ? "ok" : st === "반려" ? "off" : "warn"); // 대기/처리중=warn
const StatusTag = ({ status = "대기" }) => (
    <span className={`admin-approved-tag ${tagTone(status)}`}>{status}</span>
);

const compact = (obj = {}) => {
    const out = {};
    Object.entries(obj).forEach(([k, v]) => {
        if (v === undefined) return;
        if (typeof v === "string" && v.trim() === "") return;
        out[k] = v;
    });
    return out;
};
const updateReport = async (type, id, payload) => {
    const k = String(type).toLowerCase();
    const t = k === "oht" ? "oth" : k;
    return axios.post(`/api/reports/${t}/${id}`, compact(payload), {
        headers: { "Content-Type": "application/json" },
    });
};

/* === ID → 이름 매핑 (간단 캐시) =========================== */
const __nameCache = {};
async function fetchUserName(id) {
    if (id == null) return "-";
    if (__nameCache[id]) return __nameCache[id];
    try {
        const { data } = await axios.get(`/api/adminUser/${id}`);
        const nm = data?.username || data?.name || data?.email || `ID:${id}`;
        __nameCache[id] = nm;
        return nm;
    } catch {
        __nameCache[id] = `ID:${id}`;
        return __nameCache[id];
    }
}
const nameOf = (id) => (id != null ? (__nameCache[id] || `ID:${id}`) : "-");

export default function AdminContent() {
    const navigate = useNavigate();
    const { alert } = useAlert();       // 알림
    const { confirm } = useConfirm();   // 확인 모달

    const [pending, setPending] = useState([]);
    const [ipc, setIpc] = useState([]);
    const [oht, setOht] = useState([]);
    const [loadingPending, setLoadingPending] = useState(false);
    const [loadingIpc, setLoadingIpc] = useState(false);
    const [loadingOht, setLoadingOht] = useState(false);

    const [pendingModal, setPendingModal] = useState(null);
    const [ipcModal, setIpcModal] = useState(null);
    const [ohtModalOpen, setOhtModalOpen] = useState(false);

    const [ohtDetail, setOhtDetail] = useState(null);
    const [ohtReply, setOhtReply] = useState("");

    const [recentActions, setRecentActions] = useState([]);
    const [actionsRer, setActionsRer] = useState([]);
    const [actionsIpc, setActionsIpc] = useState([]);
    const [actionsOht, setActionsOht] = useState([]);
    const [actionTab, setActionTab] = useState("RER");
    const [actionModalOpen, setActionModalOpen] = useState(false);

    const [ipcDecision, setIpcDecision] = useState("무시");
    const [ipcState, setIpcState] = useState("처리중");
    const [ipcMemo, setIpcMemo] = useState("");

    useEffect(() => {
        if (!ipcModal) return;
        setIpcDecision("무시");
        setIpcState(ipcModal.status || "처리중");
        setIpcMemo(ipcModal.memo || "");
    }, [ipcModal]);

    const reloadActions = async () => {
        const [rerAct, ipcAct, ohtAct] = await Promise.all([
            axios.get("/api/adminActions/RER"),
            axios.get("/api/adminActions/IPC"),
            axios.get("/api/adminActions/OTH"),
        ]);
        const rer = arr(rerAct.data);
        const ipcL = arr(ipcAct.data);
        const ohtL = arr(ohtAct.data);
        const all = [...rer, ...ipcL, ...ohtL].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

        // reporterId -> 이름 캐시 채우기
        const ids = [...new Set(all.map((a) => a?.reporterId).filter(Boolean))];
        await Promise.all(ids.map(fetchUserName));
        const enrich = (list) =>
            list.map((a) => ({ ...a, reporterName: a?.reporterId != null ? nameOf(a.reporterId) : "-" }));

        setRecentActions(enrich(all).slice(0, 2));
        setActionsRer(enrich(rer));
        setActionsIpc(enrich(ipcL));
        setActionsOht(enrich(ohtL));
    };

    useEffect(() => {
        (async () => {
            try {
                setLoadingPending(true);
                const rerRes = await axios.get("/api/adminContent/RER");
                const base = arr(rerRes.data).map((x) => ({
                    id: x.id,
                    status3: mapRerStatus3(x.status),
                    text: x.reason ?? "-",
                    memo: x.memo ?? x.reporterMemo ?? x.note ?? "",
                    reporterId: x.reporterId ?? null,
                    restaurantId: x.reportedItemId ?? x.restaurantId ?? null,
                    place: x.placeName || "-",
                    date: fmtDate(pickDate(x)),
                    type: "가게정보",
                }));

                const userIds = [...new Set(base.map((b) => b.reporterId).filter(Boolean))];
                await Promise.all(userIds.map(fetchUserName));

                const withNames = base.map((b) => ({
                    ...b,
                    reporterName: b.reporterId != null ? nameOf(b.reporterId) : "-",
                }));

                setPending(withNames);
            } finally {
                setLoadingPending(false);
            }

            try {
                setLoadingIpc(true);
                const ipcRes = await axios.get("/api/adminContent/IPC");
                const base = arr(ipcRes.data).map((x) => ({
                    id: x.id,
                    title: "부적절한 콘텐츠 신고",
                    reason: x.reason ?? "-",
                    reporterId: x.reporterId ?? null,
                    date: fmtDate(pickDate(x)),
                    excerpt: x.excerpt ?? "",
                    memo: x.memo ?? "",
                    status: mapStatus(x.status),
                }));
                const ids = [...new Set(base.map((b) => b.reporterId).filter(Boolean))];
                await Promise.all(ids.map(fetchUserName));
                const withNames = base.map((b) => ({ ...b, reporterName: b.reporterId != null ? nameOf(b.reporterId) : "-" }));
                setIpc(withNames);
            } finally {
                setLoadingIpc(false);
            }

            try {
                setLoadingOht(true);
                const ohtRes = await axios.get("/api/adminContent/OTH");
                const base = arr(ohtRes.data).map((x) => ({
                    id: x.id,
                    text: x.reason ?? x.text ?? "-",
                    reporterId: x.reporterId ?? null,
                    date: fmtDate(pickDate(x)),
                    status: mapStatus(x.status),
                    memo: x.memo ?? "",
                }));
                const ids = [...new Set(base.map((b) => b.reporterId).filter(Boolean))];
                await Promise.all(ids.map(fetchUserName));
                const withNames = base.map((b) => ({ ...b, reporterName: b.reporterId != null ? nameOf(b.reporterId) : "-" }));
                setOht(withNames);
            } finally {
                setLoadingOht(false);
            }

            await reloadActions();
        })();
    }, []);

    const actionFiltered = useMemo(() => {
        if (actionTab === "RER") return actionsRer;
        if (actionTab === "IPC") return actionsIpc;
        if (actionTab === "OHT") return actionsOht;
        return [];
    }, [actionTab, actionsRer, actionsIpc, actionsOht]);

    // 승인/거절 확인 모달
    const approvePending = async (row) => {
        const ok = await confirm({
            title: "승인 확인",
            message: `이 수정 요청을 승인하시겠습니까?\n식당: ${row.place}\n신고자: ${row.reporterName ?? (row.reporterId ?? "-")}`,
            okText: "승인",
            cancelText: "취소",
        });
        if (!ok) return;

        const prev = pending;
        setPending((list) => list.filter((p) => p.id !== row.id));
        try {
            await updateReport("rer", row.id, { status: "RESOLVED", decision: "APPROVE" });
            await reloadActions();
            alert("승인 처리되었습니다.", { autoCloseMs: 1500 });
        } catch {
            alert("승인 저장 실패. 되돌립니다.");
            setPending(prev);
        }
    };
    const rejectPending = async (row) => {
        const ok = await confirm({
            title: "거절 확인",
            message: `이 수정 요청을 거절하시겠습니까?\n식당: ${row.place}\n신고자: ${row.reporterName ?? (row.reporterId ?? "-")}`,
            okText: "거절",
            cancelText: "취소",
        });
        if (!ok) return;

        const prev = pending;
        setPending((list) => list.filter((p) => p.id !== row.id));
        try {
            await updateReport("rer", row.id, { status: "REJECTED", decision: "REJECT" });
            await reloadActions();
            alert("거절 처리되었습니다.", { autoCloseMs: 1500 });
        } catch {
            alert("거절 저장 실패. 되돌립니다.");
            setPending(prev);
        }
    };

    // IPC 저장 확인 모달
    const saveIpcAction = async () => {
        if (!ipcModal) return;
        const ok = await confirm({
            title: "저장 확인",
            message: "이 신고 처리 내용을 저장할까요?",
            okText: "저장",
            cancelText: "취소",
        });
        if (!ok) return;

        const payload = {
            decision: toServerDecision(ipcDecision),
            status: toServerStatus(ipcState),
            memo: ipcMemo,
        };
        const prev = ipc;
        setIpc((rows) => rows.map((r) => (r.id === ipcModal.id ? { ...r, status: ipcState, memo: ipcMemo } : r)));
        try {
            await updateReport("ipc", ipcModal.id, payload);
            await reloadActions();
            setIpcModal(null);
            alert("저장되었습니다.", { autoCloseMs: 1500 });
        } catch {
            alert("저장 실패. 되돌립니다.");
            setIpc(prev);
        }
    };

    const openOhtDetail = async (item) => {
        try {
            const { data } = await axios.get(`/api/reports/oth/${item.id}`);
            const full = {
                id: data?.id ?? item.id,
                reporterId: data?.reporterId ?? item.reporterId ?? null,
                date: fmtDate(pickDate(data) || item.date),
                text: data?.reason ?? data?.text ?? item.text ?? "-",
                memo: data?.memo ?? item.memo ?? "",
                status: mapStatus(data?.status ?? item.status),
            };
            const nm = full.reporterId != null ? await fetchUserName(full.reporterId) : "-";
            setOhtDetail({ ...full, reporterName: nm });
            setOhtReply(full.memo || "");
        } catch {
            const nm = item?.reporterId != null ? await fetchUserName(item.reporterId) : "-";
            setOhtDetail({ ...item, reporterName: nm });
            setOhtReply(item.memo || "");
        }
    };

    const openRerDetail = async (row) => {
        try {
            const { data } = await axios.get(`/api/reports/rer/${row.id}`);

            const rid = data?.reportedItemId ?? data?.restaurantId ?? row.restaurantId ?? null;
            const place =
                data?.placeName || row.place || "-";

            const reporterName =
                row.reporterName ??
                (row.reporterId != null ? await fetchUserName(row.reporterId) : "-");

            setPendingModal({
                ...row,
                restaurantId: rid,
                place,
                reporterName,
            });
        } catch {
            setPendingModal(row);
        }
    };

    // OTH 저장/완료
    const saveOhtAnswer = async () => {
        if (!ohtDetail) return;
        const ok = await confirm({
            title: "완료 확인",
            message: "답변을 저장하고 문의를 완료로 처리할까요?",
            okText: "저장 후 완료",
            cancelText: "취소",
        });
        if (!ok) return;

        const id = ohtDetail.id;
        const prev = oht;
        setOht((rows) => rows.map((r) => (r.id === id ? { ...r, status: "완료", memo: ohtReply } : r)));
        try {
            await updateReport("oth", id, { status: "RESOLVED", decision: "NONE", memo: ohtReply?.trim() || null });
            await reloadActions();
            setOhtDetail(null);
            setOhtReply("");
            alert("저장되었습니다.", { autoCloseMs: 1500 });
            return;
        } catch { }
        try {
            await updateReport("oth", id, {
                status: "RESOLVED",
                decision: "NONE",
                memo: ohtReply?.trim() || null,
            });
            await reloadActions();
            setOhtDetail(null);
            setOhtReply("");
            alert("저장되었습니다.", { autoCloseMs: 1500 });
            return;
        } catch { }
        try {
            await updateReport("oth", id, {
                status: "RESOLVED",
                decision: "NONE",
                memo: ohtReply?.trim() || null,
                excerpt: "-",
            });
            await reloadActions();
            setOhtDetail(null);
            setOhtReply("");
            alert("저장되었습니다.", { autoCloseMs: 1500 });
            return;
        } catch {
            alert("저장 실패. 되돌립니다.");
            setOht(prev);
        }
    };

    const PENDING_SIZE = 5,
        IPC_SIZE = 5;
    const [pendingPage, setPendingPage] = useState(1);
    const [ipcPage, setIpcPage] = useState(1);
    const pendingPages = Math.max(1, Math.ceil(pending.length / PENDING_SIZE));
    const ipcPages = Math.max(1, Math.ceil(ipc.length / IPC_SIZE));
    useEffect(() => {
        if (pendingPage > pendingPages) setPendingPage(pendingPages);
    }, [pending.length, pendingPages, pendingPage]);
    useEffect(() => {
        if (ipcPage > ipcPages) setIpcPage(ipcPages);
    }, [ipc.length, ipcPages, ipcPage]);
    const pendingView = useMemo(
        () => pending.slice((pendingPage - 1) * PENDING_SIZE, pendingPage * PENDING_SIZE),
        [pending, pendingPage]
    );
    const ipcView = useMemo(() => ipc.slice((ipcPage - 1) * IPC_SIZE, ipcPage * IPC_SIZE), [ipc, ipcPage]);

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <h2 className="admin-logo" onClick={() => navigate(`/adminMain`)}>
                    <img src="https://i.imgur.com/tiY7WKl.png" alt="My Plate Logo" className="admin-logo-img" />
                </h2>
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
                <div className="admin-content-header">
                    <div>
                        <h2 className="admin-content-title">콘텐츠 관리</h2>
                    </div>
                </div>

                <section className="admin-section admin-pending">
                    <div className="admin-section-header">
                        <h3 className="admin-section-title">수정 요청 대기 중인 콘텐츠</h3>
                    </div>
                    <div className="admin-desk-wrap">
                        <table className="admin-desk admin-pending-desk">
                            <colgroup>
                                <col className="col-type" />
                                <col className="col-text" />
                                <col className="col-reporter" />
                                <col className="col-status" />
                                <col className="col-date" />
                                <col className="col-actions" />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th className="t-type">유형</th>
                                    <th className="t-text">콘텐츠</th>
                                    <th className="t-reporter">신고자</th>
                                    <th className="t-status">상태</th>
                                    <th className="t-date">제출/변경일</th>
                                    <th className="t-actions">작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingPending && <tr><td colSpan={6} className="admin-empty">불러오는 중…</td></tr>}
                                {!loadingPending && pendingView.length === 0 && (
                                    <tr><td colSpan={6} className="admin-empty">대기 중인 콘텐츠가 없습니다.</td></tr>
                                )}
                                {!loadingPending &&
                                    pendingView.map((row) => (
                                        <tr key={row.id}>
                                            <td><span className="admin-chip admin-chip--review">{row.type}</span></td>
                                            <td className="admin-ellipsis">{row.text}</td>
                                            <td className="ta-center">{row.reporterName ?? (row.reporterId ?? "-")}</td>
                                            <td className="ta-center"><StatusTag status={row.status3} /></td>
                                            <td className="ta-center">{row.date || "-"}</td>
                                            <td className="ta-center">
                                                <div className="admin-actions">
                                                    <button
                                                        className="admin-bttn admin-bttn--xs admin-bttn--primary"
                                                        onClick={() => openRerDetail(row)}
                                                    >
                                                        확인
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                    <Pager page={pendingPage} total={pendingPages} onPage={setPendingPage} />
                </section>

                <div className="admin-page-grid">
                    <section className="admin-section admin-reports">
                        <div className="admin-section-header">
                            <h3 className="admin-section-title">부적절한 콘텐츠</h3>
                        </div>
                        {loadingIpc && <div className="admin-empty">불러오는 중…</div>}
                        {!loadingIpc && ipcView.length === 0 && <div className="admin-empty">신고된 항목이 없습니다.</div>}
                        <div className="admin-report-list">
                            {ipcView.map((r) => (
                                <article key={r.id} className="admin-report-card">
                                    <div className="admin-report-top">
                                        <div className="admin-report-title">
                                            <span className="admin-flag" />
                                            {r.title}
                                        </div>
                                        <div className="admin-report-meta">
                                            <button className="admin-bttn admin-bttn--sm admin-bttn--danger" onClick={() => setIpcModal(r)}>
                                                내용
                                            </button>
                                        </div>
                                    </div>
                                    <p className="admin-report-reason">{r.reason}</p>
                                    <div className="admin-report-target">
                                        <b>신고자</b>: {r.reporterName ?? (r.reporterId ?? "-")}
                                    </div>
                                    {r.excerpt && <div className="admin-report-excerpt">{r.excerpt}</div>}
                                </article>
                            ))}
                        </div>
                        <Pager page={ipcPage} total={ipcPages} onPage={setIpcPage} />
                    </section>

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
                                    <li key={q.id} onClick={() => openOhtDetail(q)} style={{ cursor: "pointer" }}>
                                        <div>
                                            <div className="admin-feed-head"><strong>신고자: {q.reporterName ?? (q.reporterId ?? "-")}</strong></div>
                                            <p className="admin-ellipsis">{q.text}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="admin-section">
                            <div className="admin-section-header">
                                <h3 className="admin-section-title">최근 처리 이력</h3>
                                <button className="admin-view" onClick={() => setActionModalOpen(true)}>모두 보기</button>
                            </div>
                            <div className="admin-approved-grid small-gap">
                                {recentActions.map((a) => (
                                    <div key={a.id} className="admin-approved-card">
                                        <div className="admin-approved-top">
                                            <div className="admin-approved-kind">리포트 #{a.reportId}</div>
                                            <div className="admin-approved-date">{fmtDate(a.createdAt)}</div>
                                        </div>
                                        <p className="admin-approved-text">{a.memo || "-"}</p>
                                        <div className="admin-approved-bottom">
                                            <StatusTag status={mapStatus(a.statusAfter ?? a.status)} />
                                        </div>
                                    </div>
                                ))}
                                {recentActions.length === 0 && <div className="admin-empty">표시할 이력이 없습니다.</div>}
                            </div>
                        </section>
                    </aside>
                </div>
            </div>

            {pendingModal && (
                <div
                    className="admin-modal-overlay"
                    onClick={(e) => {
                        if (e.target.classList.contains("admin-modal-overlay")) setPendingModal(null);
                    }}
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="admin-modal admin-modal-pending">
                        <div className="admin-modal-header">
                            <h3>수정 요청 상세</h3>
                            <button className="admin-modal-close" onClick={() => setPendingModal(null)} aria-label="닫기">
                                ×
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-form-grid">
                                <div className="admin-field">
                                    <div className="admin-label">유형</div>
                                    <div className="admin-inputlike">가게정보</div>
                                </div>
                                <div className="admin-field">
                                    <div className="admin-label">제출/변경일</div>
                                    <div className="admin-inputlike">{pendingModal.date || "-"}</div>
                                </div>
                                <div className="admin-field">
                                    <div className="admin-label">신고자</div>
                                    <div className="admin-inputlike">{pendingModal.reporterName ?? (pendingModal.reporterId ?? "-")}</div>
                                </div>
                                <div className="admin-field">
                                    <div className="admin-label">식당</div>
                                    <div className="admin-inputlike">{pendingModal.place || "-"}</div>
                                </div>
                            </div>
                            <div className="admin-field" style={{ marginTop: 8 }}>
                                <div className="admin-label">요청 내용</div>
                                <div className="admin-textlike" style={{ whiteSpace: "pre-wrap" }}>
                                    {pendingModal?.text ?? "-"}
                                </div>
                            </div>
                            {(pendingModal?.memo ?? "").trim() !== "" && (
                                <div className="admin-field" style={{ marginTop: 8 }}>
                                    <div className="admin-label">신고자 메모</div>
                                    <div className="admin-textlike" style={{ whiteSpace: "pre-wrap" }}>
                                        {pendingModal.memo}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="admin-modal-footer">
                            <button
                                className="admin-bttn admin-bttn--primary admin-bttn--sm"
                                onClick={() => {
                                    approvePending(pendingModal);
                                    setPendingModal(null);
                                }}
                            >
                                승인
                            </button>
                            <button
                                className="admin-bttn admin-bttn--ghost admin-bttn--sm"
                                onClick={() => {
                                    rejectPending(pendingModal);
                                    setPendingModal(null);
                                }}
                            >
                                거절
                            </button>
                        </div>
                    </div>
                </div>
            )}

            

            {ipcModal && (
                <div
                    className="admin-modal-overlay"
                    onClick={(e) => {
                        if (e.target.classList.contains("admin-modal-overlay")) setIpcModal(null);
                    }}
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="admin-modal admin-modal-report">
                        <div className="admin-modal-header">
                            <h3>신고 상세 / 처리</h3>
                            <button className="admin-modal-close" onClick={() => setIpcModal(null)} aria-label="닫기">
                                ×
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-form-grid">
                                <div className="admin-field">
                                    <div className="admin-label">일자</div>
                                    <div className="admin-inputlike">{ipcModal.date}</div>
                                </div>
                                <div className="admin-field">
                                    <div className="admin-label">신고자</div>
                                    <div className="admin-inputlike">{ipcModal.reporterName ?? (ipcModal.reporterId ?? "-")}</div>
                                </div>
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
                                <div className="admin-label">메모</div>
                                <textarea
                                    className="admin-textarea"
                                    rows={3}
                                    value={ipcMemo}
                                    onChange={(e) => setIpcMemo(e.target.value)}
                                    placeholder="처리 사유/증빙 등을 기록하세요."
                                />
                            </label>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-bttn admin-bttn--ghost admin-bttn--sm" onClick={() => setIpcModal(null)}>
                                닫기
                            </button>
                            <button className="admin-bttn admin-bttn--primary admin-bttn--sm" onClick={saveIpcAction}>
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                    <li key={q.id} onClick={() => openOhtDetail(q)} style={{ cursor: "pointer" }}>
                                        <div>
                                            <div className="admin-feed-head"><strong>신고자: {q.reporterName ?? (q.reporterId ?? "-")}</strong></div>
                                            <p>{q.text}</p>
                                            {q.status === "완료" && <div className="admin-chip admin-chip--done">완료</div>}
                                        </div>
                                    </li>
                                ))}
                                {oht.length === 0 && <li className="admin-empty">표시할 항목이 없습니다.</li>}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {ohtDetail && (
                <div
                    className="admin-modal-overlay"
                    onClick={(e) => {
                        if (e.target.classList.contains("admin-modal-overlay")) {
                            setOhtDetail(null);
                            setOhtReply("");
                        }
                    }}
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="admin-modal admin-modal-report" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>기타 문의 상세 / 답변</h3>
                            <button
                                className="admin-modal-close"
                                onClick={() => {
                                    setOhtDetail(null);
                                    setOhtReply("");
                                }}
                                aria-label="닫기"
                            >
                                ×
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-form-grid">
                                <div className="admin-field">
                                    <div className="admin-label">일자</div>
                                    <div className="admin-inputlike">{ohtDetail.date || "-"}</div>
                                </div>
                                <div className="admin-field">
                                    <div className="admin-label">신고자</div>
                                    <div className="admin-inputlike">{ohtDetail.reporterName ?? (ohtDetail.reporterId ?? "-")}</div>
                                </div>
                                <div className="admin-field">
                                    <div className="admin-label">상태</div>
                                    <div className="admin-inputlike">{ohtDetail.status || "대기"}</div>
                                </div>
                            </div>
                            <div className="admin-field" style={{ marginTop: 8 }}>
                                <div className="admin-label">문의 내용</div>
                                <div className="admin-textlike">{ohtDetail.text}</div>
                            </div>
                            <label className="admin-field" style={{ marginTop: 8 }}>
                                <div className="admin-label">답변</div>
                                <textarea
                                    className="admin-textarea"
                                    rows={4}
                                    value={ohtReply}
                                    onChange={(e) => setOhtReply(e.target.value)}
                                    placeholder="문의에 대한 답변을 입력하세요."
                                />
                            </label>
                        </div>
                        <div className="admin-modal-footer">
                            <button
                                className="admin-bttn admin-bttn--ghost admin-bttn--sm"
                                onClick={() => {
                                    setOhtDetail(null);
                                    setOhtReply("");
                                }}
                            >
                                닫기
                            </button>
                            <button className="admin-bttn admin-bttn--primary admin-bttn--sm" onClick={saveOhtAnswer}>
                                저장 후 완료
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {actionModalOpen && (
                <div className="admin-modal-overlay" onClick={() => setActionModalOpen(false)}>
                    <div className="admin-modal large" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>처리 이력</h3>
                            <button className="admin-modal-close" onClick={() => setActionModalOpen(false)} aria-label="닫기">
                                ×
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-tabs">
                                {["RER", "IPC", "OHT"].map((t) => (
                                    <button
                                        key={t}
                                        className={`admin-tab ${actionTab === t ? "on" : ""}`}
                                        onClick={() => setActionTab(t)}
                                    >
                                        {t === "RER" ? "수정요청" : t === "IPC" ? "부적절 신고" : "기타 문의"}
                                    </button>
                                ))}
                            </div>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>날짜</th>
                                        <th>신고자</th>
                                        <th>조치</th>
                                        <th>상태</th>
                                        <th>신고ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {actionFiltered.map((a) => (
                                        <tr key={a.id}>
                                            <td>{fmtDate(a.createdAt)}</td>
                                            <td>{a.reporterName ?? (a.reporterId ?? "-")}</td>
                                            <td>{a.action}</td>
                                            <td><StatusTag status={mapStatus(a.statusAfter ?? a.status)} /></td>
                                            <td>#{a.reportId}</td>
                                        </tr>
                                    ))}
                                    {actionFiltered.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="admin-empty">
                                                표시할 이력이 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-bttn admin-bttn--primary" onClick={() => setActionModalOpen(false)}>
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
