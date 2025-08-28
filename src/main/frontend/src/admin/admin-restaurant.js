import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./admin-restaurant.css";

const USE_MOCK = true;

/* 상태 뱃지 */
const StatusPill = ({ status }) => {
    const map = { 활성: "ok", "수정 필요": "warn", 비활성: "off" };
    return <span className={`admin-status-pill ${map[status] || "off"}`}>{status}</span>;
};

/* 복지카드 가용 점표시 */
const WelfareDot = ({ ok }) => (
    <span className={`admin-welfare-dot ${ok ? "on" : "off"}`} aria-label={ok ? "가능" : "불가"} />
);

/* 페이지네이션 */
const Pagination = ({ page, pages, onChange }) => {
    const nums = Array.from({ length: pages }, (_, i) => i + 1);
    return (
        <div className="admin-pg">
            <button className="admin-pg-item admin-ghost" onClick={() => onChange(Math.max(1, page - 1))}>이전</button>
            {nums.map((p) => (
                <button key={p} className={`admin-pg-item ${page === p ? "admin-active" : ""}`} onClick={() => onChange(p)}>
                    {p}
                </button>
            ))}
            <button className="admin-pg-item admin-ghost" onClick={() => onChange(Math.min(pages, page + 1))}>다음</button>
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

    /* 검색/필터/정렬/페이지 */
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("ALL");
    const [sort, setSort] = useState("latest");
    const [page, setPage] = useState(1);
    const pageSize = 5;

    /* 목록/총건수 */
    const [rows, setRows] = useState([]);
    const [serverTotal, setServerTotal] = useState(0);

    /* 제출 대기 목록 */
    const [pending, setPending] = useState([]);

    /* 카테고리 목록 */
    const categories = useMemo(
        () => ["ALL", "한식", "일식, 라멘", "카페, 브런치", "양식", "중식", "분식", "퓨전, 현대식"],
        []
    );

    /* ---- MOCK 데이터 ---- */
    useEffect(() => {
        if (!USE_MOCK) return;
        setRows([
            { id: 12345, name: "라면 이자반", category: "일식, 라멘", location: "서울시 강남구 역삼동", busyScore: 9.5, rating: 4.8, ratingCnt: 324, welfare: true, status: "활성" },
            { id: 12346, name: "카페 폼", category: "카페, 브런치", location: "서울시 서대문구 연희동", busyScore: 9.0, rating: 4.7, ratingCnt: 203, welfare: false, status: "활성" },
            { id: 12347, name: "김치 향수", category: "한식, 전통", location: "서울시 마포구 연남동", busyScore: 9.0, rating: 4.6, ratingCnt: 187, welfare: true, status: "활성" },
            { id: 12348, name: "사막만 연쇄 비스트로", category: "양식, 스시", location: "서울시 강남구 청담동", busyScore: 8.5, rating: 4.5, ratingCnt: 328, welfare: false, status: "비활성" },
            { id: 12349, name: "이반 레이트", category: "퓨전, 현대식", location: "서울시 용산구 이태원동", busyScore: 8.7, rating: 4.5, ratingCnt: 156, welfare: true, status: "수정 필요" },
        ]);
        setServerTotal(5);
        setPending([
            { id: 9001, name: "타이 오아시스", category: "태국식", location: "서울시 마포구 상수동", creator: "박지은", date: "2023-11-15" },
            { id: 9002, name: "비스토로 유노", category: "유럽식", location: "서울시 종로구 삼청동", creator: "이수진", date: "2023-11-14" },
            { id: 9003, name: "루프탑 비스트로", category: "프렌치", location: "서울시 용산구 한남동", creator: "최은서", date: "2023-11-12" },
        ]);
    }, []);

    /* ---- 서버 연동 훅 ---- */
    useEffect(() => {
        if (USE_MOCK) return;
        const fetchList = async () => {
            // API: 목록 조회
            const res = await axios.get("/api/admin/restaurants", {
                params: { query, category: category === "ALL" ? "" : category, page, size: pageSize, sort },
            });
            setRows(res.data.items);
            setServerTotal(res.data.total);
        };
        fetchList();
    }, [query, category, page, sort]);

    useEffect(() => {
        if (USE_MOCK) return;
        const fetchPending = async () => {
            // API: 제출 대기 목록
            const res = await axios.get("/api/admin/restaurants/pending");
            setPending(res.data.items);
        };
        fetchPending();
    }, []);

    /* 프론트 단 필터 */
    const filtered = useMemo(() => {
        if (!USE_MOCK) return rows;
        const term = query.trim().toLowerCase();
        return rows.filter((r) => {
            const passQ =
                !term ||
                r.name.toLowerCase().includes(term) ||
                r.location.toLowerCase().includes(term) ||
                r.category.toLowerCase().includes(term);
            const passCat = category === "ALL" || r.category.startsWith(category);
            return passQ && passCat;
        });
    }, [query, category, rows]);

    const totalForPaging = USE_MOCK ? filtered.length : serverTotal;
    const pages = Math.max(1, Math.ceil(totalForPaging / pageSize));
    const view = USE_MOCK ? filtered.slice((page - 1) * pageSize, page * pageSize) : rows;

    useEffect(() => setPage(1), [query, category]);

    /* 제출 승인/거부 */
    const approveOne = async (idx) => {
        const target = pending[idx];
        // await axios.post("/api/admin/restaurants/approve", { id: target.id });
        setPending((list) => list.filter((_, i) => i !== idx));
        alert(`승인 완료: ${target.name}`);
    };
    const rejectOne = async (idx) => {
        const target = pending[idx];
        // await axios.post("/api/admin/restaurants/reject", { id: target.id, reason: "" });
        setPending((list) => list.filter((_, i) => i !== idx));
        alert(`거부 완료: ${target.name}`);
    };
    const approveAll = async () => {
        // await axios.post("/api/admin/restaurants/bulk-approve");
        setPending([]);
        alert("모든 제출을 승인했습니다.");
    };
    const rejectAll = async () => {
        // await axios.post("/api/admin/restaurants/bulk-reject");
        setPending([]);
        alert("모든 제출을 거부했습니다.");
    };

    /* 차트 샘플 데이터 */
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

    /* 검색 버튼/엔터 처리 */
    const handleSearch = () => {
        setPage(1);
    };

    return (
        <div className="admin-container">
            {/* 사이드바 */}
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

            {/* 메인 */}
            <main className="admin-rest-page">
                <div className="admin-top">
                    <div>
                        <h2 className="admin-title">식당 관리</h2>
                    </div>
                    <div className="admin-actions-bar">
                        <button className="admin-btn admin-ghost" onClick={() => navigate("/adminMain")}>메인으로 돌아가기</button>
                        <button className="admin-btn admin-primary" onClick={() => navigate("/adminrestaurants/new")}>새로운 식당 추가</button>
                    </div>
                </div>

                {/* 검색/필터/정렬 */}
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
                        <option value="busyDesc">혼잡지수높은순</option>
                        <option value="nameAsc">이름오름차순</option>
                    </select>
                </div>

                {/* 목록 */}
                <div className="admin-card">
                    <div className="admin-card-head">
                        <h3>식당 목록</h3>
                        <span className="admin-muted">총 {totalForPaging}개 · 페이지당 {pageSize} 표시</span>
                    </div>

                    <div className="admin-table-wrap">
                        <table className="admin-rest-table">
                            <thead>
                                <tr>
                                    <th>식당 이름</th>
                                    <th>카테고리</th>
                                    <th>위치</th>
                                    <th>혼잡지수</th>
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
                                            <div className="admin-name-col">
                                                <strong className="admin-link" onClick={() => navigate(`/adminrestaurants/${r.id}`)}>{r.name}</strong>
                                                <span className="admin-sub">ID: #{r.id}</span>
                                            </div>
                                        </td>
                                        <td>{r.category}</td>
                                        <td className="admin-truncate">{r.location}</td>
                                        <td>
                                            <span className={`admin-busy ${r.busyScore >= 9 ? "admin-high" : r.busyScore >= 8 ? "admin-mid" : ""}`}>
                                                {r.busyScore.toFixed(1)}
                                            </span>
                                        </td>
                                        <td>{r.rating.toFixed(1)} <span className="admin-muted">({r.ratingCnt})</span></td>
                                        <td><WelfareDot ok={r.welfare} /></td>
                                        <td><StatusPill status={r.status} /></td>
                                        <td className="admin-row-actions">
                                            <button className="admin-mini" onClick={() => navigate(`/adminrestaurants/${r.id}/edit`)}>수정</button>
                                            <button
                                                className="admin-mini admin-ghost"
                                                onClick={async () => {
                                                    // await axios.patch(`/api/admin/restaurants/${r.id}/status`, { status: "비활성" });
                                                    alert("비활성 처리(샘플)");
                                                }}
                                            >
                                                비활성
                                            </button>
                                            <button
                                                className="admin-mini admin-danger"
                                                onClick={async () => {
                                                    if (!window.confirm("삭제하시겠습니까?")) return;
                                                    // await axios.delete(`/api/admin/restaurants/${r.id}`);
                                                    alert("삭제(샘플)");
                                                }}
                                            >
                                                삭제
                                            </button>
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

                {/* 제출 승인 */}
                <div className="admin-card">
                    <div className="admin-card-head"><h3>새로운 식당 제출 승인</h3></div>
                    <div className="admin-table-wrap">
                        <table className="admin-rest-table">
                            <thead>
                                <tr>
                                    <th>식당 이름</th>
                                    <th>카테고리</th>
                                    <th>위치</th>
                                    <th>제출자</th>
                                    <th>제출일</th>
                                    <th>작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pending.map((s, i) => (
                                    <tr key={s.id}>
                                        <td><strong>{s.name}</strong></td>
                                        <td>{s.category}</td>
                                        <td className="admin-truncate">{s.location}</td>
                                        <td>{s.creator}</td>
                                        <td>{s.date}</td>
                                        <td className="admin-row-actions">
                                            <button className="admin-mini admin-success" onClick={() => approveOne(i)}>승인</button>
                                            <button className="admin-mini admin-danger" onClick={() => rejectOne(i)}>거부</button>
                                            <button className="admin-mini admin-ghost" onClick={() => navigate(`/adminrestaurants/submit/detail/${s.id}`)}>상세</button>
                                        </td>
                                    </tr>
                                ))}
                                {pending.length === 0 && (
                                    <tr><td colSpan={6} className="admin-empty">승인 대기 중인 제출이 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="admin-card-foot">
                        <div />
                        <div className="admin-btn-group">
                            <button className="admin-btn admin-success" onClick={approveAll}>모두 승인</button>
                            <button className="admin-btn admin-danger" onClick={rejectAll}>모두 거부</button>
                        </div>
                    </div>
                </div>

                {/* 차트 */}
                <div className="admin-charts-grid">
                    <div className="admin-card">
                        <div className="admin-card-head"><h3>레스토랑 식당 분포</h3></div>
                        <PieChart data={pieData} />
                    </div>
                    <div className="admin-card">
                        <div className="admin-card-head"><h3>식당 혼잡지수 분포</h3></div>
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
