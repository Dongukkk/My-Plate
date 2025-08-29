import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./admin-restaurant.css";

const USE_MOCK = false;
axios.defaults.baseURL = "http://localhost:8080";

/* 상태 뱃지 */
const StatusPill = ({ status }) => {
    const map = { 활성: "ok", "수정 필요": "warn", 비활성: "off" };
    return <span className={`admin-status-pill ${map[status] || "off"}`}>{status}</span>;
};

/* 복지카드 점표시 (현재 DTO에 없음: 임시 false) */
const WelfareDot = ({ ok }) => (
    <span className={`admin-welfare-dot ${ok ? "on" : "off"}`} aria-label={ok ? "가능" : "불가"} />
);

/* 페이지네이션 */
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

            {nums.map((p) => (<button key={p} className={`admin-pg-item ${current === p ? "admin-active" : ""}`} onClick={() => onChange(p)} aria-current={current === p ? "page" : undefined}>{p}</button>))}

            {end < pages && (<button className="admin-pg-item admin-ghost" onClick={() => onChange(end + 1)} title="다음 구간">…</button>)}
            <button className="admin-pg-item admin-ghost" onClick={() => onChange(current + 1)} disabled={current === pages}>다음</button>
        </div>
    );
};


/* 파이차트 */
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

/* 혼잡도 분포 막대 */
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

export default function AdminRestaurant() {
    const navigate = useNavigate();

    const [deletingId, setDeletingId] = useState(null);
    const onDelete = async (row) => {
        if (!window.confirm(`${row.name}을(를) 삭제하시겠습니까?`)) return;
        try {
            setDeletingId(row.id);
            await axios.delete(`/api/adminRestaurant/${row.id}`);
            setRows((prev) => prev.filter((x) => x.id !== row.id));
            alert("삭제되었습니다.");
        } catch (e) {
            console.error(e);
            const code = e?.response?.status;
            alert(`삭제 실패${code ? ` (HTTP ${code})` : ""}`);
        } finally {
            setDeletingId(null);
        }
    };

    // 검색/필터/정렬/페이지
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("ALL");
    const [sort, setSort] = useState("latest");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // 목록/제출 대기
    const [rows, setRows] = useState([]);
    const [pending, setPending] = useState([]);

    // 카테고리 옵션
    const categories = useMemo(
        () => ["ALL", "한식", "일식, 라멘", "카페, 브런치", "양식", "중식", "분식", "퓨전, 현대식"],
        []
    );

    // 서버 연동: 최초 1회만 호출
    useEffect(() => {
        if (USE_MOCK) return;
        const fetchList = async () => {
            try {
                const res = await axios.get("/api/adminRestaurant");
                setRows(Array.isArray(res.data) ? res.data : []);
            } catch (e) {
                console.error("식당 목록 조회 실패:", e);
                setRows([]);
            }
        };
        fetchList();
    }, []);

    // 프론트 단 필터
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

    // 정렬 (클라이언트)
    const sorted = useMemo(() => {
        const arr = [...filtered];
        switch (sort) {
            case "ratingDesc":
                arr.sort((a, b) => (Number(b.avgRating) || 0) - (Number(a.avgRating) || 0));
                break;
            case "busyDesc":
                arr.sort((a, b) => (Number(b.solo_index) || 0) - (Number(a.solo_index) || 0));
                break;
            case "nameAsc":
                arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
                break;
            default:
                arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }
        return arr;
    }, [filtered, sort]);

    // 페이지 계산
    const totalForPaging = sorted.length;
    const pages = Math.max(1, Math.ceil(totalForPaging / pageSize));
    const view = sorted.slice((page - 1) * pageSize, page * pageSize);
    useEffect(() => setPage(1), [query, category, sort]);

    // 차트 샘플 데이터
    const pieData = useMemo(
        () => [
            { label: "한식", value: 12, color: "#e74c3c" },
            { label: "카페/브런치", value: 8, color: "#f39c12" },
            { label: "일식", value: 6, color: "#2ecc71" },
            { label: "양식", value: 5, color: "#3498db" },
            { label: "기타", value: 3, color: "#9b59b6" },
        ],
        []
    );
    const busyItems = useMemo(
        () => [
            { label: "월", segments: [{ value: 20, title: "여유" }, { value: 40, title: "보통" }, { value: 40, title: "혼잡" }] },
            { label: "화", segments: [{ value: 30, title: "여유" }, { value: 40, title: "보통" }, { value: 30, title: "혼잡" }] },
            { label: "수", segments: [{ value: 25, title: "여유" }, { value: 35, title: "보통" }, { value: 40, title: "혼잡" }] },
            { label: "목", segments: [{ value: 22, title: "여유" }, { value: 38, title: "보통" }, { value: 40, title: "혼잡" }] },
            { label: "금", segments: [{ value: 10, title: "여유" }, { value: 30, title: "보통" }, { value: 60, title: "혼잡" }] },
        ],
        []
    );

    const handleSearch = () => setPage(1);

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

            <main className="admin-rest-page">
                <div className="admin-top">
                    <div><h2 className="admin-title">식당 관리</h2></div>
                    <div className="admin-actions-bar">
                        <button className="admin-btn admin-ghost" onClick={() => navigate("/adminMain")}>메인으로 돌아가기</button>
                        <button className="admin-btn admin-primary" onClick={() => navigate("/adminrestaurants/new")}>새로운 식당 추가</button>
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
                            <button type="button" className="admin-search-btn" onClick={handleSearch} aria-label="검색" title="검색">
                                검색
                            </button>
                        </div>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="카테고리 필터">
                            {categories.map((c) => (
                                <option key={c} value={c}>{c === "ALL" ? "모든 카테고리" : c}</option>
                            ))}
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
                                <tr>
                                    <th>식당 이름</th>
                                    <th>카테고리</th>
                                    <th>위치</th>
                                    <th>혼밥레벨</th>
                                    <th>평점</th>
                                    <th>복지카드</th>
                                    <th>상태</th>
                                    <th>작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {view.map((r) => (
                                    <tr key={r.id}>
                                        <td>
                                            <div className="admin-name-col"><strong className="admin-link" onClick={() => navigate(`/adminrestaurants/${r.id}`)}>{r.name}</strong></div>
                                        </td>
                                        <td>{r.category}</td>
                                        <td className="admin-truncate">{r.address}</td>
                                        <td>
                                            <span className={`admin-busy ${Number(r.solo_index) >= 9 ? "admin-high" : Number(r.solo_index) >= 8 ? "admin-mid" : ""}`}>{Number(r.solo_index).toFixed(1)}</span>
                                        </td>
                                        <td>{Number(r.avgRating).toFixed(1)} <span className="admin-muted">({r.rating_count || 0})</span></td>
                                        <td><WelfareDot ok={false} /></td>
                                        <td><StatusPill status={r.status} /></td>
                                        <td className="admin-row-actions">
                                            <button className="admin-mini" onClick={() => navigate(`/adminrestaurants/${r.id}/edit`)}>수정</button>
                                            <button className="admin-mini admin-danger" disabled={deletingId === r.id} onClick={() => onDelete(r)}>{deletingId === r.id ? "삭제 중..." : "삭제"}</button>
                                        </td>
                                    </tr>
                                ))}
                                {view.length === 0 && (
                                    <tr><td colSpan={8} className="admin-empty">조건에 맞는 레스토랑이 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination page={page} pages={pages} onChange={setPage} />
                </div>

                <div className="admin-charts-grid">
                    <div className="admin-card">
                        <div className="admin-card-head"><h3>식당 카테고리 분포</h3></div>
                        <PieChart data={pieData} />
                    </div>
                    <div className="admin-card">
                        <div className="admin-card-head"><h3>식당 혼잡레벨 분포</h3></div>
                        <StackedBars items={busyItems} />
                        <div className="admin-bar-legend">
                            <span className="admin-seg admin-s1" /> 여유
                            <span className="admin-seg admin-s2" /> 보통
                            <span className="admin-seg admin-s3" /> 혼잡
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
