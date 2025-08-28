import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin-user.css";

/** 더미/백엔드 전환 스위치 */
const USE_MOCK = true;

/* 상태 뱃지 */
const StatusPill = ({ status = "비활성" }) => {
    const map = { 활성: "ok", "수정 필요": "warn", 비활성: "off", 정지: "ban" };
    return <span className={`admin-status ${map[status] || "off"}`}>{status}</span>;
};

/* 공통 페이징 */
const Pager = ({ page, total, onPage }) => {
    const max = Math.max(1, Math.ceil(total));
    const pages = Array.from({ length: Math.min(5, max) }, (_, i) => i + Math.max(1, Math.min(page - 2, max - 4)));
    return (
        <div className="admin-pager">
            <button disabled={page <= 1} onClick={() => onPage(page - 1)}>이전</button>
            {pages.map((p) => (
                <button key={p} className={p === page ? "on" : ""} onClick={() => onPage(p)}>{p}</button>
            ))}
            <button disabled={page >= max} onClick={() => onPage(page + 1)}>다음</button>
        </div>
    );
};

/* 간단 라인차트(SVG) */
const LineChart = ({ series, height = 160 }) => {
    // series: [{name,color,data:[numbers]}]
    const width = 380;
    const padding = 16;
    const maxLen = Math.max(...series.map(s => s.data.length));
    const flat = series.flatMap(s => s.data);
    const min = Math.min(...flat);
    const max = Math.max(...flat);
    const x = (i) => padding + (i * (width - padding * 2)) / (maxLen - 1);
    const y = (v) => {
        if (max === min) return height / 2;
        return height - padding - ((v - min) * (height - padding * 2)) / (max - min);
    };
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

/* 막대/파이 차트(간단) */
const BarChart = ({ data, height = 140 }) => {
    const width = 380;
    const pad = 16;
    const maxV = Math.max(...data.map(d => d.value), 1);
    const barH = (height - pad * 2) / data.length - 8;
    return (
        <svg className="admin-barchart" viewBox={`0 0 ${width} ${height}`}>
            <rect x="0" y="0" width={width} height={height} fill="#fff" rx="10" />
            {data.map((d, i) => {
                const w = ((width - pad * 2) * d.value) / maxV;
                const y = pad + i * (barH + 8);
                return (
                    <g key={d.label}>
                        <rect x={pad} y={y} width={w} height={barH} className="admin-bar" />
                        <text x={pad} y={y - 4} className="admin-small">{d.label}</text>
                        <text x={pad + w + 6} y={y + barH - 4} className="admin-small">{d.value}</text>
                    </g>
                );
            })}
        </svg>
    );
};

/* 더미 데이터 */
const mockUsers = [
    { id: "USR-7845", name: "김민지", email: "minji.kim@example.com", joined: "2023-05-12", status: "활성", avatar: "https://i.pravatar.cc/48?img=1" },
    { id: "USR-6532", name: "박준호", email: "junho.park@example.com", joined: "2023-06-24", status: "정지", avatar: "https://i.pravatar.cc/48?img=2" },
    { id: "USR-5421", name: "이수진", email: "sujin.lee@example.com", joined: "2023-04-18", status: "활성", avatar: "https://i.pravatar.cc/48?img=3" },
    { id: "USR-4312", name: "최태영", email: "taeyoung.choi@example.com", joined: "2023-03-05", status: "수정 필요", avatar: "https://i.pravatar.cc/48?img=4" },
    { id: "USR-3287", name: "장유나", email: "yuna.jang@example.com", joined: "2023-07-30", status: "비활성", avatar: "https://i.pravatar.cc/48?img=5" },
];
const mockReports = [
    { id: "RPT-2845", type: "부적절 리뷰", reporter: "권태영", target: "최태영", text: "개인정보/비방 포함", date: "2023-08-15", status: "대기" },
    { id: "RPT-2832", type: "허위 정보", reporter: "박효준", target: "이수진", text: "영업시간 상이", date: "2023-08-14", status: "처리중" },
    { id: "RPT-2821", type: "스팸", reporter: "정다니", target: "공중동", text: "공손치 못한 글 반복", date: "2023-08-12", status: "완료" },
    { id: "RPT-2815", type: "기타", reporter: "이지수", target: "정유나", text: "부적절 링크", date: "2023-08-10", status: "대기" },
];
const mockFeedback = [
    { name: "김지연", date: "2023-08-15", text: "혼밥 친화도 지표가 도움이 됩니다.", avatar: "https://i.pravatar.cc/48?img=6" },
    { name: "이성현", date: "2023-08-14", text: "라스트오더 안내 좋아요.", avatar: "https://i.pravatar.cc/48?img=7" },
    { name: "박태수", date: "2023-08-12", text: "접근성 정보가 유용합니다.", avatar: "https://i.pravatar.cc/48?img=8" },
];

export default function AdminUser() {

    const navigate = useNavigate();

    // 상단 카드
    const [cards, setCards] = useState({
        total: 12458, active: 8723, newJoin: 342, pendingReports: 28,
        diffs: { total: 5.2, active: -3.7, newJoin: 12.4, pendingReports: 8.3 }
    });

    // 목록/검색/필터
    const [users, setUsers] = useState([]);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("전체");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // 신고/피드백
    const [reports, setReports] = useState([]);
    const [reportType, setReportType] = useState("모든 유형");
    const [reportState, setReportState] = useState("모든 상태");
    const [reportPage, setReportPage] = useState(1);

    // 차트 기간
    const [period, setPeriod] = useState("최근 30일");

    // 초기 로드
    useEffect(() => {
        if (USE_MOCK) {
            setUsers(mockUsers);
            setReports(mockReports);
        } else {
            // TODO: API 연동 예시
            // axios.get("/api/admin/users", { params: { page, size: pageSize, q: query, status: statusFilter }})
            //   .then(res => setUsers(res.data.items));
            // axios.get("/api/admin/reports", { params: { page: reportPage, type: reportType, state: reportState }})
            //   .then(res => setReports(res.data.items));
        }
    }, []);

    // 검색/필터 결과
    const filteredUsers = useMemo(() => {
        const q = query.trim().toLowerCase();
        return users.filter(u => {
            const matchQ = !q || [u.id, u.name, u.email].some(v => v.toLowerCase().includes(q));
            const matchS = statusFilter === "전체" || u.status === statusFilter;
            return matchQ && matchS;
        });
    }, [users, query, statusFilter]);

    const userPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
    const pagedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

    // 차트용 더미
    const activitySeries = [
        { name: "신규 가입", color: "#ef5350", data: [12, 20, 11, 24, 18, 21, 19, 22, 17, 25] },
        { name: "활성 사용자", color: "#42a5f5", data: [40, 38, 45, 41, 39, 48, 46, 43, 44, 47] },
        { name: "리뷰 작성", color: "#66bb6a", data: [9, 14, 12, 16, 10, 13, 11, 15, 9, 12] },
    ];

    // 작업 예시
    const handleAction = (act, user) => {
        if (USE_MOCK) {
            if (act === "비활성화") {
                setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: "비활성" } : u));
            }
            if (act === "활성화") {
                setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: "활성" } : u));
            }
            if (act === "삭제") {
                setUsers(prev => prev.filter(u => u.id !== user.id));
            }
        } else {
            // TODO: API 호출 (PATCH/DELETE)
            // axios.patch(`/api/admin/users/${user.id}`, { action: act })
        }
    };

    return (

        <div className="admin-container">
            <aside className="admin-sidebar">
                <h2 className="admin-logo">
                    <img
                        src={"https://i.imgur.com/tiY7WKl.png"}
                        alt="My Plate Logo"
                        className="admin-logo-img"
                    />
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
                    <div>
                        <h2>사용자 관리</h2>
                    </div>
                </div>

                {/* 요약 카드 */}
                <div className="admin-cards">
                    <div className="admin-card">
                        <div className="admin-card-title">총 사용자</div>
                        <div className="admin-card-value">{cards.total.toLocaleString()}</div>
                        <div className={`admin-card-diff up`}>지난 주 대비 +{cards.diffs.total}%</div>
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
                                <select className="admin-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                                    <option>전체</option>
                                    <option>활성</option>
                                    <option>수정 필요</option>
                                    <option>비활성</option>
                                    <option>정지</option>
                                </select>
                            </div>
                        </div>

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
                                                <button onClick={() => handleAction("활성화", u)} className="admin-link">수정</button>
                                                <button onClick={() => handleAction("삭제", u)} className="admin-link danger">삭제</button>
                                        </td>
                                    </tr>
                                ))}
                                {pagedUsers.length === 0 && (
                                    <tr><td colSpan={7} className="admin-empty">검색 결과가 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>

                        <div className="admin-foot right">
                            <Pager page={page} total={userPages} onPage={setPage} />
                        </div>
                    </section>

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
                            <br/>
                            <span className="admin-dot red" /> 신규 가입
                            <span className="admin-dot blue" /> 활성 사용자
                            <span className="admin-dot green" /> 리뷰 작성
                        </div>
                    </aside>
                </div>

                {/* 신고/피드백 & 통계 */}
                <div className="admin-grid">
                    <section className="admin-panel">
                        <div className="admin-panel-head">
                            <h3>사용자 신고 및 피드백</h3>
                            <div className="admin-actions">
                                <select className="admin-select" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                                    <option>모든 유형</option><option>부적절 리뷰</option><option>허위 정보</option><option>스팸</option><option>기타</option>
                                </select>
                                <select className="admin-select" value={reportState} onChange={(e) => setReportState(e.target.value)}>
                                    <option>모든 상태</option><option>대기</option><option>처리중</option><option>완료</option>
                                </select>
                            </div>
                        </div>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>신고 ID</th><th>유형</th><th>신고자</th><th>날짜</th><th>상태</th><th>작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map(r => (
                                    <tr key={r.id}>
                                        <td>{r.id}</td>
                                        <td>{r.type}</td>
                                        <td>{r.reporter}</td>
                                        <td>{r.date}</td>
                                        <td><StatusPill status={r.status === "대기" ? "수정 필요" : (r.status === "완료" ? "활성" : "비활성")} /></td>
                                        <td className="admin-ops">
                                            <button className="admin-link">내용</button>
                                            <button className="admin-link">관리</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="admin-foot right">
                            <Pager page={reportPage} total={3} onPage={setReportPage} />
                        </div>
                    </section>

                    <aside className="admin-sidecol">
                        <section className="admin-panel">
                            <div className="admin-panel-head">
                                <h3>사용자 피드백</h3>
                                <button className="admin-view">모두 보기</button>
                            </div>
                            <ul className="admin-feed">
                                {mockFeedback.map((f, i) => (
                                    <li key={i}>
                                        <img src={f.avatar} alt="" />
                                        <div>
                                            <div className="admin-feed-head"><strong>{f.name}</strong><span>{f.date}</span></div>
                                            <p>{f.text}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
}
