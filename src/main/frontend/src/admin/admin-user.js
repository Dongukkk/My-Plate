import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./admin-user.css";

axios.defaults.baseURL = "http://localhost:8080";

/** 상태 ↔ 라벨 매핑 */
const mapStatusFromServer = (s) => {
    switch ((s || "").toUpperCase()) {
        case "ACTIVE": return "활성";
        case "SUSPENDED": return "정지";
        case "DELETED": return "비활성";
        case "PENDING": return "수정 필요";
        default: return "수정 필요";
    }
};
const mapStatusToServer = (label) => {
    switch (label) {
        case "활성": return "ACTIVE";
        case "정지": return "SUSPENDED";
        case "비활성": return "DELETED";
        case "수정 필요": return "PENDING";
        default: return "PENDING";
    }
};

/* 안전한 날짜 문자열 변환 */
const toDateStr = (v) => {
    if (v == null) return "-";
    const s = String(v);
    return s.length >= 10 ? s.slice(0, 10) : s;
};

/* 서버 DTO → 화면 모델 */
const toViewUser = (u) => {
    const statusCode = (u.status || "").toUpperCase();
    return {
        id: u.id,
        email: u.email,
        name: u.username ?? u.name ?? "",
        address: u.address ?? "",
        phone: u.phoneNumber ?? "",
        role: (u.role || "").toUpperCase().trim(), // ADM 필터용
        statusCode,
        status: mapStatusFromServer(statusCode),
        joined: toDateStr(u.createdAt ?? u.joined),
    };
};

/* 상태 뱃지 */
const StatusPill = ({ status = "비활성" }) => {
    const map = { 활성: "ok", "수정 필요": "warn", 비활성: "off", 정지: "ban" };
    return <span className={`admin-status ${map[status] || "off"}`}>{status}</span>;
};

/* 페이저 */
const Pager = ({ page, total, onPage }) => {
    const max = Math.max(1, Math.ceil(total || 1));
    const start = Math.max(1, Math.min(page - 2, Math.max(1, max - 4)));
    const pages = Array.from({ length: Math.min(5, max) }, (_, i) => start + i);
    return (
        <div className="admin-pager">
            <button disabled={page <= 1} onClick={() => onPage(page - 1)}>이전</button>
            {pages.map((p) => (<button key={p} className={p === page ? "on" : ""} onClick={() => onPage(p)}>{p}</button>))}
            <button disabled={page >= max} onClick={() => onPage(page + 1)}>다음</button>
        </div>
    );
};

/* 간단 라인차트 */
const LineChart = ({ series, height = 160 }) => {
    const width = 380;
    const padding = 16;
    const lens = series.map(s => s.data.length);
    const maxLen = Math.max(...lens, 1);
    const flat = series.flatMap(s => s.data);
    const min = flat.length ? Math.min(...flat) : 0;
    const maxV = flat.length ? Math.max(...flat) : 1;
    const x = (i) => padding + (i * (width - padding * 2)) / Math.max(1, maxLen - 1);
    const y = (v) => maxV === min ? (height / 2) : (height - padding - ((v - min) * (height - padding * 2)) / (maxV - min));
    return (
        <svg className="admin-linechart" viewBox={`0 0 ${width} ${height}`} aria-hidden>
            <rect x="0" y="0" width={width} height={height} fill="#fff" rx="10" />
            <g opacity="0.2">
                {[0, 1, 2, 3].map((i) => (
                    <line key={i} x1={padding} x2={width - padding} y1={padding + i * ((height - padding * 2) / 3)} y2={padding + i * ((height - padding * 2) / 3)} />
                ))}
            </g>
            {series.map((s, idx) => {
                const d = s.data.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(v)}`).join(" ");
                return <path key={idx} d={d} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />;
            })}
        </svg>
    );
};

export default function AdminUser() {
    const navigate = useNavigate();

    // 카드(임시 값)
    const [cards] = useState({
        total: 12458, active: 8723, newJoin: 342, pendingReports: 28,
        diffs: { total: 5.2, active: -3.7, newJoin: 12.4, pendingReports: 8.3 }
    });

    // 목록/검색/필터/페이지
    const [users, setUsers] = useState([]);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("전체");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // 로딩/에러
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 편집 모달
    const [editOpen, setEditOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // 삭제 진행중 표시
    const [deletingId, setDeletingId] = useState(null);

    // 차트 기간
    const [period, setPeriod] = useState("최근 30일");

    // 신고/피드백
    const [reports, setReports] = useState([]);
    const [reportType, setReportType] = useState("모든 유형");
    const [reportState, setReportState] = useState("모든 상태");
    const [reportPage, setReportPage] = useState(1);
    const reportPageSize = 10;
    const [feedback, setFeedback] = useState([]);

    // 공용 재조회
    const reloadList = async () => {
        try {
            const res = await axios.get("/api/adminUser");
            const items = Array.isArray(res.data) ? res.data : (res.data?.items || []);
            setUsers(items.map(toViewUser).filter(u => u.role !== "ADM"));
        } catch (e) {
            console.error("사용자 목록 재조회 실패:", e);
        }
    };

    // 초기 로드
    useEffect(() => {
        const ac = new AbortController();
        (async () => {
            setLoading(true); setError(null);
            try {
                const res = await axios.get("/api/adminUser", { signal: ac.signal });
                const items = Array.isArray(res.data) ? res.data : (res.data?.items || []);
                const mapped = items.map(toViewUser).filter(u => u.role !== "ADM"); // ADM 숨김(프론트 안전망)
                setUsers(mapped);

                // (추가 API 준비 시)
                // const rep = await axios.get("/api/admin/reports", { signal: ac.signal, params: { page: reportPage, size: reportPageSize, type: reportType, state: reportState }});
                // setReports(rep.data.items || []);
                // const fb = await axios.get("/api/admin/feedback", { signal: ac.signal, params: { page: 1, size: 5 }});
                // setFeedback(fb.data.items || []);
            } catch (e) {
                if (!axios.isCancel(e)) setError(e);
            } finally {
                setLoading(false);
            }
        })();
        return () => ac.abort();
    }, []);

    // 검색/필터/페이지
    const filteredUsers = useMemo(() => {
        const q = query.trim().toLowerCase();
        return users.filter(u => {
            const matchQ = !q || [u.id, u.name, u.email].some(v => (String(v) || "").toLowerCase().includes(q));
            const matchS = statusFilter === "전체" || u.status === statusFilter;
            return matchQ && matchS;
        });
    }, [users, query, statusFilter]);
    const userPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
    const pagedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

    /* 활동 차트 시리즈 */
    const activitySeries = useMemo(() => {
        const periodDays = period === "최근 7일" ? 7 : period === "최근 90일" ? 90 : 30;
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - (periodDays - 1));
        const dayKeys = [];
        for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) { dayKeys.push(d.toISOString().slice(0, 10)); }
        const joinedDates = users
            .map(u => u.joined && u.joined !== "-" ? u.joined : null)
            .filter(Boolean)
            .filter(s => /^\d{4}-\d{2}-\d{2}$/.test(s));
        const newByDay = Object.fromEntries(dayKeys.map(k => [k, 0]));
        joinedDates.forEach(j => { if (newByDay[j] != null) newByDay[j] += 1; });
        const activeByDay = {};
        let cumulative = 0;
        dayKeys.forEach(k => {
            cumulative += newByDay[k] || 0;
            const activeRatio = users.length ? (users.filter(u => u.status === "활성").length / users.length) : 0.5;
            activeByDay[k] = Math.round(cumulative * activeRatio);
        });
        const reviewByDay = {};
        dayKeys.forEach(k => { reviewByDay[k] = Math.round((newByDay[k] || 0) * 0.6); });
        const compress = (arr) => {
            const points = 10;
            if (arr.length <= points) return arr;
            const size = Math.ceil(arr.length / points);
            const out = [];
            for (let i = 0; i < arr.length; i += size) {
                out.push(arr.slice(i, i + size).reduce((a, b) => a + b, 0));
            }
            return out;
        };
        const newArr = compress(dayKeys.map(k => newByDay[k]));
        const activeArr = compress(dayKeys.map(k => activeByDay[k]));
        const reviewArr = compress(dayKeys.map(k => reviewByDay[k]));
        const allZero = [...newArr, ...activeArr, ...reviewArr].every(v => v === 0);
        const safe = (arr, base = 1) => allZero ? arr.map((_, i) => base + (i % 3)) : arr;
        return [
            { name: "신규 가입", color: "#ef5350", data: safe(newArr, 1) },
            { name: "활성 사용자", color: "#42a5f5", data: safe(activeArr, 3) },
            { name: "리뷰 작성", color: "#66bb6a", data: safe(reviewArr, 1) },
        ];
    }, [users, period]);

    /* 수정 모달 열기: 단건 조회로 최신값 로드 */
    const openEdit = async (rowOrId) => {
        const id = typeof rowOrId === "object" ? rowOrId?.id : rowOrId;
        if (!id) { alert("수정할 사용자 ID를 찾지 못했어요."); return; }

        setEditOpen(true);
        setEditLoading(true);
        try {
            const { data } = await axios.get(`/api/adminUser/${id}`);
            const view = toViewUser(data);
            setEditData(view);
        } catch (e) {
            console.error(e);
            alert("사용자 상세 조회 중 오류가 발생했습니다.");
            setEditOpen(false);
        } finally {
            setEditLoading(false);
        }
    };

    const saveEdit = async () => {
        if (!editData?.id) {
            alert("사용자 ID가 없어 저장할 수 없습니다.");
            return;
        }
        const payload = {
            username: editData.name,
            address: editData.address,
            phoneNumber: editData.phone,
            status: mapStatusToServer(editData.status),
        };
        setSaving(true);
        const prev = users;
        setUsers(prev => prev.map(u => u.id === editData.id ? { ...u, ...editData } : u));
        try {
            await axios.post(`/api/adminUser/${editData.id}`, payload, { headers: { "Content-Type": "application/json" }});
            await reloadList();
            setEditOpen(false);
        } catch (e) {
            console.error(e);
            alert("저장 실패: 화면 상태를 되돌립니다.");
            setUsers(prev);
        } finally {
            setSaving(false);
        }
    };

    /* 삭제 */
    const handleDelete = async (user) => {
        if (!window.confirm(`${user.name || user.email} 사용자를 삭제할까요?`)) return;
        setDeletingId(user.id);
        const prev = users;
        setUsers(prev.filter(u => u.id !== user.id));
        try {
            const res = await axios.delete(`/api/adminUser/${user.id}`);
            if (res.status !== 200 || Number(res.data) !== 1) {
                throw new Error(`삭제 실패(결과: ${res.data})`);
            }
        } catch (e) {
            console.error(e);
            alert("서버 삭제 실패: 화면 상태를 되돌립니다.");
            setUsers(prev); // 롤백
        } finally {
            setDeletingId(null);
        }
    };

    /* 신고/피드백 */
    const filteredReports = useMemo(() => {
        const typePass = (r) => reportType === "모든 유형" || r.type === reportType;
        const statePass = (r) => reportState === "모든 상태" || r.status === reportState;
        return reports.filter(r => typePass(r) && statePass(r));
    }, [reports, reportType, reportState]);
    const reportPages = Math.max(1, Math.ceil(filteredReports.length / reportPageSize));
    const reportView = filteredReports.slice((reportPage - 1) * reportPageSize, reportPage * reportPageSize);

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <h2 className="admin-logo">
                    <img src={"https://i.imgur.com/tiY7WKl.png"} alt="My Plate Logo" className="admin-logo-img" />
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
                <div className="admin-head"><div><h2>사용자 관리</h2></div></div>

                {/* 요약 카드 */}
                <div className="admin-cards">
                    <div className="admin-card">
                        <div className="admin-card-title">총 사용자</div>
                        <div className="admin-card-value">{cards.total.toLocaleString()}</div>
                        <div className="admin-card-diff up">지난 주 대비 +{cards.diffs.total}%</div>
                    </div>
                    <div className="admin-card">
                        <div className="admin-card-title">활성 사용자</div>
                        <div className="admin-card-value">{cards.active.toLocaleString()}</div>
                        <div className={`admin-card-diff ${cards.diffs.active >= 0 ? "up" : "down"}`}>
                            지난 주 대비 {cards.diffs.active >= 0 ? "+" : ""}{cards.diffs.active}%
                        </div>
                    </div>
                    <div className="admin-card">
                        <div className="admin-card-title">신규 가입</div>
                        <div className="admin-card-value">{cards.newJoin.toLocaleString()}</div>
                        <div className="admin-card-diff up">지난 주 대비 +{cards.diffs.newJoin}%</div>
                    </div>
                    <div className="admin-card">
                        <div className="admin-card-title">미확인 신고</div>
                        <div className="admin-card-value">{cards.pendingReports}</div>
                        <div className="admin-card-diff down">지난 주 대비 +{cards.diffs.pendingReports}%</div>
                    </div>
                </div>

                {/* 목록 & 활동 */}
                <div className="admin-grid">
                    <section className="admin-panel">
                        <div className="admin-panel-head">
                            <h3>사용자 목록</h3>
                            <div className="admin-actions">
                                <input
                                    className="admin-input"
                                    placeholder="사용자 검색…"
                                    value={query}
                                    onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                                />
                                <select
                                    className="admin-select"
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                >
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
                                <tr>
                                    <th>이메일</th>
                                    <th>이름</th>
                                    <th>가입일</th>
                                    <th>상태</th>
                                    <th>작업</th>
                                </tr>
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
                                            <button
                                                onClick={() => handleDelete(u)}
                                                className="admin-link danger"
                                                disabled={deletingId === u.id}
                                            >
                                                {deletingId === u.id ? "삭제 중…" : "삭제"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {pagedUsers.length === 0 && !loading && (
                                    <tr><td colSpan={7} className="admin-empty">검색 결과가 없습니다.</td></tr>
                                )}
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
                        <LineChart series={activitySeries} />
                        <div className="admin-legend">
                            <br />
                            <span className="admin-dot red" /> 신규 가입
                            <span className="admin-dot blue" /> 활성 사용자
                            <span className="admin-dot green" /> 리뷰 작성
                        </div>
                    </aside>
                </div>

                {/* 신고/피드백 & 사이드 피드백 */}
                <div className="admin-grid">
                    <section className="admin-panel">
                        <div className="admin-panel-head">
                            <h3>사용자 신고 및 피드백</h3>
                            <div className="admin-actions">
                                <select className="admin-select" value={reportType} onChange={(e) => { setReportType(e.target.value); setReportPage(1); }}>
                                    <option>모든 유형</option>
                                    <option>부적절 리뷰</option>
                                    <option>허위 정보</option>
                                    <option>스팸</option>
                                    <option>기타</option>
                                </select>
                                <select className="admin-select" value={reportState} onChange={(e) => { setReportState(e.target.value); setReportPage(1); }}>
                                    <option>모든 상태</option>
                                    <option>대기</option>
                                    <option>처리중</option>
                                    <option>완료</option>
                                </select>
                            </div>
                        </div>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>신고 ID</th>
                                    <th>유형</th>
                                    <th>신고자</th>
                                    <th>대상</th>
                                    <th>날짜</th>
                                    <th>상태</th>
                                    <th>작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportView.map(r => (
                                    <tr key={r.id}>
                                        <td>{r.id}</td>
                                        <td>{r.type}</td>
                                        <td>{r.reporter}</td>
                                        <td>{r.target}</td>
                                        <td>{r.date}</td>
                                        <td>
                                            <StatusPill status={r.status === "대기" ? "수정 필요" : (r.status === "완료" ? "활성" : "비활성")} />
                                        </td>
                                        <td className="admin-ops">
                                            <button className="admin-link">내용</button>
                                            <button className="admin-link">관리</button>
                                        </td>
                                    </tr>
                                ))}
                                {reportView.length === 0 && (
                                    <tr><td colSpan={7} className="admin-empty">신고 데이터가 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>
                        <div className="admin-foot right">
                            <Pager page={reportPage} total={reportPages} onPage={setReportPage} />
                        </div>
                    </section>

                    {/* 사용자 피드백 리스트 */}
                    <aside className="admin-sidecol">
                        <section className="admin-panel">
                            <div className="admin-panel-head">
                                <h3>사용자 피드백</h3>
                                <button className="admin-view">모두 보기</button>
                            </div>
                            <ul className="admin-feed">
                                {feedback.length > 0 ? feedback.map((f, i) => (
                                    <li key={i}>
                                        <div className="admin-avatar" />
                                        <div>
                                            <div className="admin-feed-head"><strong>{f.name}</strong><span>{f.date}</span></div>
                                            <p>{f.text}</p>
                                        </div>
                                    </li>
                                )) : (
                                    <li className="admin-empty">피드백 데이터가 없습니다.</li>
                                )}
                            </ul>
                        </section>
                    </aside>
                </div>
            </div>

            {/* 편집 모달 */}
            {editOpen && (
                <div className="admin-modal-backdrop" onClick={() => !saving && setEditOpen(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-head">
                            <h3>사용자 수정</h3>
                            <button className="admin-close" onClick={() => !saving && setEditOpen(false)} disabled={saving}>×</button>
                        </div>

                        <div className="admin-modal-body">
                            {editLoading || !editData ? (
                                <div style={{ padding: 16 }}>불러오는 중…</div>
                            ) : (
                                <div className="admin-form-grid">
                                    <label>이메일<input value={editData.email || ""} disabled /></label>
                                    <label>이름<input value={editData.name || ""} onChange={(e) => setEditData(d => ({ ...d, name: e.target.value }))} /></label>
                                    <label>주소<input value={editData.address || ""} onChange={(e) => setEditData(d => ({ ...d, address: e.target.value }))} /></label>
                                    <label>전화<input value={editData.phone || ""} onChange={(e) => setEditData(d => ({ ...d, phone: e.target.value }))} /></label>
                                    <label>상태
                                        <select value={editData.status} onChange={(e) => setEditData(d => ({ ...d, status: e.target.value }))}>
                                            <option>활성</option>
                                            <option>수정 필요</option>
                                            <option>비활성</option>
                                            <option>정지</option>
                                        </select>
                                    </label>
                                </div>
                            )}
                        </div>
                        <div className="admin-modal-foot">
                            <button className="admin-btn admin-ghost" onClick={() => !saving && setEditOpen(false)} disabled={saving}>취소</button>
                            <button className="admin-btn admin-primary" onClick={saveEdit} disabled={saving || editLoading || !editData}>
                                {saving ? "저장 중…" : "저장"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
