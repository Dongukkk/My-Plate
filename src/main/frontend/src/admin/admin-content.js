import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin-content.css";

export default function AdminContent() {
    const navigate = useNavigate();

    // 검색/정렬/필터
    const [query, setQuery] = useState("");
    const [sortKey, setSortKey] = useState("date_desc");
    const [filterType, setFilterType] = useState("all");

    // ===== 더미데이터 (백엔드 붙일 때 교체) =====
    const [pending, setPending] = useState([
        {
            id: 1,
            type: "photo",
            text: "이 사진은 제가 촬영했습니다. 음식은 맛있었고 서비스도 좋았습니다.",
            user: "김지윤",
            place: "리빈 이끼밥",
            date: "2023-11-15",
        },
        {
            id: 2,
            type: "review",
            text: "정말 좋은 곳입니다. 바삭한 튀김과 친절한 직원분들! 특히 도로변 돈까스 추천!",
            user: "박서윤",
            place: "카페 울프",
            date: "2023-11-14",
        },
        {
            id: 3,
            type: "photo",
            text: "대전 골목 감성 사진입니다.",
            user: "이민수",
            place: "사쿠라 일본 비스트로",
            date: "2023-11-13",
        },
        {
            id: 4,
            type: "review",
            text: "오늘도 만족했습니다. 재방문 의사 100!",
            user: "최호준",
            place: "리빈 이끼밥",
            date: "2023-11-12",
        },
    ]);

    const [reports, setReports] = useState([
        {
            id: 101,
            title: "부적절한 콘텐츠 신고",
            date: "2023-11-15",
            reason:
                "식당과 관련 없는 내용을 포함하고 있으며 부적절한 언어가 사용되었습니다.",
            targetUser: "김지윤",
            targetPlace: "리빈 이끼밥",
            targetExcerpt:
                "해당 내용: 운영 정책 위반 소지가 있고 개인정보가 포함됩니다.",
        },
        {
            id: 102,
            title: "부적절한 사진 신고",
            date: "2023-11-14",
            reason: "식당과 무관한 사진으로 판단됩니다.",
            targetUser: "한지민",
            targetPlace: "비스포크 우노",
            targetExcerpt: "미리보기 없음",
        },
    ]);

    const [approved, setApproved] = useState([
        { id: 201, kind: "승지원", date: "2023-11-11", like: 24, tag: "아연 플레이이트" },
        {
            id: 202,
            kind: "음식점",
            date: "2023-11-10",
            like: 18,
            tag: "카페 울프",
            rating: 4.7,
            text: "맛과 사장님 케어 훌륭, 재방문 의사 100.",
        },
        { id: 203, kind: "공감수", date: "2023-11-09", like: 18, tag: "김지 한수" },
    ]);

    // ===== 통계 값 =====
    const stats = useMemo(() => {
        const todayReviews = 24;
        const todayPhotos = 37;
        const pendingCount = pending.length;
        const reportCount = reports.length;
        return { todayReviews, todayPhotos, pendingCount, reportCount };
    }, [pending.length, reports.length]);

    // ===== 차트용 데이터 =====
    const trend = useMemo(
        () => [12, 13, 11, 14, 16, 15, 18, 20, 19, 22, 23, 25],
        []
    );
    const typeDist = useMemo(() => {
        const photo = pending.filter((p) => p.type === "photo").length;
        const review = pending.filter((p) => p.type === "review").length;
        const other = 3; // 예시
        return { photo, review, other };
    }, [pending]);

    // ===== 필터링/정렬 =====
    const filteredPending = useMemo(() => {
        let rows = [...pending];
        if (filterType !== "all") rows = rows.filter((r) => r.type === filterType);
        if (query.trim()) {
            const q = query.trim().toLowerCase();
            rows = rows.filter(
                (r) =>
                    r.text.toLowerCase().includes(q) ||
                    r.user.toLowerCase().includes(q) ||
                    r.place.toLowerCase().includes(q)
            );
        }
        rows.sort((a, b) => {
            if (sortKey === "date_asc") return a.date.localeCompare(b.date);
            return b.date.localeCompare(a.date);
        });
        return rows;
    }, [pending, query, sortKey, filterType]);

    // ===== 작업 핸들러 =====
    const handleApprove = (id) => {
        const item = pending.find((p) => p.id === id);
        // TODO: axios.post("/api/admin/content/approve", { id })
        setPending((prev) => prev.filter((p) => p.id !== id));
        if (item)
            setApproved((prev) => [
                { id: Date.now(), kind: item.type === "photo" ? "사진" : "리뷰", date: "2023-11-15", like: 0, tag: item.place, text: item.text },
                ...prev,
            ]);
    };

    const handleReject = (id) => {
        // TODO: axios.post("/api/admin/content/reject", { id })
        setPending((prev) => prev.filter((p) => p.id !== id));
    };

    const handleIgnoreReport = (id) => {
        // TODO: axios.post("/api/admin/reports/ignore", { id })
        setReports((prev) => prev.filter((r) => r.id !== id));
    };
    const handleDeleteReportedContent = (id) => {
        // TODO: axios.post("/api/admin/reports/delete-content", { id })
        setReports((prev) => prev.filter((r) => r.id !== id));
    };

    // ===== 캔버스 차트 렌더링 =====
    const lineRef = useRef(null);
    const pieRef = useRef(null);

    useEffect(() => {
        // line
        const canvas = lineRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const w = (canvas.width = canvas.clientWidth);
        const h = (canvas.height = canvas.clientHeight);
        ctx.clearRect(0, 0, w, h);

        const max = Math.max(...trend) || 1;
        const stepX = w / (trend.length - 1 || 1);

        const drawSeries = (offset = 0, color = "#e74c3c") => {
            ctx.beginPath();
            trend.forEach((v, i) => {
                const x = i * stepX;
                const y = h - ((v + offset) / (max + 3)) * (h - 10) - 5;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.lineWidth = 2;
            ctx.strokeStyle = color;
            ctx.stroke();
        };
        drawSeries(0, "#e74c3c");
        drawSeries(1.5, "#3c9ae7");
    }, [trend]);

    useEffect(() => {
        // pie
        const canvas = pieRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const w = (canvas.width = canvas.clientWidth);
        const h = (canvas.height = canvas.clientHeight);
        ctx.clearRect(0, 0, w, h);

        const data = [typeDist.photo, typeDist.review, typeDist.other];
        const colors = ["#e74c3c", "#3c9ae7", "#f6ad55"];
        const total = data.reduce((a, b) => a + b, 0) || 1;
        let start = -Math.PI / 2;
        data.forEach((val, i) => {
            const angle = (val / total) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(w / 2, h / 2);
            ctx.arc(w / 2, h / 2, Math.min(w, h) / 2 - 6, start, start + angle);
            ctx.closePath();
            ctx.fillStyle = colors[i];
            ctx.fill();
            start += angle;
        });
    }, [typeDist]);

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
            <div className="admin-content-page">
                {/* 상단 */}
                <div className="admin-content-header">
                    <div>
                        <h2 className="admin-content-title">콘텐츠 관리</h2>
                    </div>
                </div>

                {/* 대기중 콘텐츠 */}
                <section className="admin-section admin-pending">
                    <div className="admin-section-header">
                        <h3 className="admin-section-title">수정 요청 대기 중인 콘텐츠</h3>
                    </div>

                    <div className="admin-desk-wrap">
                        <table className="admin-desk admin-pending-desk">
                            <thead>
                                <tr>
                                    <th className="admin-col-type">유형</th>
                                    <th className="admin-col-content">콘텐츠</th>
                                    <th className="admin-col-user">사용자</th>
                                    <th className="admin-col-place">식당</th>
                                    <th className="admin-col-date">제출일</th>
                                    <th className="admin-col-actions">작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPending.map((row) => (
                                    <tr key={row.id}>
                                        <td>
                                            <span
                                                className={
                                                    "admin-chip " +
                                                    (row.type === "photo"
                                                        ? "admin-chip--photo"
                                                        : "admin-chip--review")
                                                }
                                            >
                                                {row.type === "photo" ? "사진" : "리뷰"}
                                            </span>
                                        </td>
                                        <td className="admin-ellipsis">{row.text}</td>
                                        <td>{row.user}</td>
                                        <td className="admin-ellipsis">{row.place}</td>
                                        <td>{row.date}</td>
                                        <td>
                                            <div className="admin-actions">
                                                <button
                                                    className="admin-bttn admin-bttn--xs admin-bttn--primary"
                                                    onClick={() => handleApprove(row.id)}
                                                    title="승인"
                                                >
                                                    승인
                                                </button>
                                                <button
                                                    className="admin-bttn admin-bttn--xs admin-bttn--ghost"
                                                    onClick={() => handleReject(row.id)}
                                                    title="보류/삭제"
                                                >
                                                    보류
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredPending.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="admin-empty">
                                            대기 중인 콘텐츠가 없습니다.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className="admin-page-grid">
                    {/* 신고된 콘텐츠 */}
                    <section className="admin-section admin-reports">
                        <div className="admin-section-header">
                            <h3 className="admin-section-title">신고된 콘텐츠</h3>
                        </div>

                        <div className="admin-report-list">
                            {reports.map((r) => (
                                <article key={r.id} className="admin-report-card">
                                    <div className="admin-report-top">
                                        <div className="admin-report-title">
                                            <span className="admin-flag"></span> {r.title}
                                        </div>
                                        <div className="admin-report-date">{r.date}</div>
                                    </div>
                                    <p className="admin-report-reason">{r.reason}</p>
                                    <div className="admin-report-target">
                                        <b>대상</b>: {r.targetUser} · {r.targetPlace}
                                    </div>
                                    <div className="admin-report-excerpt">{r.targetExcerpt}</div>
                                    <div className="admin-report-actions">
                                        <button
                                            className="admin-bttn admin-bttn--sm admin-bttn--ghost"
                                            onClick={() => handleIgnoreReport(r.id)}
                                        >
                                            무시
                                        </button>
                                        <button
                                            className="admin-bttn admin-bttn--sm admin-bttn--danger"
                                            onClick={() => handleDeleteReportedContent(r.id)}
                                        >
                                            콘텐츠 확인
                                        </button>
                                    </div>
                                </article>
                            ))}
                            {reports.length === 0 && (
                                <div className="admin-empty">신고된 항목이 없습니다.</div>
                            )}
                        </div>
                    </section>

                    {/* 최근 승인된 콘텐츠 */}
                    <section className="admin-section admin-approved">
                        <div className="admin-section-header">
                            <h3 className="admin-section-title">최근 승인된 콘텐츠</h3>
                            <button className="admin-view">모두 보기</button>
                        </div>

                        <div className="admin-approved-grid">
                            {approved.map((c) => (
                                <div key={c.id} className="admin-approved-card">
                                    <div className="admin-approved-top">
                                        <div className="admin-approved-kind">{c.kind}</div>
                                        <div className="admin-approved-date">{c.date}</div>
                                    </div>
                                    {c.text && <p className="admin-approved-text">{c.text}</p>}
                                    <div className="admin-approved-bottom">
                                        <span className="admin-approved-tag">{c.tag}</span>
                                        <span className="admin-approved-like">❤ {c.like}</span>
                                        {typeof c.rating === "number" && (
                                            <span className="admin-approved-rating">★ {c.rating}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
