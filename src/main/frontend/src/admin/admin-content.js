import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./admin-content.css";

axios.defaults.baseURL = "http://localhost:8080";

export default function AdminContent() {
    const navigate = useNavigate();
    const todayStr = () => new Date().toISOString().slice(0, 10);

    // 검색/정렬/필터 
    const [query, setQuery] = useState("");
    const [sortKey, setSortKey] = useState("date_desc");
    const [filterType, setFilterType] = useState("all");

    // 더미데이터 (백엔드 연동 시 교체) 
    const [pending, setPending] = useState([
        { id: 1, type: "photo", text: "이 사진은 제가 촬영했습니다. 음식은 맛있었고 서비스도 좋았습니다.", user: "김지윤", place: "리빈 이끼밥", date: "2023-11-15" },
        { id: 2, type: "review", text: "정말 좋은 곳입니다. 바삭한 튀김과 친절한 직원분들! 특히 도로변 돈까스 추천!", user: "박서윤", place: "카페 울프", date: "2023-11-14" },
        { id: 3, type: "photo", text: "대전 골목 감성 사진입니다.", user: "이민수", place: "사쿠라 일본 비스트로", date: "2023-11-13" },
        { id: 4, type: "review", text: "오늘도 만족했습니다. 재방문 의사 100!", user: "최호준", place: "리빈 이끼밥", date: "2023-11-12" },
    ]);

    const [reports, setReports] = useState([
        { id: 101, title: "부적절한 콘텐츠 신고", date: "2023-11-15", reason: "식당과 관련 없는 내용을 포함하고 있으며 부적절한 언어가 사용되었습니다.", targetUser: "김지윤", targetPlace: "리빈 이끼밥", targetExcerpt: "해당 내용: 운영 정책 위반 소지가 있고 개인정보가 포함됩니다." },
        { id: 102, title: "부적절한 사진 신고", date: "2023-11-14", reason: "식당과 무관한 사진으로 판단됩니다.", targetUser: "한지민", targetPlace: "비스포크 우노", targetExcerpt: "미리보기 없음" },
    ]);

    const [approved, setApproved] = useState([
        { id: 201, kind: "승지원", date: "2023-11-11", like: 24, tag: "아연 플레이이트" },
        { id: 202, kind: "음식점", date: "2023-11-10", like: 18, tag: "카페 울프", rating: 4.7, text: "맛과 사장님 케어 훌륭, 재방문 의사 100." },
        { id: 203, kind: "공감수", date: "2023-11-09", like: 18, tag: "김지 한수" },
    ]);

    // 거절/무시 묶음 리스트 
    const [moderated, setModerated] = useState([]);

    // 통계/차트 
    const stats = useMemo(() => ({
        todayReviews: 24,
        todayPhotos: 37,
        pendingCount: pending.length,
        reportCount: reports.length,
    }), [pending.length, reports.length]);

    const trend = useMemo(() => [12, 13, 11, 14, 16, 15, 18, 20, 19, 22, 23, 25], []);
    const typeDist = useMemo(() => {
        const photo = pending.filter(p => p.type === "photo").length;
        const review = pending.filter(p => p.type === "review").length;
        return { photo, review, other: 3 };
    }, [pending]);

    const filteredPending = useMemo(() => {
        let rows = [...pending];
        if (filterType !== "all") rows = rows.filter(r => r.type === filterType);
        if (query.trim()) {
            const q = query.trim().toLowerCase();
            rows = rows.filter(r =>
                r.text.toLowerCase().includes(q) ||
                r.user.toLowerCase().includes(q) ||
                r.place.toLowerCase().includes(q)
            );
        }
        rows.sort((a, b) => sortKey === "date_asc" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
        return rows;
    }, [pending, query, sortKey, filterType]);

    // 액션 
    const approvePending = async (id) => {
        const item = pending.find(p => p.id === id);
        if (!item) return;
        setPending(prev => prev.filter(p => p.id !== id));
        setApproved(prev => [{ id: Date.now(), kind: item.type === "photo" ? "사진" : "리뷰", date: todayStr(), like: 0, tag: item.place, text: item.text }, ...prev]);
        try { await axios.post("/api/admin/content/approve", { id }); }
        catch {
            alert("승인 처리 실패. 되돌립니다.");
            setApproved(prev => prev.filter(a => !(a.text === item.text && a.tag === item.place)));
            setPending(prev => [item, ...prev]);
        }
    };

    const rejectPending = async (id) => {
        const item = pending.find(p => p.id === id);
        if (!item) return;
        setPending(prev => prev.filter(p => p.id !== id));
        setModerated(prev => [{ id: Date.now(), kind: "거절됨", source: "pending", date: todayStr(), user: item.user, tag: item.place, text: item.text }, ...prev]);
        try { await axios.post("/api/admin/content/reject", { id }); }
        catch {
            alert("거절 처리 실패. 되돌립니다.");
            setModerated(prev => prev.filter(m => !(m.source === "pending" && m.text === item.text)));
            setPending(prev => [item, ...prev]);
        }
    };

    const ignoreReport = async (id) => {
        const r = reports.find(x => x.id === id);
        if (!r) return;
        setReports(prev => prev.filter(x => x.id !== id));
        setModerated(prev => [{ id: Date.now(), kind: "무시됨", source: "report", date: todayStr(), user: r.targetUser, tag: r.targetPlace, text: `[신고 사유] ${r.reason} / [발췌] ${r.targetExcerpt || "없음"}` }, ...prev]);
        try { await axios.post("/api/admin/reports/ignore", { id }); }
        catch {
            alert("무시 처리 실패. 되돌립니다.");
            setModerated(prev => prev.filter(m => !(m.source === "report" && m.user === r.targetUser && m.tag === r.targetPlace)));
            setReports(prev => [r, ...prev]);
        }
    };

    const deleteReportedContent = async (id) => {
        const r = reports.find(x => x.id === id);
        if (!r) return;
        setReports(prev => prev.filter(x => x.id !== id));
        try { await axios.post("/api/admin/reports/delete-content", { id }); }
        catch {
            alert("삭제/숨김 실패. 되돌립니다.");
            setReports(prev => [r, ...prev]);
        }
    };

    // 캔버스 차트 
    const lineRef = useRef(null);
    const pieRef = useRef(null);
    useEffect(() => {
        const canvas = lineRef.current; if (!canvas) return;
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
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            });
            ctx.lineWidth = 2; ctx.strokeStyle = color; ctx.stroke();
        };
        drawSeries(0, "#e74c3c"); drawSeries(1.5, "#3c9ae7");
    }, [trend]);
    useEffect(() => {
        const canvas = pieRef.current; if (!canvas) return;
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
            ctx.fillStyle = colors[i]; ctx.fill();
            start += angle;
        });
    }, [typeDist]);

    // 상세 모달들
    const [selectedReport, setSelectedReport] = useState(null);
    const [selectedPending, setSelectedPending] = useState(null);

    // 리스트 탭 + 모달 탭 
    const [listTab, setListTab] = useState("approved");
    const approvedPreview = useMemo(() => approved.slice(0, 3), [approved]);
    const moderatedPreview = useMemo(() => moderated.slice(0, 3), [moderated]);

    // "모두 보기" 모달
    const [isListModalOpen, setListModalOpen] = useState(false);
    const [modalTab, setModalTab] = useState("approved");

    // ESC / 스크롤 락 
    const anyModalOpen = !!selectedReport || !!selectedPending || isListModalOpen;
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === "Escape") {
                setSelectedReport(null);
                setSelectedPending(null);
                setListModalOpen(false);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);
    useEffect(() => {
        if (anyModalOpen) document.body.classList.add("admin-no-scroll");
        else document.body.classList.remove("admin-no-scroll");
        return () => document.body.classList.remove("admin-no-scroll");
    }, [anyModalOpen]);

    // JSX 
    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <h2 className="admin-logo"><img src={"https://i.imgur.com/tiY7WKl.png"} alt="My Plate Logo" className="admin-logo-img" /></h2>
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

                {/* 수정 요청 대기 중 */}
                <section className="admin-section admin-pending">
                    <div className="admin-section-header"><h3 className="admin-section-title">수정 요청 대기 중인 콘텐츠</h3></div>

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
                                            <span className={"admin-chip " + (row.type === "photo" ? "admin-chip--photo" : "admin-chip--review")}>
                                                {row.type === "photo" ? "사진" : "리뷰"}
                                            </span>
                                        </td>
                                        <td className="admin-ellipsis">{row.text}</td>
                                        <td>{row.user}</td>
                                        <td className="admin-ellipsis">{row.place}</td>
                                        <td>{row.date}</td>
                                        <td>
                                            <div className="admin-actions">
                                                <button className="admin-bttn admin-bttn--xs admin-bttn--primary" onClick={() => setSelectedPending(row)} title="확인">확인</button>
                                                <button className="admin-bttn admin-bttn--xs admin-bttn--ghost" onClick={() => rejectPending(row.id)} title="거절">거절</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredPending.length === 0 && (
                                    <tr><td colSpan={6} className="admin-empty">대기 중인 콘텐츠가 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className="admin-page-grid">
                    <section className="admin-section admin-reports">
                        <div className="admin-section-header"><h3 className="admin-section-title">신고된 콘텐츠</h3></div>

                        <div className="admin-report-list">
                            {reports.map((r) => (
                                <article key={r.id} className="admin-report-card">
                                    <div className="admin-report-top">
                                        <div className="admin-report-title"><span className="admin-flag"></span> {r.title}</div>
                                        <div className="admin-report-date">{r.date}</div>
                                    </div>
                                    <p className="admin-report-reason">{r.reason}</p>
                                    <div className="admin-report-target"><b>대상</b>: {r.targetUser} · {r.targetPlace}</div>
                                    <div className="admin-report-excerpt">{r.targetExcerpt}</div>
                                    <div className="admin-report-actions">
                                        <button className="admin-bttn admin-bttn--sm admin-bttn--ghost" onClick={() => ignoreReport(r.id)}>무시</button>
                                        <button className="admin-bttn admin-bttn--sm admin-bttn--danger" onClick={() => setSelectedReport(r)}>콘텐츠 확인</button>
                                    </div>
                                </article>
                            ))}
                            {reports.length === 0 && <div className="admin-empty">신고된 항목이 없습니다.</div>}
                        </div>
                    </section>

                    {/* 피드 프리뷰 */}
                    <section className="admin-section">
                        <div className="admin-section-header">
                            <h3 className="admin-section-title">피드</h3>
                            <button className="admin-view" onClick={() => { setModalTab("approved"); setListModalOpen(true); }}>모두 보기</button>
                        </div>
                        <div className="admin-approved-grid">
                            {approvedPreview.map((c) => (
                                <div key={c.id} className="admin-approved-card">
                                    <div className="admin-approved-top">
                                        <div className="admin-approved-kind">{c.kind}</div>
                                        <div className="admin-approved-date">{c.date}</div>
                                    </div>
                                    {c.text && <p className="admin-approved-text">{c.text}</p>}
                                    <div className="admin-approved-bottom"><span className="admin-approved-tag">{c.tag}</span></div>
                                </div>
                            ))}
                            {approvedPreview.length === 0 && (<div className="admin-empty">표시할 항목이 없습니다.</div>)}
                        </div>
                    </section>
                </div>
            </div>

            {/* 모달: 승인/거절 전체 보기 */}
            {isListModalOpen && (
                <div
                    className="admin-modal-overlay"
                    onClick={(e) => { if (e.target.classList.contains("admin-modal-overlay")) setListModalOpen(false); }}
                    role="dialog" aria-modal="true" aria-labelledby="listModalTitle">
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <h3 id="listModalTitle">콘텐츠 전체 보기</h3>
                            <div style={{ display: "flex", gap: 6 }}>
                                <button
                                    className={`admin-bttn admin-bttn--sm ${modalTab === "approved" ? "admin-bttn--primary" : "admin-bttn--ghost"}`}
                                    onClick={() => setModalTab("approved")}>승인됨</button>
                                <button
                                    className={`admin-bttn admin-bttn--sm ${modalTab === "moderated" ? "admin-bttn--primary" : "admin-bttn--ghost"}`}
                                    onClick={() => setModalTab("moderated")}>거절/무시됨</button>
                            </div>
                            <button className="admin-modal-close" onClick={() => setListModalOpen(false)} aria-label="닫기">×</button>
                        </div>
                        <div className="admin-modal-body">
                            {modalTab === "approved" ? (
                                <div className="admin-approved-grid admin-approved-grid--modal">
                                    {approved.map((c) => (
                                        <div key={c.id} className="admin-approved-card">
                                            <div className="admin-approved-top">
                                                <div className="admin-approved-kind">{c.kind}</div>
                                                <div className="admin-approved-date">{c.date}</div>
                                            </div>
                                            {c.text && <p className="admin-approved-text">{c.text}</p>}
                                            <div className="admin-approved-bottom">
                                                <span className="admin-approved-tag">{c.tag}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {approved.length === 0 && <div className="admin-empty">승인된 콘텐츠가 없습니다.</div>}
                                </div>
                            ) : (
                                <div className="admin-approved-grid admin-approved-grid--modal">
                                    {moderated.map((m) => (
                                        <div key={m.id} className="admin-approved-card">
                                            <div className="admin-approved-top">
                                                <div className="admin-approved-kind">{m.kind}</div>
                                                <div className="admin-approved-date">{m.date}</div>
                                            </div>
                                            <p className="admin-approved-text">{m.text}</p>
                                            <div className="admin-approved-bottom">
                                                <span className="admin-approved-tag">{m.user} · {m.tag}</span>
                                                <span className="admin-approved-like">{m.source === "report" ? "신고" : "대기"}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {moderated.length === 0 && <div className="admin-empty">표시할 항목이 없습니다.</div>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* 모달: 신고 상세 */}
            {selectedReport && (
                <div
                    className="admin-modal-overlay"
                    onClick={(e) => { if (e.target.classList.contains("admin-modal-overlay")) setSelectedReport(null); }}
                    role="dialog" aria-modal="true" aria-labelledby="reportModalTitle"
                >
                    <div className="admin-modal admin-modal-report">
                        <div className="admin-modal-header">
                            <h3 id="reportModalTitle">신고 상세</h3>
                            <button className="admin-modal-close" onClick={() => setSelectedReport(null)} aria-label="닫기">×</button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-form-grid">
                                <div className="admin-field"><div className="admin-label">제목</div><div className="admin-inputlike">{selectedReport.title}</div></div>
                                <div className="admin-field"><div className="admin-label">일자</div><div className="admin-inputlike">{selectedReport.date}</div></div>
                                <div className="admin-field"><div className="admin-label">대상 사용자</div><div className="admin-inputlike">{selectedReport.targetUser}</div></div>
                                <div className="admin-field"><div className="admin-label">식당</div><div className="admin-inputlike">{selectedReport.targetPlace}</div></div>
                            </div>
                            <div className="admin-field" style={{ marginTop: 10 }}><div className="admin-label">신고 사유</div><div className="admin-textlike">{selectedReport.reason}</div></div>
                            <div className="admin-field" style={{ marginTop: 6 }}><div className="admin-label">내용</div><div className="admin-textlike">{selectedReport.targetExcerpt || "없음"}</div></div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-bttn admin-bttn--ghost admin-bttn--sm" onClick={() => { ignoreReport(selectedReport.id); setSelectedReport(null); }}>무시</button>
                            <button className="admin-bttn admin-bttn--danger admin-bttn--sm" onClick={() => { deleteReportedContent(selectedReport.id); setSelectedReport(null); }}>콘텐츠 삭제</button>
                        </div>
                    </div>
                </div>
            )}
            {/* 모달: 수정대기 상세 */}
            {selectedPending && (
                <div
                    className="admin-modal-overlay"
                    onClick={(e) => { if (e.target.classList.contains("admin-modal-overlay")) setSelectedPending(null); }}
                    role="dialog" aria-modal="true" aria-labelledby="pendingModalTitle"
                >
                    <div className="admin-modal admin-modal-pending">
                        <div className="admin-modal-header">
                            <h3 id="pendingModalTitle">콘텐츠 상세</h3>
                            <button className="admin-modal-close" onClick={() => setSelectedPending(null)} aria-label="닫기">×</button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-form-grid">
                                <div className="admin-field"><div className="admin-label">유형</div><div className="admin-inputlike">{selectedPending.type === "photo" ? "사진" : "리뷰"}</div></div>
                                <div className="admin-field"><div className="admin-label">제출일</div><div className="admin-inputlike">{selectedPending.date}</div></div>
                                <div className="admin-field"><div className="admin-label">작성자</div><div className="admin-inputlike">{selectedPending.user}</div></div>
                                <div className="admin-field"><div className="admin-label">식당</div><div className="admin-inputlike">{selectedPending.place}</div></div>
                            </div>
                            <div className="admin-field" style={{ marginTop: 10 }}>
                                <div className="admin-label">내용</div>
                                <div className="admin-textlike">{selectedPending.text}</div>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-bttn admin-bttn--primary admin-bttn--sm" onClick={() => { approvePending(selectedPending.id); setSelectedPending(null); }}>승인</button>
                            <button className="admin-bttn admin-bttn--ghost   admin-bttn--sm" onClick={() => { rejectPending(selectedPending.id); setSelectedPending(null); }}>거절</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
