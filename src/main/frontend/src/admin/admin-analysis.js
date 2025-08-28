import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./admin-analysis.css";

export default function AdminAnalysis() {
    const navigate = useNavigate();

    // ===== 더미 데이터 (백엔드 연동 시 교체) =====
    const kpis = [
        { key: "totalUsers", label: "총 사용자", value: 24892, diff: "+12.4%", note: "지난달 대비" },
        { key: "activeUsers", label: "활성 사용자", value: 16753, diff: "+8.7%", note: "지난달 대비" },
        { key: "restaurants", label: "등록된 식당", value: 3456, diff: "+5.2%", note: "지난달 대비" },
        { key: "reviews", label: "작성된 리뷰", value: 42187, diff: "+15.5%", note: "지난달 대비" },
    ];

    const activitySeries = useMemo(
        () => ({
            labels: ["1월 1일", "1월 15일", "2월 1일", "2월 15일", "3월 1일"],
            red: [40, 55, 68, 80, 90],
            teal: [28, 24, 22, 18, 15],
        }),
        []
    );

    const featureUsage = [
        { label: "식당 검색", red: 92, teal: 60 },
        { label: "리뷰 작성", red: 70, teal: 45 },
        { label: "즐겨찾기", red: 52, teal: 40 },
        { label: "예약/핫딜 확인", red: 36, teal: 28 },
        { label: "맛집리스트 추가", red: 24, teal: 18 },
    ];

    const userDist = [
        { label: "20대", value: 42 },
        { label: "30대", value: 28 },
        { label: "40대", value: 18 },
        { label: "기타", value: 12 },
    ];

    const categories = [
        { label: "한식", value: 35 },
        { label: "일식", value: 25 },
        { label: "카페", value: 20 },
        { label: "양식", value: 15 },
        { label: "중식", value: 12 },
    ];

    const regionUsers = [
        { label: "강남구", value: 22 },
        { label: "종로구", value: 15 },
        { label: "마포구", value: 18 },
        { label: "용산구", value: 17 },
        { label: "송파구", value: 14 },
    ];

    const hotKeywords_week = [
        { word: "혼밥 맛집", count: 12458, diff: "+18%" },
        { word: "1인 식당", count: 9872, diff: "+11%" },
        { word: "강남 분식", count: 8763, diff: "+15%" },
        { word: "리뷰 랭킹", count: 7652, diff: "-3%" },
        { word: "복지카드 식당", count: 6594, diff: "+24%" },
    ];

    const insights = [
        {
            title: "사용자 참여 증가",
            desc:
                "최근 3주 새 리뷰·즐겨찾기·가이드를 포함한 활성화 지표가 28% 증가했습니다.",
        },
        {
            title: "트래픽 최적화",
            desc:
                "지난 7~9시에 트래픽이 가장 많습니다. 이 시간대에 새로운 콘텐츠를 노출해 보세요.",
        },
        {
            title: "지역 확장",
            desc:
                "수도권 동북권 사용자 점유율이 증가하고 있습니다. 이 지역을 우선 확장권역으로 추천합니다.",
        },
    ];

    // SVG polyline path 계산
    const buildPath = (arr) => {
        const step = 100 / (arr.length - 1);
        return arr.map((v, i) => `${i * step},${100 - v}`).join(" ");
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
            <div className="admin-analysis-page">
                <div className="admin-analysis-top">
                    <div className="admin-analysis-headings">
                        <h2 className="admin-analysis-title">분석 대시보드</h2>
                    </div>
                    <div className="admin-analysis-actions">
                        <select className="admin-select">
                            <option>최근 7일</option>
                            <option>최근 30일</option>
                            <option>최근 90일</option>
                        </select>
                    </div>
                </div>

                {/* KPI 카드 */}
                <div className="admin-kpi-grid">
                    {kpis.map((k) => (
                        <div key={k.key} className="admin-kpi-slot">
                            <div className="admin-kpi-top">
                                <span className="admin-kpi-label">{k.label}</span>
                            </div>
                            <div className="admin-kpi-value">{k.value.toLocaleString()}</div>
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
                        <section className="admin-slot">
                            <div className="admin-slot-head">
                                <h3 className="admin-slot-title">사용자 활동 추이</h3>
                            </div>
                            <div className="admin-linechart">
                                <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <g className="admin-grid-lines">
                                        {[20, 40, 60, 80].map((y) => (
                                            <line key={y} x1="0" y1={y} x2="100" y2={y} />
                                        ))}
                                    </g>
                                    {/* series */}
                                    <polyline className="admin-line-red" points={buildPath(activitySeries.red)} />
                                    <polyline className="admin-line-teal" points={buildPath(activitySeries.teal)} />
                                </svg>
                                <div className="admin-linechart-legend">
                                    <span className="admin-dot red" /> 방문/이용
                                    <span className="admin-dot teal" /> 이탈/비활성
                                </div>
                                <div className="admin-linechart-x">
                                    {activitySeries.labels.map((l) => (
                                        <span key={l}>{l}</span>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* 사용자 분포 & 인기 카테고리 */}
                        <div className="admin-grid-2col inner-gap">
                            <section className="admin-slot">
                                <div className="admin-slot-head">
                                    <h3 className="admin-slot-title">사용자 분포</h3>
                                </div>
                                <div className="admin-pie-wrap">
                                    <div
                                        className="admin-pie"
                                        style={{
                                            background: `conic-gradient(
                                                var(--admin-red) 0 ${userDist[0].value}%,
                                                var(--admin-teal) ${userDist[0].value}% ${userDist[0].value + userDist[1].value}%,
                                                var(--admin-orange) ${userDist[0].value + userDist[1].value}% ${userDist[0].value + userDist[1].value + userDist[2].value}%,
                                                #e5e7eb ${userDist[0].value + userDist[1].value + userDist[2].value}% 100%
                                                )`,
                                        }}
                                        aria-label="사용자 분포 차트"
                                    />
                                    <ul className="admin-legend">
                                        <li><span className="admin-dot red" />20대 ({userDist[0].value}%)</li>
                                        <li><span className="admin-dot teal" />30대 ({userDist[1].value}%)</li>
                                        <li><span className="admin-dot orange" />40대 ({userDist[2].value}%)</li>
                                        <li><span className="admin-dot gray" />기타 ({userDist[3].value}%)</li>
                                    </ul>
                                </div>
                            </section>

                            {/* 인기 식당 카테고리 (세로 막대) */}
                            <section className="admin-slot">
                                <div className="admin-slot-head">
                                    <h3 className="admin-slot-title">인기 식당 카테고리</h3>
                                </div>
                                <div className="admin-barchart-vert">
                                    {categories.map((c) => (
                                        <div key={c.label} className="admin-barv">
                                            <div className="admin-barv-stick" style={{ height: `${c.value + 10}%` }}>
                                                <div className="admin-barv-red" style={{ height: `${c.value}%` }} />
                                            </div>
                                            <span className="admin-barv-label">{c.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* 혼잡지수 분포 */}
                        <section className="admin-slot">
                            <div className="admin-slot-head">
                                <h3 className="admin-slot-title">혼잡지수 분포</h3>
                            </div>
                            <div className="admin-congestion">
                                <div className="admin-congestion-grid">
                                    {[...Array(5)].map((_, i) => <div key={i} className="admin-cong-row" />)}
                                </div>
                                <div className="admin-congestion-lines">
                                    <div className="admin-cong-line" style={{ width: "60%" }} />
                                    <div className="admin-cong-line" style={{ width: "20%" }} />
                                    <div className="admin-cong-line" style={{ width: "6%" }} />
                                    <div className="admin-cong-line" style={{ width: "52%" }} />
                                </div>
                                <div className="admin-congestion-x">
                                    <span>6.0 만명</span><span>20만</span><span>6.0%</span><span>5.2만/권</span>
                                </div>
                            </div>
                        </section>
                    </div>
                    {/* 우측 컬럼 */}
                    <div className="admin-col">
                        <section className="admin-slot">
                            <div className="admin-slot-head">
                                <h3 className="admin-slot-title">인기 기능 사용률</h3>
                                <select className="admin-select small">
                                    <option>모든 사용자</option>
                                    <option>신규 사용자</option>
                                    <option>재방문 사용자</option>
                                </select>
                            </div>

                            <div className="admin-barchart-hori">
                                {featureUsage.map((f) => (
                                    <div key={f.label} className="admin-barh">
                                        <div className="admin-barh-label">{f.label}</div>
                                        <div className="admin-barh-track">
                                            <div className="admin-barh-red" style={{ width: `${f.red}%` }} />
                                            <div className="admin-barh-teal" style={{ width: `${f.teal}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <ul className="admin-legend">
                                <li><span className="admin-dot red" />주요 지표</li>
                                <li><span className="admin-dot teal" />보조 지표</li>
                            </ul>
                        </section>

                        {/* 지역별 사용자 분포 (가로 막대) */}
                        <section className="admin-slot">
                            <div className="admin-slot-head">
                                <h3 className="admin-slot-title">지역별 사용자 분포</h3>
                            </div>
                            <div className="admin-barchart-list">
                                {regionUsers.map((r) => (
                                    <div key={r.label} className="admin-bar-list-row">
                                        <span className="admin-bar-list-name">{r.label}</span>
                                        <div className="admin-bar-list-track">
                                            <div className="admin-bar-list-fill" style={{ width: `${r.value}%` }} />
                                        </div>
                                        <span className="admin-bar-list-val">{r.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 인기 검색어 */}
                        <section className="admin-slot">
                            <div className="admin-slot-head">
                                <h3 className="admin-slot-title">인기 검색어</h3>
                            </div>
                            <ul className="admin-keyword-list">
                                {hotKeywords_week.map((k, i) => (
                                    <li key={k.word} className="admin-keyword-item">
                                        <span className="admin-keyword-rank">{i + 1}</span>
                                        <div className="admin-keyword-word">{k.word}</div>
                                        <div className="admin-keyword-count">{k.count.toLocaleString()} 검색</div>
                                        <div className={`admin-keyword-diff ${k.diff.startsWith("-") ? "down" : "up"}`}>
                                            {k.diff}
                                        </div>
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
