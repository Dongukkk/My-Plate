import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAlert } from "../ui/alert-center";
import "./admin-restaurant.css";

// axios.defaults.baseURL = "http://localhost:8080";
// axios.defaults.withCredentials = true;

/* UI 소품 */
const StatusPill = ({ status }) => {
    const map = { 활성: "ok", "수정 필요": "warn", 비활성: "off" };
    return <span className={`admin-status-pill ${map[status] || "off"}`}>{status}</span>;
};

const WelfareDot = ({ ok }) => (
    <span className={`admin-welfare-dot ${ok ? "on" : "off"}`} aria-label={ok ? "가능" : "불가"} />
);

const Pagination = ({ page, pages, onChange, windowSize = 5 }) => {
    if (!pages || pages <= 1) return null;
    const current = Math.max(1, Math.min(page, pages));
    const groupIndex = Math.floor((current - 1) / windowSize);
    const start = groupIndex * windowSize + 1;
    const end = Math.min(pages, start + windowSize - 1);
    const nums = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    return (
        <div className="admin-pg">
            <button className="admin-pg-item admin-ghost" onClick={() => onChange(current - 1)} disabled={current === 1}>이전</button>
            {start > 1 && (<button className="admin-pg-item admin-ghost" onClick={() => onChange(start - 1)} title="이전 구간">…</button>)}
            {nums.map((p) => (
                <button key={p} className={`admin-pg-item ${current === p ? "admin-active" : ""}`} onClick={() => onChange(p)} aria-current={current === p ? "page" : undefined}>
                    {p}
                </button>
            ))}
            {end < pages && (<button className="admin-pg-item admin-ghost" onClick={() => onChange(end + 1)} title="다음 구간">…</button>)}
            <button className="admin-pg-item admin-ghost" onClick={() => onChange(current + 1)} disabled={current === pages}>다음</button>
        </div>
    );
};

const PieChart = ({ data }) => {
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    let acc = 0;
    const stops = data.map((d) => {
        const from = (acc / total) * 360; acc += d.value;
        const to = (acc / total) * 360;
        return `${d.color} ${from}deg ${to}deg`;
    }).join(", ");
    return (
        <div className="admin-pie-wrap">
            <div className="admin-pie" style={{ background: `conic-gradient(${stops})` }} />
            <ul className="admin-legend">
                {data.map((d) => (
                    <li key={d.label}>
                        <span className="admin-legend-dot" style={{ background: d.color }} />
                        {d.label} <em>{d.value}</em>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const StackedBars = ({ items }) => (
    <div className="admin-bars">
        {items.map((row) => {
            const total = row.segments.reduce((s, x) => s + x.value, 0) || 1;
            return (
                <div className="admin-bar-row" key={row.label}>
                    <div className="admin-bar-label">{row.label}</div>
                    <div className="admin-bar-track" role="list">
                        {row.segments.map((s, i) => (
                            <div
                                key={i}
                                role="listitem"
                                className="admin-bar-seg"
                                style={{ width: `${(s.value / total) * 100}%` }}
                                title={`${row.label} · ${s.title} ${s.value}`}
                            />
                        ))}
                    </div>
                </div>
            );
        })}
    </div>
);

/* meters (전체 혼밥레벨 분포) */
const LevelMeters = ({ dist }) => {
    const total = Math.max(1, dist?.total ?? 0);
    const rows = [
        { label: "LV.1", value: dist.lv1 ?? 0 },
        { label: "LV.2", value: dist.lv2 ?? 0 },
        { label: "LV.3", value: dist.lv3 ?? 0 },
    ];
    return (
        <div className="admin-meters">
            {rows.map((r) => {
                const pct = Math.round((r.value / total) * 100);
                return (
                    <div className="admin-meter-row" key={r.label}>
                        <span className="admin-meter-label">{r.label}</span>
                        <div className="admin-meter-track"><div className="admin-meter-fill" style={{ width: `${pct}%` }} /></div>
                        <span className="admin-meter-value">{r.value.toLocaleString()} ({pct}%)</span>
                    </div>
                );
            })}
        </div>
    );
};

/* 유틸 */
const safeNum = (v, d = 0) => (Number.isFinite(+v) ? +v : d);
const statusKo = (s = "") =>
    ({ ACTIVE: "활성", INACTIVE: "비활성", NEEDS_FIX: "수정 필요", DELETED: "비활성" }[String(s).toUpperCase()] || s || "비활성");
const baseCategory = (c) => {
    if (c == null) return "기타";
    const text = String(c).trim();
    if (!text) return "기타";
    const head = text.split(",")[0].trim();
    return head || "기타";
};
const toTimeKey = (x) => (x?.createdAt ? new Date(x.createdAt).getTime() : safeNum(x?.id, 0));

/* 혼밥레벨 계산 규칙 (프론트 계산) */
export function calculateSoloLevel(value) {
    const v = Number(value);
    if (!Number.isFinite(v)) return null;
    if (v >= 0 && v < 0.5) return 1;
    if (v >= 0.5 && v < 1.5) return 2;
    if (v >= 1.5 && v < 2.0) return 3;
    return null;
}

/* 레벨 → UI 버킷 매핑 (리턴 3이 LV.1) */
const levelToBucket = (lvl) => {
    if (lvl === 3) return "lv1"; // LV.1
    if (lvl === 2) return "lv2"; // LV.2
    if (lvl === 1) return "lv3"; // LV.3
    return null;
};

export default function AdminRestaurant() {
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();

    // 전역 confirm(모달) → 미지원 시 window.confirm 폴백
    const confirmOrNative = async (message, opts = {}) => {
        try {
            if (typeof confirm === "function") {
                return await confirm({
                    title: opts.title ?? "확인",
                    message,
                    okText: opts.okText ?? "확인",
                    cancelText: opts.cancelText ?? "취소",
                    tone: opts.tone ?? "default",
                });
            }
        } catch { }
        return window.confirm(message);
    };

    /* 삭제 */
    const [deletingId, setDeletingId] = useState(null);
    const onDelete = async (row) => {
        const ok = await confirmOrNative(`${row.name}을(를) 삭제하시겠습니까?`, {
            title: "삭제 확인",
            okText: "삭제",
            cancelText: "취소",
            tone: "danger",
        });
        if (!ok) return;

        try {
            setDeletingId(row.id);
            await axios.delete(`/api/adminRestaurant/${row.id}`);
            setRows((prev) => prev.filter((x) => x.id !== row.id));
            alert("삭제되었습니다.", { autoCloseMs: 1500 });
        } catch (e) {
            console.error(e);
            alert(`삭제 실패${e?.response?.status ? ` (HTTP ${e.response.status})` : ""}`);
        } finally {
            setDeletingId(null);
        }
    };

    /* 편집 모달 */
    const [editOpen, setEditOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const buildUpdatePayload = (d) => ({
        name: d.name?.trim() ?? "",
        category: d.category ?? "",
        address: d.address ?? "",
        phone: d.phone ?? "",
        photoUrl: d.photoUrl ?? "",
        description: d.description ?? "",
        status: d.status ?? "ACTIVE",
    });

    const openEdit = async (id) => {
        try {
            setEditOpen(true);
            setEditLoading(true);
            const { data } = await axios.get(`/api/adminRestaurant/${id}`);
            setEditData(data);
        } catch (e) {
            console.error(e);
            alert("상세 조회 실패");
            setEditOpen(false);
        } finally {
            setEditLoading(false);
        }
    };
    const closeEdit = () => { if (!saving) { setEditOpen(false); setEditData(null); } };
    const saveEdit = async () => {
        if (!editData) return;
        try {
            setSaving(true);
            const payload = buildUpdatePayload(editData);
            await axios.post(`/api/adminRestaurant/${editData.id}`, payload);
            setRows((prev) => prev.map((x) => (x.id === editData.id ? { ...x, ...payload } : x)));
            setEditOpen(false);
            setEditData(null);
            alert("저장되었습니다.", { autoCloseMs: 1500 });
        } catch (e) {
            console.error(e);
            alert(`저장 실패${e?.response?.status ? ` (HTTP ${e.response.status})` : ""}`);
        } finally {
            setSaving(false);
        }
    };

    /* 추가 모달 */
    const [createOpen, setCreateOpen] = useState(false);
    const [createData, setCreateData] = useState({
        name: "", category: "", address: "", phone: "", photoUrl: "", description: "", status: "ACTIVE",
    });
    const [creating, setCreating] = useState(false);

    const reloadList = async () => {
        try {
            const res = await axios.get("/api/adminRestaurant");
            setRows(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error("목록 재조회 실패:", e);
        }
    };

    const openCreate = () => {
        setCreateData({ name: "", category: "", address: "", phone: "", photoUrl: "", description: "", status: "ACTIVE" });
        setCreateOpen(true);
    };
    const closeCreate = () => { if (!creating) setCreateOpen(false); };

    const saveCreate = async () => {
        if (!createData.name?.trim() || !createData.category?.trim() || !createData.address?.trim()) {
            alert("이름, 카테고리, 주소는 필수입니다."); return;
        }
        try {
            setCreating(true);
            const payload = { ...createData, phone: (createData.phone || "").trim() || "미등록" };
            await axios.post("/api/adminRestaurant", payload);
            await reloadList();
            setCreateOpen(false);
            alert("등록되었습니다.", { autoCloseMs: 1500 });
        } catch (e) {
            console.error(e);
            alert(`등록 실패${e?.response?.status ? ` (HTTP ${e.response.status})` : ""}`);
            await reloadList();
        } finally {
            setCreating(false);
        }
    };

    /* 검색/정렬/페이지 */
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("ALL");
    const [sort, setSort] = useState("latest");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    /* 목록 */
    const [rows, setRows] = useState([]);
    const categories = useMemo(() =>
        ["ALL", "한식", "일식, 라멘", "카페, 브런치", "양식", "중식", "분식", "퓨전, 현대식"], []);

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get("/api/adminRestaurant");
                setRows(Array.isArray(res.data) ? res.data : []);
            } catch (e) {
                console.error("식당 목록 조회 실패:", e);
                setRows([]);
            }
        })();
    }, []);

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();
        return rows.filter((r) => {
            const passQ =
                !term ||
                r.name?.toLowerCase().includes(term) ||
                r.address?.toLowerCase().includes(term) ||
                r.category?.toLowerCase().includes(term);
            const passCat = category === "ALL" || r.category?.startsWith?.(category);
            return passQ && passCat;
        });
    }, [query, category, rows]);

    const sorted = useMemo(() => {
        const arr = [...filtered];
        const toKey = (x) => toTimeKey(x);
        switch (sort) {
            case "ratingDesc":
                arr.sort((a, b) => (safeNum(b.avgRating ?? b.avg_rating) - safeNum(a.avgRating ?? a.avg_rating))); break;
            case "busyDesc":
                arr.sort((a, b) => (safeNum(b.soloIndex ?? b.solo_index) - safeNum(a.soloIndex ?? a.solo_index))); break;
            case "nameAsc":
                arr.sort((a, b) => (a.name || "").localeCompare(b.name || "")); break;
            default:
                arr.sort((a, b) => toKey(b) - toKey(a));
        }
        return arr;
    }, [filtered, sort]);

    const totalForPaging = sorted.length;
    const pages = Math.max(1, Math.ceil(totalForPaging / pageSize));
    const view = sorted.slice((page - 1) * pageSize, page * pageSize);
    useEffect(() => setPage(1), [query, category, sort]);

    /*  차트 데이터  */
    // 파이: 카테고리 분포
    const pieData = useMemo(() => {
        if (!rows.length) return [];
        const counts = {};
        rows.forEach((r) => {
            const cat = baseCategory(r.category);
            counts[cat] = (counts[cat] || 0) + 1;
        });
        const palette = {
            "한식": "#e74c3c", "카페, 브런치": "#f39c12", "카페/브런치": "#f39c12",
            "일식": "#2ecc71", "일식, 라멘": "#2ecc71", "양식": "#3498db",
            "중식": "#9b59b6", "분식": "#16a085", "퓨전, 현대식": "#8e44ad", "기타": "#95a5a6",
        };
        const others = ["#34495e", "#27ae60", "#d35400", "#7f8c8d"];
        let oi = 0;
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([label, value]) => ({
                label, value, color: palette[label] || others[oi++ % others.length],
            }));
    }, [rows]);

    // 전체 혼밥지수 분포(프론트 계산)
    const soloDist = useMemo(() => {
        const acc = { lv1: 0, lv2: 0, lv3: 0, total: 0 };
        rows.forEach((r) => {
            const raw = r.soloIndex ?? r.solo_index;
            const lvl = calculateSoloLevel(raw);
            const bucket = levelToBucket(lvl);
            if (bucket) { acc[bucket]++; acc.total++; }
        });
        return acc;
    }, [rows]);

    const handleSearch = () => setPage(1);

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <h2 className="admin-logo" onClick={() => navigate(`/adminMain`)}>
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

            <main className="admin-rest-page">
                <div className="admin-top">
                    <div><h2 className="admin-title">식당 관리</h2></div>
                    <div className="admin-actions-bar">
                        <button className="admin-btn admin-ghost" onClick={() => navigate("/adminMain")}>메인으로 돌아가기</button>
                        <button className="admin-btn admin-primary" onClick={openCreate}>새로운 식당 추가</button>
                    </div>
                </div>

                <div className="admin-card">
                    <div className="admin-card-head"><h3>식당 목록</h3></div>

                    <div className="admin-controls">
                        <div className="admin-search">
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                placeholder="음식, 식당 또는 메뉴 검색..."
                                aria-label="식당 검색"
                            />
                            <button type="button" className="admin-search-btn" onClick={handleSearch} aria-label="검색" title="검색">검색</button>
                        </div>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="카테고리 필터">
                            {categories.map((c) => (<option key={c} value={c}>{c === "ALL" ? "모든 카테고리" : c}</option>))}
                        </select>
                        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="정렬">
                            <option value="latest">최신순</option>
                            <option value="ratingDesc">평점높은순</option>
                            <option value="busyDesc">혼잡레벨높은순</option>
                            <option value="nameAsc">이름오름차순</option>
                        </select>
                    </div>

                    <div className="admin-table-wrap">
                        <table className="admin-rest-table">
                            <thead>
                                <tr><th>식당 이름</th><th>카테고리</th><th>위치</th><th>혼밥지수</th><th>평점</th><th>복지카드</th><th>상태</th><th>작업</th></tr>
                            </thead>
                            <tbody>
                                {view.map((r) => {
                                    const soloIndex = r.soloIndex ?? r.solo_index;
                                    const lvl = calculateSoloLevel(soloIndex);
                                    const lvlText = (() => {
                                        const b = levelToBucket(lvl);
                                        if (!b) return "-";
                                        return `LV.${b.slice(-1)}`;
                                    })();
                                    const avgRating = r.avgRating ?? r.avg_rating;
                                    const ratingCount = r.ratingCount ?? r.rating_count ?? 0;

                                    return (
                                        <tr key={r.id}>
                                            <td>
                                                <div className="admin-name-col">
                                                    <strong className="admin-link" onClick={() => navigate(`/adminrestaurants/${r.id}`)}>{r.name}</strong>
                                                </div>
                                            </td>
                                            <td>{r.category}</td>
                                            <td className="admin-truncate">{r.address}</td>
                                            <td>
                                                <span className={`admin-busy ${lvl === 3 ? "admin-high" : lvl === 2 ? "admin-mid" : ""}`}>
                                                    {safeNum(soloIndex).toFixed(1)} <span className="admin-muted">/ {lvlText}</span>
                                                </span>
                                            </td>
                                            <td>{safeNum(avgRating).toFixed(1)} <span className="admin-muted">({ratingCount})</span></td>
                                            <td><WelfareDot ok={typeof r.welfare === "boolean" ? r.welfare : Number(r.welfare) === 1} /></td>
                                            <td><StatusPill status={statusKo(r.status)} /></td>
                                            <td className="admin-row-actions">
                                                <button className="admin-mini" onClick={() => openEdit(r.id)}>수정</button>
                                                <button className="admin-mini admin-danger" disabled={deletingId === r.id} onClick={() => onDelete(r)}>
                                                    {deletingId === r.id ? "삭제 중..." : "삭제"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {view.length === 0 && (<tr><td colSpan={8} className="admin-empty">조건에 맞는 레스토랑이 없습니다.</td></tr>)}
                            </tbody>
                        </table>
                    </div>

                    <Pagination page={page} pages={pages} onChange={setPage} />
                </div>

                <div className="admin-charts-grid">
                    <div className="admin-card">
                        <div className="admin-card-head">
                            <h3>식당 혼밥레벨 분포</h3>
                            <div className="admin-muted" style={{ fontSize: 12 }}>총 {soloDist.total?.toLocaleString()}곳</div>
                        </div>
                        <LevelMeters dist={soloDist} />
                    </div>

                    <div className="admin-card">
                        <div className="admin-card-head"><h3>식당 카테고리 분포</h3></div>
                        <PieChart data={pieData} />
                    </div>
                </div>
            </main>

            {/* 편집 모달 */}
            {editOpen && (
                <div className="admin-modal-backdrop" onClick={closeEdit}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-head">
                            <h3>식당 수정</h3>
                            <button className="admin-close" onClick={closeEdit} disabled={saving}>×</button>
                        </div>
                        <div className="admin-modal-body">
                            {editLoading ? (
                                <div style={{ padding: 20 }}>불러오는 중...</div>
                            ) : editData && (
                                <div className="admin-form-grid">
                                    <label>이름<input value={editData.name || ""} onChange={(e) => setEditData(d => ({ ...d, name: e.target.value }))} /></label>
                                    <label>카테고리<input value={editData.category || ""} onChange={(e) => setEditData(d => ({ ...d, category: e.target.value }))} /></label>
                                    <label>주소<input value={editData.address || ""} onChange={(e) => setEditData(d => ({ ...d, address: e.target.value }))} /></label>
                                    <label>전화<input value={editData.phone || ""} onChange={(e) => setEditData(d => ({ ...d, phone: e.target.value }))} /></label>
                                    <label>사진 URL<input value={editData.photoUrl || ""} onChange={(e) => setEditData(d => ({ ...d, photoUrl: e.target.value }))} /></label>
                                    <label>상태
                                        <select value={editData.status || "ACTIVE"} onChange={(e) => setEditData(d => ({ ...d, status: e.target.value }))}>
                                            <option value="ACTIVE">ACTIVE</option>
                                            <option value="INACTIVE">INACTIVE</option>
                                            <option value="NEEDS_FIX">NEEDS_FIX</option>
                                            <option value="DELETED">DELETED</option>
                                        </select>
                                    </label>
                                    <label className="col-span-2">설명<textarea rows={3} value={editData.description || ""} onChange={(e) => setEditData(d => ({ ...d, description: e.target.value }))} /></label>
                                </div>
                            )}
                        </div>
                        <div className="admin-modal-foot">
                            <button className="admin-btn admin-ghost" onClick={closeEdit} disabled={saving}>취소</button>
                            <button className="admin-btn admin-primary" onClick={saveEdit} disabled={saving || editLoading}>{saving ? "저장 중..." : "저장"}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 추가 모달 */}
            {createOpen && (
                <div className="admin-modal-backdrop" onClick={closeCreate}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-head"><h3>새 식당 추가</h3><button className="admin-close" onClick={closeCreate} disabled={creating}>×</button></div>
                        <div className="admin-modal-body">
                            <div className="admin-form-grid">
                                <label>이름*<input value={createData.name} onChange={(e) => setCreateData(d => ({ ...d, name: e.target.value }))} placeholder="예) 김밥천국" /></label>
                                <label>카테고리*<input value={createData.category} onChange={(e) => setCreateData(d => ({ ...d, category: e.target.value }))} placeholder="예) 한식" /></label>
                                <label className="col-span-2">주소*<input value={createData.address} onChange={(e) => setCreateData(d => ({ ...d, address: e.target.value }))} placeholder="예) 서울시 마포구 ..." /></label>
                                <label>전화<input value={createData.phone} onChange={(e) => setCreateData(d => ({ ...d, phone: e.target.value }))} /></label>
                                <label>사진 URL<input value={createData.photoUrl} onChange={(e) => setCreateData(d => ({ ...d, photoUrl: e.target.value }))} placeholder="https://..." /></label>
                                <label className="col-span-2">설명<textarea rows={3} value={createData.description} onChange={(e) => setCreateData(d => ({ ...d, description: e.target.value }))} placeholder="간단한 소개를 적어주세요" /></label>
                                <label>상태
                                    <select value={createData.status} onChange={(e) => setCreateData(d => ({ ...d, status: e.target.value }))}>
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                        <option value="NEEDS_FIX">NEEDS_FIX</option>
                                    </select>
                                </label>
                            </div>
                        </div>
                        <div className="admin-modal-foot">
                            <button className="admin-btn admin-ghost" onClick={closeCreate} disabled={creating}>취소</button>
                            <button className="admin-btn admin-primary" onClick={saveCreate}
                                disabled={creating || !createData.name?.trim() || !createData.category?.trim() || !createData.address?.trim()}
                                title="이름/카테고리/주소는 필수">
                                {creating ? "저장 중..." : "저장"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
