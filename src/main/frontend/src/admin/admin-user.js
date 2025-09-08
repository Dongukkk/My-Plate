import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./admin-user.css";

// axios.defaults.baseURL = "http://localhost:8080";
// axios.defaults.withCredentials = true;

/* 유틸/매핑 */
const toDateStr = (v) => (v ? String(v).slice(0, 10) : "-");
const stripSanction = (txt = "") => txt.replace(/\[처분:[^\]]+\]\s*/g, "").trim();

const mapStatusFromServer = (s = "") => ({
    ACTIVE: "활성",
    SUSPENDED: "정지",
    DELETED: "비활성",
    PENDING: "수정 필요",
}[s.toUpperCase()] ?? "수정 필요");
const mapStatusToServer = (label = "") => ({
    "활성": "ACTIVE",
    "정지": "SUSPENDED",
    "비활성": "DELETED",
    "수정 필요": "PENDING",
}[label] ?? "PENDING");

const mapReportStatusFromServer = (s = "") => ({
    PENDING: "대기",
    IN_PROGRESS: "처리중",
    RESOLVED: "완료",
    REJECTED: "반려",
}[s.toUpperCase()] ?? "대기");
const mapReportStatusToServer = (label = "") => ({
    "대기": "PENDING",
    "처리중": "IN_PROGRESS",
    "완료": "RESOLVED",
    "반려": "REJECTED",
}[label] ?? "PENDING");

/* 처분(UR) */
const SANCTIONS = [
    { value: "NONE", label: "처분 없음" },
    { value: "WARNING", label: "경고" },
    { value: "SUSPEND_7", label: "정지 7일" },
    { value: "SUSPEND_30", label: "정지 30일" },
    { value: "SUSPEND_PERM", label: "영구 정지" },
];
const sanctionLabel = (v) => (SANCTIONS.find((s) => s.value === v)?.label ?? "처분 없음");
const mapSanctionFromServer = (s = "") => sanctionLabel((s || "").toUpperCase());

/* DTO -> 뷰 모델 */
const toViewUser = (u) => ({
    id: u.id,
    email: u.email,
    name: u.username ?? u.name ?? "",
    address: u.address ?? "",
    phone: u.phoneNumber ?? "",
    role: (u.role || "").toUpperCase().trim(),
    status: mapStatusFromServer(u.status),
    joined: toDateStr(u.createdAt ?? u.joined),
});
const toViewReport = (r) => ({
    id: r.id,
    reporterId: r.reporterId,
    reason: r.reason || "-",
    date: toDateStr(r.createdAt),
    status: mapReportStatusFromServer(r.status),
    decision: r.decision || "NONE",
    memo: r.memo || "",
});
const toViewAction = (a) => ({
    id: a.id,
    reportId: a.reportId,
    userId: a.reporterId,
    action: mapSanctionFromServer(a.action || "NONE"),
    status: mapReportStatusFromServer(a.statusAfter ?? a.status),
    date: toDateStr(a.createdAt ?? a.date),
    memo: a.memo || "",
});
const reportStatusToPill = (st) => (st === "완료" ? "활성" : st === "반려" ? "비활성" : "수정 필요");

/* 표시용 컴포넌트 */
const StatusPill = ({ status = "비활성" }) => {
    const cls = { "활성": "ok", "수정 필요": "warn", "비활성": "off", "정지": "ban" }[status] || "off";
    return <span className={`admin-status ${cls}`}>{status}</span>;
};
const ActionBadge = ({ action = "처분 없음" }) => {
    const tone = action.includes("정지") ? "ban" : action.includes("경고") ? "warn" : "ok";
    return <span className={`admin-status ${tone}`}>{action}</span>;
};
const Pager = ({ page, total, onPage }) => {
    const max = Math.max(1, Math.ceil(total || 1));
    const start = Math.max(1, Math.min(page - 2, Math.max(1, max - 4)));
    const pages = Array.from({ length: Math.min(5, max) }, (_, i) => start + i);
    return (
        <div className="admin-pager">
            <button disabled={page <= 1} onClick={() => onPage(page - 1)}>이전</button>
            {pages.map((p) => (
                <button key={p} className={p === page ? "on" : ""} onClick={() => onPage(p)}>
                    {p}
                </button>
            ))}
            <button disabled={page >= max} onClick={() => onPage(page + 1)}>다음</button>
        </div>
    );
};

/* 라인차트  */
const LineChart = ({ series, height = 200, xLabels = [] }) => {
    const width = 540;
    const padding = { top: 12, right: 16, bottom: 28, left: 40 };
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;

    // 전체 데이터 범위
    const flat = series.flatMap((s) => s.data);
    const maxV = Math.max(1, ...flat, 1);

    // y축 "예쁜" 틱 계산 (5등분)
    const tickCount = 5;
    const niceStep = niceTickStep(maxV / tickCount);
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i * niceStep);
    const maxY = ticks[ticks.length - 1] || maxV;
    const len = Math.max(1, Math.max(...series.map((s) => s.data.length)));
    const x = (i) => padding.left + (i * innerW) / Math.max(1, len - 1);
    const y = (v) => padding.top + (innerH - (v / maxY) * innerH);

    return (
        <svg className="admin-linechart" viewBox={`0 0 ${width} ${height}`} aria-hidden>
            <rect x="0" y="0" width={width} height={height} fill="#fff" rx="10" />
            {/* 그리드 + Y축 눈금 */}
            <g>
                {/* Y축 라벨/그리드 */}
                {ticks.map((t, i) => {
                    const yy = y(t);
                    return (
                        <g key={`yt-${i}`} opacity={i === 0 ? 0.6 : 0.2}>
                            <line x1={padding.left} x2={width - padding.right} y1={yy} y2={yy} stroke="#000" />
                            <text x={padding.left - 8} y={yy} textAnchor="end" dominantBaseline="central" fontSize="10" fill="#555">{t}</text>
                        </g>
                    );
                })}
                {/* Y축 본선 */}
                <line x1={padding.left} x2={padding.left} y1={padding.top} y2={height - padding.bottom} stroke="#000" opacity="0.6"/>
                {/* X축 본선 */}
                <line x1={padding.left} x2={width - padding.right} y1={height - padding.bottom} y2={height - padding.bottom} stroke="#000" opacity="0.6"/>
            </g>

            {/* 라인들 */}
            {series.map((s, idx) => {
                const d = s.data.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(v)}`).join(" ");
                return (
                    <g key={idx}>
                        <path d={d} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                        {s.data.map((v, i) => ( <circle key={`${idx}-${i}`} cx={x(i)} cy={y(v)} r="2" fill={s.color} />))}
                    </g>
                );
            })}

            {/* X축 라벨 (처음/중간/끝) */}
            {xLabels.length >= 2 && (
                <g fontSize="10" fill="#555">
                    <text x={x(0)} y={height - 10} textAnchor="start">{xLabels[0]}</text>
                    <text x={x(Math.floor((len - 1) / 2))} y={height - 10} textAnchor="middle">{xLabels[Math.floor(xLabels.length / 2)]}</text>
                    <text x={x(len - 1)} y={height - 10} textAnchor="end">{xLabels[xLabels.length - 1]}</text>
                </g>
            )}
        </svg>
    );
};

// 눈금 간격 계산
function niceTickStep(raw) {
    if (!isFinite(raw) || raw <= 0) return 1;
    const pow10 = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / pow10;
    let step;
    if (n < 1.5) step = 1;
    else if (n < 3) step = 2;
    else if (n < 7.5) step = 5;
    else step = 10;
    return step * pow10;
}

/* 로컬 폴백 */
const ACTIONS_KEY = "mp_actions";
const readLocalActions = () => {
    try {
        return JSON.parse(localStorage.getItem(ACTIONS_KEY) || "[]");
    } catch {
        return [];
    }
};

export default function AdminUser() {
    const navigate = useNavigate();

    /* 사용자 */
    const [users, setUsers] = useState([]);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("전체");
    const [page, setPage] = useState(1);
    const pageSize = 3;

    /* 로딩/에러 */
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /* 신고(UR) */
    const [reports, setReports] = useState([]);
    const [reportState, setReportState] = useState("모든 상태");
    const [reportPage, setReportPage] = useState(1);
    const reportPageSize = 5;

    /* 신고 모달 */
    const [reportOpen, setReportOpen] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [reportSaving, setReportSaving] = useState(false);

    /* 처리 이력 */
    const [recentActions, setRecentActions] = useState([]);
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [actionTab, setActionTab] = useState("전체");
    const [allActions, setAllActions] = useState([]);

    /* 사용자 편집 */
    const [editOpen, setEditOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    /* 차트 기간 */
    const [period, setPeriod] = useState("최근 30일");

    /* 데이터 로드 */
    const loadUsers = async () => {
        const { data } = await axios.get("/api/adminUser");
        const items = Array.isArray(data) ? data : data?.items || [];
        setUsers(items.map(toViewUser).filter((u) => u.role !== "ADM"));
    };
    const loadReports = async () => {
        const { data } = await axios.get("/api/adminUser/reports");
        const items = Array.isArray(data) ? data : data?.items || [];
        setReports(items.map(toViewReport));
    };
    const loadActionsFromServer = async () => {
        const { data } = await axios.get("/api/adminActions/UR");
        const items = Array.isArray(data) ? data : data?.items || [];
        const view = items
            .map(toViewAction)
            .sort((a, b) => String(b.date).localeCompare(String(a.date)));
        setAllActions(view);
        setRecentActions(view.slice(0, 3));
    };
    const loadActionsFallbackLocal = async () => {
        const items = readLocalActions().sort((a, b) =>
            String(b.createdAt || b.date).localeCompare(String(a.createdAt || a.date))
        );
        const view = items.map(toViewAction);
        setAllActions(view);
        setRecentActions(view.slice(0, 3));
    };

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError(null);
                await Promise.all([loadUsers(), loadReports()]);
                try {
                    await loadActionsFromServer();
                } catch {
                    await loadActionsFallbackLocal();
                }
            } catch (e) {
                setError(e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    /* 파생값 */
    // 사용자 목록
    const filteredUsers = useMemo(() => {
        const q = query.trim().toLowerCase();
        return users.filter(
            (u) =>
                (!q || [u.id, u.name, u.email].some((v) => String(v ?? "").toLowerCase().includes(q))) &&
                (statusFilter === "전체" || u.status === statusFilter)
        );
    }, [users, query, statusFilter]);
    const userPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
    const pagedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

    // 신고 목록
    const filteredReports = useMemo(
        () => reports.filter((r) => reportState === "모든 상태" || r.status === reportState),
        [reports, reportState]
    );
    const reportPages = Math.max(1, Math.ceil(filteredReports.length / reportPageSize));
    const reportView = filteredReports.slice(
        (reportPage - 1) * reportPageSize,
        reportPage * reportPageSize
    );

    const { activitySeries, xLabels } = useMemo(() => {
        const periodDays = period === "최근 7일" ? 7 : period === "최근 90일" ? 90 : 30;
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - (periodDays - 1));

        const days = [];
        for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
            days.push(d.toISOString().slice(0, 10));
        }

        // 특정 리스트에서 dateKey 추출하여 일자별 카운트
        const countByDay = (list, picker) => {
            const base = Object.fromEntries(days.map((k) => [k, 0]));
            list.forEach((item) => {
                const key = picker(item);
                if (key && base[key] != null) base[key]++;
            });
            return days.map((k) => base[k]);
        };

        const joinPerDay = countByDay(users, (u) => (u.joined && /^\d{4}-\d{2}-\d{2}$/.test(u.joined) ? u.joined : null));
        const reportPerDay = countByDay(reports, (r) => (r.date && /^\d{4}-\d{2}-\d{2}$/.test(r.date) ? r.date : null));
        const actionPerDay = countByDay(
            allActions,
            (a) => (a.date && a.action !== "처분 없음" && /^\d{4}-\d{2}-\d{2}$/.test(a.date) ? a.date : null)
        );

        const sampleTo = (arr, maxPts = 60) => {
            if (arr.length <= maxPts) return arr;
            const step = arr.length / maxPts;
            const out = [];
            for (let i = 0; i < arr.length; i += step) out.push(Math.round(arr[Math.floor(i)]));
            return out;
        };
        const sampledJoin = sampleTo(joinPerDay);
        const sampledReport = sampleTo(reportPerDay);
        const sampledAction = sampleTo(actionPerDay);

        const sampleLabels = (arr, maxPts = 60) => {
            if (arr.length <= maxPts) return arr;
            const step = arr.length / maxPts;
            const out = [];
            for (let i = 0; i < arr.length; i += step) out.push(arr[Math.floor(i)]);
            return out;
        };

        const labels = sampleLabels(days);

        return {
            activitySeries: [
                { name: "신규 가입", color: "#ef5350", data: sampledJoin },
                { name: "신고 접수", color: "#42a5f5", data: sampledReport },
                { name: "처분 진행", color: "#66bb6a", data: sampledAction },
            ],
            xLabels: labels,
        };
    }, [users, reports, allActions, period]);

    /* 사용자 수정/삭제 */
    const openEdit = async (id) => {
        if (!id) return alert("수정할 사용자 ID가 없어요.");
        setEditOpen(true);
        setEditLoading(true);
        try {
            const { data } = await axios.get(`/api/adminUser/${id}`);
            setEditData(toViewUser(data));
        } catch {
            alert("사용자 상세 조회 중 오류가 발생했습니다.");
            setEditOpen(false);
        } finally {
            setEditLoading(false);
        }
    };
    const saveEdit = async () => {
        if (!editData?.id) return alert("사용자 ID가 없어 저장 불가");
        setSaving(true);
        const payload = {
            username: editData.name,
            address: editData.address,
            phoneNumber: editData.phone,
            status: mapStatusToServer(editData.status),
        };
        const prev = users;
        setUsers(prev.map((u) => (u.id === editData.id ? { ...u, ...editData } : u)));
        try {
            await axios.post(`/api/adminUser/${editData.id}`, payload, {
                headers: { "Content-Type": "application/json" },
            });
            await loadUsers();
            setEditOpen(false);
        } catch {
            alert("저장 실패: 되돌립니다.");
            setUsers(prev);
        } finally {
            setSaving(false);
        }
    };
    const handleDelete = async (user) => {
        if (!window.confirm(`${user.name || user.email} 사용자를 삭제할까요?`)) return;
        setDeletingId(user.id);
        const prev = users;
        setUsers(prev.filter((u) => u.id !== user.id));
        try {
            const res = await axios.delete(`/api/adminUser/${user.id}`);
            if (res.status !== 200 || Number(res.data) !== 1) throw new Error();
        } catch {
            alert("서버 삭제 실패: 되돌립니다.");
            setUsers(prev);
        } finally {
            setDeletingId(null);
        }
    };

    /* 신고 모달 */
    const openReport = (r) => {
        setReportData({ ...r, action: r.decision || "NONE", memo: r.memo || "" });
        setReportOpen(true);
    };
    const saveReport = async () => {
        if (!reportData?.id) return;
        setReportSaving(true);
        try {
            await axios.post(
                `/api/reports/ur/${reportData.id}`,
                {
                    status: mapReportStatusToServer(reportData.status),
                    decision: reportData.action || "NONE",
                    memo: reportData.memo ?? "",
                    excerpt: reportData.reason ?? "",
                },
                { headers: { "Content-Type": "application/json" } }
            );
            await loadActionsFromServer();
            await loadReports();
            setReportOpen(false);
        } catch {
            alert("신고 저장 실패");
        } finally {
            setReportSaving(false);
        }
    };

    /* 액션 탭 필터 */
    const actionFiltered = useMemo(() => {
        if (actionTab === "전체") return allActions;
        return allActions.filter((a) => a.status === actionTab);
    }, [allActions, actionTab]);

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <h2 className="admin-logo">
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

            <div className="admin-wrap">
                <div className="admin-head">
                    <div><h2>사용자 관리</h2></div>
                </div>

                {/* 사용자 목록 & 활동 */}
                <div className="admin-grid">
                    <section className="admin-panel">
                        <div className="admin-panel-head">
                            <h3>사용자 목록</h3>
                            <div className="admin-actions">
                                <input className="admin-input" placeholder="사용자 검색…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1);}}/>
                                <select className="admin-select" value={statusFilter} onChange={(e) => {setStatusFilter(e.target.value); setPage(1);}}>
                                    <option>전체</option>
                                    <option>활성</option>
                                    <option>수정 필요</option>
                                    <option>비활성</option>
                                    <option>정지</option>
                                </select>
                            </div>
                        </div>

                        {loading && <div className="admin-empty">불러오는 중…</div>}
                        {error && !loading && <div className="admin-empty danger">오류가 발생했습니다. 다시 시도해 주세요.</div>}

                        <table className="admin-table">
                            <thead>
                                <tr><th>이메일</th><th>이름</th><th>가입일</th><th>상태</th><th>작업</th></tr>
                            </thead>
                            <tbody>
                                {pagedUsers.map((u) => (
                                    <tr key={u.id}>
                                        <td>{u.email}</td>
                                        <td>{u.name}</td>
                                        <td>{u.joined}</td>
                                        <td><StatusPill status={u.status} /></td>
                                        <td className="admin-ops">
                                            <button onClick={() => openEdit(u.id)} className="admin-link">수정</button>
                                            <button onClick={() => handleDelete(u)} className="admin-link danger" disabled={deletingId === u.id}>{deletingId === u.id ? "삭제 중…" : "삭제"}</button>
                                        </td>
                                    </tr>
                                ))}
                                {pagedUsers.length === 0 && !loading && (<tr><td colSpan={5} className="admin-empty">검색 결과가 없습니다.</td></tr>)}
                            </tbody>
                        </table>
                        <div className="admin-foot right"><Pager page={page} total={userPages} onPage={setPage} /></div>
                    </section>

                    {/* 사용자 활동 차트 */}
                    <aside className="admin-panel">
                        <div className="admin-panel-head">
                            <h3>사용자 활동</h3>
                            <select className="admin-select slim" value={period} onChange={(e) => setPeriod(e.target.value)}>
                                <option>최근 7일</option>
                                <option>최근 30일</option>
                                <option>최근 90일</option>
                            </select>
                        </div>

                        <LineChart series={activitySeries} xLabels={xLabels} height={220} />

                        <div className="admin-legend">
                            <span className="legend-item"><span className="admin-dot red" /> 신규 가입</span>
                            <span className="legend-item"><span className="admin-dot blue" /> 신고 접수</span>
                            <span className="legend-item"><span className="admin-dot green" /> 처분 진행</span>
                        </div>
                    </aside>
                </div>

                {/* 사용자 신고 */}
                <div className="admin-grid">
                    <section className="admin-panel">
                        <div className="admin-panel-head">
                            <h3>사용자 신고</h3>
                            <div className="admin-actions">
                                <select className="admin-select" value={reportState} onChange={(e) => { setReportState(e.target.value); setReportPage(1);}}>
                                    <option>모든 상태</option>
                                    <option>대기</option>
                                    <option>처리중</option>
                                    <option>완료</option>
                                    <option>반려</option>
                                </select>
                            </div>
                        </div>

                        <table className="admin-table">
                            <thead><tr><th>신고 ID</th><th>신고자(ID)</th><th>사유</th><th>상태</th><th>작업</th></tr></thead>
                            <tbody>
                                {reportView.map((r) => (
                                    <tr key={r.id}>
                                        <td>{r.id}</td>
                                        <td>{r.reporterId ?? "-"}</td>
                                        <td>{stripSanction(r.reason)}</td>
                                        <td><StatusPill status={reportStatusToPill(r.status)} /></td>
                                        <td className="admin-ops"><button className="admin-link" onClick={() => openReport(r)}>내용</button></td>
                                    </tr>
                                ))}
                                {reportView.length === 0 && (<tr><td colSpan={5} className="admin-empty">신고 데이터가 없습니다.</td></tr>)}
                            </tbody>
                        </table>
                        <div className="admin-foot right"><Pager page={reportPage} total={reportPages} onPage={setReportPage} /></div>
                    </section>

                    {/* 최근 처리 이력 */}
                    <aside className="admin-sidecol">
                        <section className="admin-panel">
                            <div className="admin-panel-head">
                                <h3>최근 처리 이력</h3>
                                <button className="admin-view"
                                    onClick={async () => {
                                        try { await loadActionsFromServer(); } 
                                        catch { await loadActionsFallbackLocal(); }
                                        setActionModalOpen(true); }} > 모두 보기 </button>
                            </div>
                            <ul className="admin-feed">
                                {recentActions.length > 0 ? (
                                    recentActions.map((a) => (
                                        <li key={a.id}>
                                            <div>
                                                <div className="admin-feed-head"><strong>신고자 ID:{a.userId}</strong></div>
                                                <p> 신고 #{a.reportId} · <ActionBadge action={a.action} /> <StatusPill status={reportStatusToPill(a.status)} /> {a.memo ? <> · {a.memo}</> : null}</p>
                                            </div>
                                        </li> )) ) : ( <li className="admin-empty">처리 이력이 없습니다.</li> )}
                            </ul>
                        </section>
                    </aside>
                </div>
            </div>

            {/* 신고 내용/처리 모달 */}
            {reportOpen && (
                <div className="admin-modal-backdrop" onClick={() => !reportSaving && setReportOpen(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-head">
                            <h3>신고 상세</h3>
                            <button className="admin-close" onClick={() => !reportSaving && setReportOpen(false)} disabled={reportSaving}>×</button>
                        </div>
                        <div className="admin-modal-body">
                            {reportData && (
                                <div className="admin-form-grid">
                                    <label>신고 ID<input value={reportData.id} disabled /></label>
                                    <label>신고자(ID)<input value={reportData.reporterId ?? "-"} disabled /></label>
                                    <label>접수일<input value={reportData.date} disabled /></label>

                                    <label style={{ gridColumn: "1 / -1" }}>사유<textarea value={reportData.reason} readOnly rows={4} /></label>
                                    <label>상태
                                        <select value={reportData.status} onChange={(e) => setReportData((d) => ({ ...d, status: e.target.value }))}>
                                            <option>대기</option><option>처리중</option><option>완료</option><option>반려</option>
                                        </select>
                                    </label>
                                    <label>처분
                                        <select value={reportData.action} onChange={(e) => setReportData((d) => ({ ...d, action: e.target.value }))}>
                                            {SANCTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                                        </select>
                                    </label>
                                    <label style={{ gridColumn: "1 / -1" }}>메모<textarea placeholder="처리 사유/비고를 적어주세요." value={reportData.memo} onChange={(e) => setReportData((d) => ({ ...d, memo: e.target.value }))} rows={3}/></label>
                                </div>
                            )}
                        </div>
                        <div className="admin-modal-foot">
                            <button className="admin-btn admin-ghost" onClick={() => !reportSaving && setReportOpen(false)} disabled={reportSaving}>닫기</button>
                            <button className="admin-btn admin-primary" onClick={saveReport} disabled={reportSaving || !reportData}>{reportSaving ? "저장 중…" : "저장"}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 처리 이력 전체 모달 */}
            {actionModalOpen && (
                <div className="admin-modal-backdrop" onClick={() => setActionModalOpen(false)}>
                    <div className="admin-modal large" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-head">
                            <h3>처리 이력</h3>
                            <button className="admin-close" onClick={() => setActionModalOpen(false)}>×</button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-tabs">
                                {["전체", "대기", "처리중", "반려", "완료"].map((t) => (
                                    <button key={t} className={`admin-tab ${actionTab === t ? "on" : ""}`} onClick={() => setActionTab(t)}>{t}</button>))}
                            </div>
                            <table className="admin-table">
                                <thead><tr><th>날짜</th><th>사용자(ID)</th><th>처분</th><th>상태</th><th>리포트</th></tr></thead>
                                <tbody>
                                    {actionFiltered.map((a) => (
                                        <tr key={a.id}>
                                            <td>{a.date}</td>
                                            <td>{a.userId != null ? `ID:${a.userId}` : "-"}</td>
                                            <td><ActionBadge action={a.action} /></td>
                                            <td><StatusPill status={reportStatusToPill(a.status)} /></td>
                                            <td>#{a.reportId}</td>
                                        </tr>
                                    ))}
                                    {actionFiltered.length === 0 && (<tr><td colSpan={5} className="admin-empty">표시할 이력이 없습니다.</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                        <div className="admin-modal-foot">
                            <button className="admin-btn admin-primary" onClick={() => setActionModalOpen(false)}>닫기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
