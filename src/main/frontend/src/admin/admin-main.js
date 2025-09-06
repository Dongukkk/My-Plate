import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PrettyAlert from "./pretty-alert";
import "./admin-main.css";

axios.defaults.baseURL = "http://localhost:8080";

/* 공통 유틸 */
const safeGet = async (url) => {
    try {
        const { data } = await axios.get(url);
        const list = Array.isArray(data) ? data : data?.items || data?.rows || data?.list || [];
        return list || [];
    } catch { return []; }
};
const normStatus = (s = "") => {
    const k = String(s).toUpperCase();
    if (k.includes("ACTIVE") || k.includes("활성")) return "ACTIVE";
    if (k.includes("SUSPEND") || k.includes("정지")) return "SUSPENDED";
    if (k.includes("DELETE") || k.includes("비활성")) return "DELETED";
    return "PENDING";
};
const pickDate = (row) =>
    new Date(row?.createdAt || row?.created_at || row?.created || row?.regDate || row?.registeredAt || 0);
const withinDays = (d, days) => d && !Number.isNaN(+d) && Date.now() - d.getTime() <= days * 86400000;
const pctChange = (curr, prev) =>
    !prev ? "—" : `${curr - prev >= 0 ? "+" : ""}${(((curr - prev) / prev) * 100).toFixed(1)}%`;
const baseCategory = (c) => {
    if (c == null) return "기타";
    const txt = String(c).trim();
    if (!txt) return "기타";
    const head = txt.split(",")[0].trim();
    return head || "기타";
};

/* 모달/카드 */
const LogoutModal = ({ isOpen, onClose, onConfirm }) =>
    !isOpen ? null : (
        <div className="admin-modal-overlay">
            <div className="admin-modal-content">
                <p>정말 로그아웃하시겠습니까?</p>
                <div className="admin-modal-actions">
                    <button onClick={onConfirm} className="admin-btn-logout">로그아웃</button>
                    <button onClick={onClose} className="admin-btn-cancel">취소</button>
                </div>
            </div>
        </div>
    );

const StatsCard = ({ title, value, change, onClick }) => (
    <div className="admin-card" onClick={onClick} style={{ cursor: "pointer" }}>{title}
        <br /><span className="admin-value">{Number(value || 0).toLocaleString()}</span>
        <br /><span className="admin-change">{change}</span>
    </div>
);

/* 미니 차트들 */
const buildPath = (arr) => {
    const n = arr.length || 1;
    const step = n > 1 ? 100 / (n - 1) : 100;
    return arr.map((v, i) => `${i * step},${100 - v}`).join(" ");
};

const MiniLine = ({ title, series1 = [], series2 = [], legend1 = "주 지표", legend2 = "보조 지표", xLabels = [] }) => (
    <div className="mini-linechart" aria-label={title}>
        <div className="mini-title">{title}</div>
        <div className="mini-plot">
            <div className="mini-y"> {[100, 75, 50, 25, 0].map((v) => ( <span key={v}>{v}</span> ))} </div>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mini-svg">
                <g className="mini-grid"> {[20, 40, 60, 80].map((y) => ( <line key={y} x1="0" y1={y} x2="100" y2={y} /> ))} </g>
                {series2.length > 0 && <polyline className="mini-line teal" points={buildPath(series2)} />}
                <polyline className="mini-line red" points={buildPath(series1)} />
            </svg>
        </div>
        <div className="mini-legend">
            <span className="mini-dot red" /> {legend1}
            {series2.length > 0 && (<><span className="mini-dot teal" /> {legend2}</>)}
        </div>
        {xLabels.length > 0 && (<div className="mini-x">{xLabels.map((l, i) => ( <span key={i}>{l}</span>))}</div>)}
    </div>
);

const MiniPie = ({ data }) => {
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    let acc = 0;
    const stops = data
        .map((d) => {
            const from = (acc / total) * 360;
            acc += d.value;
            const to = (acc / total) * 360;
            return `${d.color} ${from}deg ${to}deg`;
        }) .join(", ");
    return (
        <div className="mini-pie-wrap">
            <div className="mini-pie" style={{ background: `conic-gradient(${stops})` }} />
            <ul className="mini-legend mini-legend-pie">
                {data.map((d) => (
                    <li key={d.label}>
                        <span className="mini-dot" style={{ background: d.color }} />
                        {d.label} <em>{d.value}</em>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default function AdminMain() {
    const navigate = useNavigate();

    // 원본 데이터
    const [users, setUsers] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [reportsIPC, setReportsIPC] = useState([]);
    const [reportsOHT, setReportsOHT] = useState([]);
    const [reportsRER, setReportsRER] = useState([]);

    // 로딩/알림
    const [loading, setLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [logoutAlertOpen, setLogoutAlertOpen] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const [u, r, ip, oh, rr] = await Promise.all([
                safeGet("/api/adminUser"),
                safeGet("/api/adminRestaurant"),
                safeGet("/api/adminContent/IPC"),
                safeGet("/api/adminContent/OTH"),
                safeGet("/api/adminContent/RER"),
            ]);
            setUsers(u);
            setRestaurants(r);
            setReportsIPC(ip);
            setReportsOHT(oh);
            setReportsRER(rr);
            setLoading(false);
        })();
    }, []);

    /* 집계 */
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => normStatus(u.status) === "ACTIVE").length;
    const totalRestaurants = restaurants.length;
    const totalReviews = restaurants.reduce((s, r) => s + (Number(r.rating_count ?? r.ratingCount ?? 0) || 0), 0);

    // 변화율(최근 30일 vs 이전 30일)
    const now = new Date();
    const curr30Start = new Date(now);
    curr30Start.setDate(curr30Start.getDate() - 30);
    const prev30Start = new Date(curr30Start);
    prev30Start.setDate(prev30Start.getDate() - 30);

    const usersPrev30 = users.filter((u) => {
        const d = pickDate(u);
        return d && d >= prev30Start && d < curr30Start;
    }).length;
    const usersCurr30 = users.filter((u) => {
        const d = pickDate(u);
        return d && d >= curr30Start && d <= now;
    }).length;
    const restsPrev30 = restaurants.filter((r) => {
        const d = pickDate(r);
        return d && d >= prev30Start && d < curr30Start;
    }).length;
    const restsCurr30 = restaurants.filter((r) => {
        const d = pickDate(r);
        return d && d >= curr30Start && d <= now;
    }).length;

    const statsChange = {
        totalUsers: pctChange(usersCurr30, usersPrev30),
        activeUsers: "—",
        restaurants: pctChange(restsCurr30, restsPrev30),
        reviews: "—",
    };

    // 인기 가게 TOP5
    const top5 = useMemo(() => {
        const items = restaurants.map((r) => ({
            id: r.id,
            name: r.name || `#${r.id}`,
            address: r.address || "-",
            rating: Number(r.avgRating ?? r.avg_rating ?? 0) || 0,
        }));
        return items
            .filter((x) => x.rating > 0)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);
    }, [restaurants]);

    // 사용자 관리
    const weeklyNewUsers = users.filter((u) => withinDays(pickDate(u), 7)).length;
    const dailyActiveUsers = users.filter((u) => normStatus(u.status) === "ACTIVE" && withinDays(pickDate(u), 1)).length;
    const recentUsers = useMemo(() => {
        const nameOf = (u) => u?.nickname || u?.username || u?.name || `#${u?.id}`;
        return [...users]
            .sort((a, b) => pickDate(b) - pickDate(a))
            .slice(0, 5)
            .map((u) => ({ id: u.id, name: nameOf(u), date: pickDate(u) }));
    }, [users]);

    // 신고/콘텐츠
    const allReports = [...reportsIPC, ...reportsOHT, ...reportsRER];
    const isPending = (x) => {
        const s = String(x?.status || "").toUpperCase();
        const d = String(x?.decision || "").toUpperCase();
        return s.includes("PENDING") || s.includes("대기") || (!s && !d);
    };
    const pendingReview = reportsRER.filter(isPending).length;
    const weeklyPhotos = restaurants.filter((r) => (r.photo_url || r.photoUrl) && withinDays(pickDate(r), 7)).length;
    const totalReported = allReports.length;

    /* 상단 라인차트 데이터 */
    const weekBuckets = useMemo(() => {
        const arr = [];
        const end = new Date();
        for (let i = 0; i < 8; i++) {
            const s = new Date(end);
            s.setDate(s.getDate() - 7);
            arr.push({ start: new Date(s), end: new Date(end) });
            end.setDate(end.getDate() - 7);
        }
        return arr.reverse();
    }, []);

    const weekLabels = useMemo(
        () =>
            weekBuckets.map(({ end }) => {
                const m = String(end.getMonth() + 1).padStart(2, "0");
                const d = String(end.getDate()).padStart(2, "0");
                return `${m}/${d}`;
            }),
        [weekBuckets]
    );

    const signupSeries = useMemo(() => {
        const raw = weekBuckets.map(({ start, end }) =>
            users.filter((u) => {
                const d = pickDate(u);
                return d && d >= start && d < end;
            }).length
        );
        const maxV = Math.max(1, ...raw);
        return raw.map((v) => Math.round((v / maxV) * 100));
    }, [users, weekBuckets]);

    const activeSeries = useMemo(() => {
        const act = [],
            inact = [];
        weekBuckets.forEach(({ start, end }) => {
            const a = users.filter((u) => {
                const d = pickDate(u);
                return d && d >= start && d < end && normStatus(u.status) === "ACTIVE";
            }).length;
            const i = users.filter((u) => {
                const d = pickDate(u);
                return d && d >= start && d < end && normStatus(u.status) !== "ACTIVE";
            }).length;
            act.push(a);
            inact.push(i);
        });
        const maxV = Math.max(1, ...act, ...inact);
        const norm = (arr) => arr.map((v) => Math.round((v / maxV) * 100));
        return { red: norm(act), teal: norm(inact) };
    }, [users, weekBuckets]);

    /* 하단 분석 파이 데이터 */
    const pieData = useMemo(() => {
        const counts = new Map();
        restaurants.forEach((r) => {
            const k = baseCategory(r.category);
            counts.set(k, (counts.get(k) || 0) + 1);
        });
        const palette = ["#e74c3c", "#f39c12", "#2ecc71", "#3498db", "#9b59b6", "#16a085", "#8e44ad", "#95a5a6"];
        let i = 0;
        return [...counts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([label, value]) => ({ label, value, color: palette[i++ % palette.length] }));
    }, [restaurants]);

    const stats = { totalUsers, activeUsers, restaurants: totalRestaurants, reviews: totalReviews };

    const handleConfirmLogout = () => {
        setIsModalOpen(false);
        setLogoutAlertOpen(true);
    };

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

            <main className="admin-main-content">
                <div className="admin-topbar">
                    <div className="admin-profile-container">
                        <div className="admin-profile" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>관리자</div>
                        {isDropdownOpen && (<div className="admin-dropdown-menu"><button onClick={() => { setIsDropdownOpen(false); setIsModalOpen(true); }} >로그아웃</button></div>)}
                    </div>
                </div>

                {/* KPI */}
                <section className="admin-stats">
                    <StatsCard title="총 사용자" value={loading ? 0 : stats.totalUsers} change={loading ? "—" : statsChange.totalUsers} onClick={() => navigate("/adminUser")}/>
                    <StatsCard title="활성 사용자" value={loading ? 0 : stats.activeUsers} change={loading ? "—" : statsChange.activeUsers} onClick={() => navigate("/adminUser")}/>
                    <StatsCard title="등록된 레스토랑" value={loading ? 0 : stats.restaurants} change={loading ? "—" : statsChange.restaurants} onClick={() => navigate("/adminrestaurants")}/>
                    <StatsCard title="리뷰 수" value={loading ? 0 : stats.reviews} change={loading ? "—" : statsChange.reviews} onClick={() => navigate("/adminContent")}/>
                </section>

                {/* 상단 차트 */}
                <section className="admin-charts">
                    <div className="admin-chart-box" onClick={() => navigate("/adminanalysis")}>
                        <MiniLine title="사용자 등록 추이 (최근 8주)" legend1="신규 가입" series1={signupSeries} xLabels={weekLabels}/>
                    </div>
                    <div className="admin-chart-box" onClick={() => navigate("/adminanalysis")}>
                        <MiniLine title="사용자 활동 분석 (최근 8주)" legend1="활성 사용자" legend2="비활성/정지" series1={activeSeries.red} series2={activeSeries.teal} xLabels={weekLabels}/>
                    </div>
                </section>

                <div className="admin-grid-container">
                    {/* 인기 가게 */}
                    <section className="admin-grid-item">
                        <div className="admin-section-header">
                            <h3>인기 가게 TOP 5</h3>
                            <button className="admin-section-btn" onClick={() => navigate("/adminrestaurants")}>가게 관리</button>
                        </div>
                        <div className="admin-table-wrapper">
                            <table className="admin-tight-table">
                                <colgroup>
                                    <col className="col-name" />
                                    <col className="col-addr" />
                                    <col className="col-num" />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>가게 이름</th>
                                        <th>위치</th>
                                        <th className="th-num">평점</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading && (<tr><td colSpan={3}>불러오는 중…</td></tr>)}
                                    {!loading && top5.length === 0 && (<tr><td colSpan={3}>표시할 데이터가 없습니다.</td></tr>)}
                                    {!loading &&
                                        top5.map((r) => (
                                            <tr key={r.id}>
                                                <td><span className="ellipsis">{r.name}</span></td>
                                                <td><span className="ellipsis">{r.address}</span></td>
                                                <td className="td-num">{r.rating.toFixed(1)}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                    {/* 사용자 관리 */}
                    <section className="admin-grid-item">
                        <div className="admin-section-header">
                            <h3>사용자 관리</h3>
                            <button className="admin-section-btn" onClick={() => navigate("/adminUser")}>사용자 관리</button>
                        </div>
                        <div className="admin-user-stats">
                            <p>신규 가입자 (이번 주): <strong className="num">{loading ? "—" : weeklyNewUsers.toLocaleString()}</strong></p>
                            <p>활성 사용자 (일간): <strong className="num">{loading ? "—" : dailyActiveUsers.toLocaleString()}</strong></p>
                        </div>
                        <div className="admin-recent-users">
                            <h4>최근 가입한 사용자</h4>
                            <ul>
                                {loading && <li>불러오는 중…</li>}
                                {!loading && recentUsers.length === 0 && <li>최근 가입자가 없습니다.</li>}
                                {!loading &&
                                    recentUsers.map((u) => (
                                        <li key={u.id}>
                                            <span className="user-name ellipsis">{u.name}</span>
                                            <span className="user-date">{u.date ? u.date.toISOString().slice(0, 10) : "-"}</span>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    </section>
                    {/* 콘텐츠 관리 */}
                    <section className="admin-grid-item">
                        <div className="admin-section-header">
                            <h3>콘텐츠 관리</h3>
                            <button className="admin-section-btn" onClick={() => navigate("/adminContent")}>콘텐츠 관리</button>
                        </div>
                        <div className="admin-content-stats">
                            <p>대기 중인 리뷰: <strong className="num">{loading ? "—" : pendingReview.toLocaleString()}</strong></p>
                            <p>이번 주에 등록된 사진: <strong className="num">{loading ? "—" : weeklyPhotos.toLocaleString()}</strong></p>
                            <p>신고된 콘텐츠: <strong className="num">{loading ? "—" : totalReported.toLocaleString()}</strong></p>
                        </div>
                    </section>
                    {/* 분석 및 통계 */}
                    <section className="admin-grid-item">
                        <div className="admin-section-header">
                            <h3>분석 및 통계</h3>
                            <button className="admin-section-btn" onClick={() => navigate("/adminanalysis")}>자세한 분석</button>
                        </div>
                        <div className="admin-analysis-charts">
                            <div className="admin-chart-box"><MiniPie data={pieData} /></div>
                        </div>
                    </section>
                </div>
            </main>
            <LogoutModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmLogout} />
            <PrettyAlert open={logoutAlertOpen} message="로그아웃되었습니다." onClose={() => setLogoutAlertOpen(false)} />
        </div>
    );
}
