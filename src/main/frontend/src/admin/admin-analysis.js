// AdminAnalysis.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./admin-analysis.css";

axios.defaults.baseURL = "http://localhost:8080";

export default function AdminAnalysis() {
    const navigate = useNavigate();

    // ── 서버 데이터
    const [users, setUsers] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [reportsIPC, setReportsIPC] = useState([]);
    const [reportsOHT, setReportsOHT] = useState([]);
    const [reportsRER, setReportsRER] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── 안전 GET
    const safeGet = async (url) => {
        try {
            const { data } = await axios.get(url);
            const list = Array.isArray(data) ? data : data?.items || data?.rows || data?.list || [];
            return list || [];
        } catch {
            return [];
        }
    };

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

    // ── 유틸
    const getVal = (obj, keys = []) => keys.reduce((acc, k) => (acc ?? obj?.[k]), undefined);
    const pickDate = (row) =>
        new Date(
            getVal(row, ["createdAt"]) ||
            getVal(row, ["created_at"]) ||
            getVal(row, ["created"]) ||
            getVal(row, ["regDate"]) ||
            getVal(row, ["registeredAt"]) ||
            0
        );

    const percent = (n, d) => (d > 0 ? Math.round((n / d) * 100) : 0);
    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const toKRDate = (dt) => `${dt.getMonth() + 1}월 ${dt.getDate()}일`;

    const extractGu = (addr = "") => {
        const m = String(addr).match(/([가-힣]{1,3}구)/);
        return m ? m[1] : "기타";
    };

    const normStatus = (s = "") => {
        const k = String(s).toUpperCase();
        if (k.includes("ACTIVE") || k.includes("활성")) return "ACTIVE";
        if (k.includes("SUSPEND") || k.includes("정지")) return "SUSPENDED";
        if (k.includes("DELETE") || k.includes("비활성")) return "DELETED";
        return "PENDING";
    };

    // 숫자 파싱(문자/undefined 안전)
    const num = (v) => {
        const n = Number(v);
        if (!Number.isNaN(n)) return n;
        const m = String(v ?? "").replace(/[^\d.]/g, "");
        return Number(m) || 0;
    };

    const pickFirstNumber = (...vals) => {
        for (const v of vals) {
            const n = num(v);
            if (n > 0) return n;
        }
        return 0;
    };

    // 평균 평점(0~5)
    const getAvgRating = (r) => {
        const bags = [r, r?.stats, r?.meta, r?.summary, r?.data];
        return pickFirstNumber(
            ...bags.flatMap((o) =>
                !o || typeof o !== "object"
                    ? []
                    : [
                        o.avgRating,
                        o.avg_rating,
                        o.ratingAvg,
                        o.averageRating,
                        o.star_avg,
                        o.starAverage,
                        o.rating,
                        o.overall_rating,
                    ]
            )
        );
    };

    // (동점 보조정렬용) 리뷰 수 추정
    const getReviewCount = (r) => {
        const bags = [r, r?.stats, r?.meta, r?.summary, r?.data, r?.counts, r?.counter];

        const n1 = pickFirstNumber(
            ...bags.flatMap((o) =>
                !o || typeof o !== "object"
                    ? []
                    : [
                        o.review_count,
                        o.reviewCount,
                        o.reviews_count,
                        o.reviewsCount,
                        o.rating_count,
                        o.ratingCount,
                        o.ratings_count,
                        o.ratingsCount,
                        o.totalReviews,
                        o.total_review,
                        o.total_review_count,
                        o.reviewCnt,
                        o.review_cnt,
                        o.cntReview,
                        o.countReview,
                        o.numReviews,
                        o.numberOfReviews,
                    ]
            )
        );
        if (n1 > 0) return n1;

        // 배열 길이로 추정
        let best = 0;
        for (const o of bags) {
            if (!o || typeof o !== "object") continue;
            for (const [k, v] of Object.entries(o)) {
                if (Array.isArray(v) && /review|rating|comment/i.test(k)) {
                    best = Math.max(best, v.length);
                }
            }
        }
        return best;
    };

    // ── 신고 합산
    const allReports = useMemo(
        () => [...reportsIPC, ...reportsOHT, ...reportsRER],
        [reportsIPC, reportsOHT, reportsRER]
    );

    // ── KPI
    const kpis = useMemo(() => {
        const totalUsers = users.length;
        const activeUsers = users.filter((u) => normStatus(u.status) === "ACTIVE").length;
        const totalRestaurants = restaurants.length;

        const totalReviews = restaurants.reduce(
            (sum, r) => sum + (num(r?.rating_count ?? r?.ratingCount) || 0),
            0
        );

        const totalReports = allReports.length;
        const dash = "—";

        return [
            { key: "totalUsers", label: "총 사용자", value: totalUsers, diff: dash, note: "지난달 대비" },
            { key: "activeUsers", label: "활성 사용자", value: activeUsers, diff: dash, note: "지난달 대비" },
            { key: "restaurants", label: "등록된 식당", value: totalRestaurants, diff: dash, note: "지난달 대비" },
            totalReviews > 0
                ? { key: "reviews", label: "작성된 리뷰", value: totalReviews, diff: dash, note: "지난달 대비" }
                : { key: "reports", label: "신고 접수", value: totalReports, diff: dash, note: "지난달 대비" },
        ];
    }, [users, restaurants, allReports]);

    // ── 라인차트(활동 추이) 데이터 + 축/그리드 계산
    const activity = useMemo(() => {
        // 5개의 최근 2주 구간
        const now = new Date();
        const buckets = Array.from({ length: 5 }).map((_, i) => {
            const end = new Date(now);
            end.setDate(end.getDate() - 14 * i);
            const start = new Date(end);
            start.setDate(start.getDate() - 14);
            return { start, end };
        }).reverse();

        // 원시값 집계
        const redRaw = buckets.map(({ start, end }) =>
            users.filter((u) => {
                const d = pickDate(u);
                return d && d >= start && d < end;
            }).length
        );
        const tealRaw = buckets.map(({ start, end }) =>
            users.filter((u) => {
                const d = pickDate(u);
                const inactive = ["SUSPENDED", "DELETED"].includes(normStatus(u.status));
                return d && d >= start && d < end && inactive;
            }).length
        );

        // nice 스케일 계산 (0 ~ niceMax, 4 interval)
        const rawMax = Math.max(1, ...redRaw, ...tealRaw);
        const niceNumber = (x, round = true) => {
            const exp = Math.floor(Math.log10(x));
            const f = x / Math.pow(10, exp);
            let nf;
            if (round) {
                if (f < 1.5) nf = 1;
                else if (f < 3) nf = 2;
                else if (f < 7) nf = 5;
                else nf = 10;
            } else {
                if (f <= 1) nf = 1;
                else if (f <= 2) nf = 2;
                else if (f <= 5) nf = 5;
                else nf = 10;
            }
            return nf * Math.pow(10, exp);
        };
        const targetIntervals = 4;
        const step = Math.max(1, Math.round(niceNumber(rawMax / targetIntervals, true)));
        const niceMax = step * Math.ceil(rawMax / step);
        const ticks = Array.from({ length: targetIntervals + 1 }, (_, i) => i * step); // 0..niceMax

        // 좌표 변환
        const xStep = buckets.length > 1 ? 100 / (buckets.length - 1) : 100;
        const toY = (v) => 100 - (v / Math.max(1, niceMax)) * 100;

        const pointsFrom = (arr) =>
            arr.map((v, i) => `${i * xStep},${toY(v)}`).join(" ");

        const dotsFrom = (arr) =>
            arr.map((v, i) => ({ cx: i * xStep, cy: toY(v) }));

        return {
            labels: buckets.map((b) => toKRDate(b.end)),
            yMax: niceMax,
            ticks, // [0, step, 2step, ... niceMax]
            redPoints: pointsFrom(redRaw),
            tealPoints: pointsFrom(tealRaw),
            redDots: dotsFrom(redRaw),
            tealDots: dotsFrom(tealRaw),
        };
    }, [users]);

    // ── 사용자 분포(도넛)
    const userDist = useMemo(() => {
        const total = Math.max(1, users.length);
        const c = {
            ACTIVE: users.filter((u) => normStatus(u.status) === "ACTIVE").length,
            SUSPENDED: users.filter((u) => normStatus(u.status) === "SUSPENDED").length,
            DELETED: users.filter((u) => normStatus(u.status) === "DELETED").length,
        };
        const etc = total - (c.ACTIVE + c.SUSPENDED + c.DELETED);
        return [
            { label: "활성", value: percent(c.ACTIVE, total) },
            { label: "정지", value: percent(c.SUSPENDED, total) },
            { label: "비활성", value: percent(c.DELETED, total) },
            { label: "기타", value: percent(etc, total) },
        ];
    }, [users]);

    // ── 평점 높은 식당 TOP5 (막대 끝 평점 표시)
    const topRatedTop5 = useMemo(() => {
        const rows = (restaurants || [])
            .map((r) => {
                const rating = getAvgRating(r);   // 0~5
                const count = getReviewCount(r);  // 동점 보조정렬
                const label = String(
                    r?.name ?? r?.restaurantName ?? r?.title ?? (r?.id ? `#${r.id}` : "식당")
                );
                return { label, rating, count };
            })
            .filter((x) => x.rating > 0)
            .sort((a, b) => (b.rating !== a.rating ? b.rating - a.rating : b.count - a.count))
            .slice(0, 5);

        return rows.map((x) => ({
            label: x.label,
            rating: x.rating,
            value: Math.max(2, Math.round((x.rating / 5) * 100)), // 0~100%
        }));
    }, [restaurants]);

    // ── 혼잡지수(간단 3개)
    const congestion = useMemo(() => {
        const totalU = users.length;
        const totalR = restaurants.length;
        const activeRate = percent(
            users.filter((u) => normStatus(u.status) === "ACTIVE").length,
            Math.max(1, totalU)
        );
        return [
            { label: `${totalU.toLocaleString()}명`, width: Math.min(100, Math.round((totalU / Math.max(1, totalU)) * 100)) },
            { label: `${totalR.toLocaleString()}곳`, width: Math.min(100, Math.round((totalR / Math.max(1, totalR)) * 100)) },
            { label: `${activeRate.toFixed(1)}%`, width: Math.min(100, Math.round(activeRate)) },
        ];
    }, [users, restaurants]);

    // ── 지역별 분포
    const regionUsers = useMemo(() => {
        const map = new Map();
        restaurants.forEach((r) => {
            const gu = extractGu(r?.address ?? r?.addr ?? "");
            map.set(gu, (map.get(gu) || 0) + 1);
        });

        const items = [...map.entries()]
            .map(([label, cnt]) => ({ label, cnt }))
            .sort((a, b) => b.cnt - a.cnt)
            .slice(0, 5);

        const total = items.reduce((s, it) => s + it.cnt, 0) || 1;
        const maxCnt = Math.max(1, ...items.map((i) => i.cnt));

        return items.map((i) => ({
            label: i.label,
            value: Math.round((i.cnt / total) * 100),
            width: Math.round((i.cnt / maxCnt) * 100),
        }));
    }, [restaurants]);

    // ── 인기 카테고리
    const hotKeywords_week = useMemo(() => {
        const map = new Map();
        (restaurants || []).forEach((r) => {
            const key = r?.category ?? r?.cate ?? r?.type ?? "기타";
            map.set(key, (map.get(key) || 0) + 1);
        });
        return [...map.entries()]
            .map(([word, count]) => ({ word, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map((it) => ({ ...it, diff: "—" }));
    }, [restaurants]);

    // ── 로딩
    if (loading) {
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
                <div className="admin-analysis-page">
                    <div className="admin-analysis-top">
                        <div className="admin-analysis-headings"><h2 className="admin-analysis-title">분석 대시보드</h2></div>
                        <div className="admin-analysis-actions">
                            <select className="admin-select" disabled>
                                <option>최근 7일</option>
                                <option>최근 30일</option>
                                <option>최근 90일</option>
                            </select>
                        </div>
                    </div>
                    <div className="admin-kpi-grid">
                        {[1, 2, 3, 4].map((i) => (<div key={i} className="admin-kpi-slot skeleton" />))}
                    </div>
                </div>
            </div>
        );
    }

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

            <div className="admin-analysis-page">
                <div className="admin-analysis-top">
                    <div className="admin-analysis-headings"><h2 className="admin-analysis-title">분석 대시보드</h2></div>
                </div>

                {/* KPI */}
                <div className="admin-kpi-grid">
                    {kpis.map((k) => (
                        <div key={k.key} className="admin-kpi-slot">
                            <div className="admin-kpi-top"><span className="admin-kpi-label">{k.label}</span></div>
                            <div className="admin-kpi-value">{Number(k.value || 0).toLocaleString()}</div>
                            <div className="admin-kpi-foot">
                                <span className="admin-kpi-up">{k.diff}</span>
                                <span className="admin-kpi-note">{k.note}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 메인 그리드 */}
                <div className="admin-grid-2col">
                    <div className="admin-col">

                        {/* 사용자 활동 추이 — 컴팩트/클린 (라벨 제거) */}
                        <section className="admin-slot">
                            <div className="admin-slot-head"><h3 className="admin-slot-title">사용자 활동 추이</h3></div>

                            <div
                                className="admin-linechart admin-linechart--compact"
                                style={{ position: "relative", paddingLeft: 44, overflow: "hidden" }}
                            >
                                {/* Y축 라벨(HTML 오버레이) */}
                                <div
                                    style={{
                                        position: "absolute",
                                        left: 8,
                                        top: 6,
                                        bottom: 28,
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        fontSize: 11,
                                        color: "#9ca3af",
                                        pointerEvents: "none",
                                        paddingBottom: 15,
                                    }}
                                >
                                    {activity.ticks.map((t, i) => (
                                        <span key={i}>{t.toLocaleString()}명</span>
                                    ))}
                                </div>

                                {/* SVG Chart */}
                                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: "block", width: "90%", height: 140 }}>
                                    {/* 가로 그리드 */}
                                    <g>
                                        {activity.ticks.map((t, i) => {
                                            const y = 100 - (t / Math.max(1, activity.yMax)) * 100;
                                            return <line key={i} x1="0" x2="100" y1={y} y2={y} stroke="#eef2f7" strokeWidth="0.7" />;
                                        })}
                                    </g>

                                    {/* 데이터 라인 */}
                                    <polyline className="admin-line-teal" points={activity.tealPoints} />
                                    <polyline className="admin-line-red" points={activity.redPoints} />

                                    {/* 포인트 */}
                                    {activity.tealDots.map((p, i) => (
                                        <circle key={`t-${i}`} cx={p.cx} cy={p.cy} r="0.9" fill="#20b2aa" />
                                    ))}
                                    {activity.redDots.map((p, i) => (
                                        <circle key={`r-${i}`} cx={p.cx} cy={p.cy} r="1.1" fill="#e74c3c" />
                                    ))}
                                </svg>

                                {/* 범례 & X축 */}
                                <div className="admin-linechart-x">
                                    {activity.labels.map((l) => (
                                        <span key={l}>{l}</span>
                                    ))}
                                </div>
                                <div className="admin-linechart-legend" style={{ marginTop: 8 }}>
                                    <span className="admin-dot red" /> 방문/이용
                                    <span className="admin-dot teal" /> 이탈/비활성
                                </div>
                            </div>
                        </section>

                        {/* 사용자 분포 + 평점 TOP5 */}
                        <div className="admin-grid-2col inner-gap">
                            {/* 도넛 */}
                            <section className="admin-slot">
                                <div className="admin-slot-head"><h3 className="admin-slot-title">사용자 분포</h3></div>
                                <div className="admin-pie-wrap">
                                    <div
                                        className="admin-pie"
                                        aria-label="사용자 분포 차트"
                                        style={{
                                            background: `conic-gradient(
                        var(--admin-red) 0 ${userDist[0]?.value || 0}%,
                        var(--admin-teal) ${userDist[0]?.value || 0}% ${(userDist[0]?.value || 0) + (userDist[1]?.value || 0)}%,
                        var(--admin-orange) ${(userDist[0]?.value || 0) + (userDist[1]?.value || 0)}% ${(userDist[0]?.value || 0) + (userDist[1]?.value || 0) + (userDist[2]?.value || 0)}%,
                        #e5e7eb ${(userDist[0]?.value || 0) + (userDist[1]?.value || 0) + (userDist[2]?.value || 0)}% 100%
                      )`,
                                        }}
                                    />
                                    <ul className="admin-legend">
                                        <li><span className="admin-dot red" />활성 ({userDist[0]?.value ?? 0}%)</li>
                                        <li><span className="admin-dot teal" />정지 ({userDist[1]?.value ?? 0}%)</li>
                                        <li><span className="admin-dot orange" />비활성 ({userDist[2]?.value ?? 0}%)</li>
                                        <li><span className="admin-dot gray" />기타 ({userDist[3]?.value ?? 0}%)</li>
                                    </ul>
                                </div>
                            </section>

                            {/* 평점 높은 식당 TOP5 */}
                            <section className="admin-slot">
                                <div className="admin-slot-head"><h3 className="admin-slot-title">평점 높은 식당 TOP5</h3></div>
                                <div className="admin-barchart-vert">
                                    {topRatedTop5.map((it) => (
                                        <div key={it.label} className="admin-barv" style={{ position: "relative" }}>
                                            <div className="admin-barv-stick">
                                                <div className="admin-barv-red" style={{ height: `${it.value}%` }} />
                                            </div>
                                            {/* 막대 끝 평점 */}
                                            <span
                                                className="admin-barv-val"
                                                style={{
                                                    position: "absolute",
                                                    left: "50%",
                                                    transform: "translateX(-50%)",
                                                    bottom: `calc(${it.value}% + 6px)`,
                                                    fontSize: 11,
                                                    color: "#bbc0c7ff",
                                                    whiteSpace: "nowrap",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {it.rating.toFixed(1)}
                                            </span>
                                            <span className="admin-barv-label">{it.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* 혼잡지수 분포 */}
                        <section className="admin-slot">
                            <div className="admin-slot-head"><h3 className="admin-slot-title">혼잡지수 분포</h3></div>
                            <div className="admin-congestion">
                                <div className="admin-congestion-grid">
                                    {[...Array(4)].map((_, i) => (<div key={i} className="admin-cong-row" />))}
                                </div>
                                <div className="admin-congestion-lines">
                                    {congestion.map((c, i) => (
                                        <div key={i} className="admin-cong-line" style={{ width: `${c.width}%` }}>
                                            <span className="admin-cong-xlabel">{c.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* 우측 컬럼 */}
                    <div className="admin-col">
                        {/* 기능 사용률 */}
                        <section className="admin-slot">
                            <div className="admin-slot-head"><h3 className="admin-slot-title">기능 사용률</h3></div>
                            <div className="admin-barchart-hori">
                                {(() => {
                                    const totalR = Math.max(1, restaurants.length);
                                    const activeR = restaurants.filter((r) => normStatus(r.status) === "ACTIVE").length;
                                    const activeRRate = Math.min(100, Math.round((activeR / totalR) * 100));

                                    const totalRep = allReports.length || 1;
                                    const resolved = allReports.filter(
                                        (x) =>
                                            String(x.status || "").toUpperCase().includes("RESOLVED") ||
                                            String(x.decision || "").toUpperCase().includes("RESOLVED")
                                    ).length;
                                    const pending = allReports.filter((x) =>
                                        String(x.status || "").toUpperCase().includes("PENDING")
                                    ).length;

                                    const resolvedRate = Math.round((resolved / totalRep) * 100);
                                    const pendingRate = Math.round((pending / totalRep) * 100);

                                    const featureUsage = [
                                        { key: "activeRate", label: "활성 식당 비율", red: activeRRate, teal: 100 - activeRRate, right: `${activeRRate}%` },
                                        { key: "resolveRate", label: "신고 처리율", red: resolvedRate, teal: pendingRate, right: `${resolvedRate}%` },
                                    ];

                                    return featureUsage.map((f) => (
                                        <div key={f.key} className="admin-barh" style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 12 }}>
                                            <div>
                                                <div className="admin-barh-label">{f.label}</div>
                                                <div className="admin-barh-track">
                                                    <div className="admin-barh-red" style={{ width: `${f.red}%` }} />
                                                    <div className="admin-barh-teal" style={{ width: `${f.teal}%` }} />
                                                </div>
                                            </div>
                                            <div className="admin-bar-list-val" style={{ minWidth: 28, marginTop: 12 }}>{f.right}</div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </section>

                        {/* 지역별 사용자 분포 */}
                        <section className="admin-slot">
                            <div className="admin-slot-head"><h3 className="admin-slot-title">지역별 사용자 분포</h3></div>
                            <div className="admin-barchart-list">
                                {regionUsers.map((r) => (
                                    <div key={r.label} className="admin-bar-list-row">
                                        <span className="admin-bar-list-name">{r.label}</span>
                                        <div className="admin-bar-list-track"><div className="admin-bar-list-fill" style={{ width: `${r.width}%` }} /></div>
                                        <span className="admin-bar-list-val">{r.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 인기 카테고리 */}
                        <section className="admin-slot">
                            <div className="admin-slot-head"><h3 className="admin-slot-title">인기 카테고리</h3></div>
                            <ul className="admin-keyword-list">
                                {hotKeywords_week.map((k, i) => (
                                    <li key={k.word} className="admin-keyword-item">
                                        <span className="admin-keyword-rank">{i + 1}</span>
                                        <div className="admin-keyword-word">{k.word}</div>
                                        <div className="admin-keyword-count">{k.count.toLocaleString()} 검색</div>
                                        <div className={`admin-keyword-diff ${String(k.diff).startsWith("-") ? "down" : "up"}`}>{k.diff}</div>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
