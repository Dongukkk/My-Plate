import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./site-intro.css";

const ACCENT = "#e74c3c";

const GUEST_CARDS = [
    { title: "빠른 탐색 · 정확한 정보", desc: "혼밥레벨, 거리, 별점, 아동급식카드 사용처로 필터링.", Icon: IconCompass },
    { title: "메뉴 추천 룰렛", desc: "뭘 먹을지 고민될 때 룰렛으로 메뉴를 추천.", Icon: IconSpark },
    { title: "리뷰 · 대기시간 기록", desc: "일시·메뉴 등 구조화 리뷰로 다음 선택이 쉬워집니다.", Icon: IconNote },
    { title: "가게 상세 정보", desc: "환경·영업·접근성 정보를 한눈에 확인.", Icon: IconStore },
    { title: "가격/거리 비교", desc: "지갑과 동선에 맞춰 합리적으로 비교.", Icon: IconChart },
    { title: "정보 정정 제보", desc: "틀린 정보는 제보로 빠르게 수정.", Icon: IconShield },
];

const OWNER_CARDS = [
    { title: "가게 정보 정교 노출", desc: "영업/메뉴/사진 등록으로 검색 결과에 정확히 노출.", Icon: IconStore },
    { title: "아동급식카드 배지", desc: "사용 가능 여부 명확 표기, 변경 시 즉시 업데이트.", Icon: IconCard },
    { title: "정정 제보 대응", desc: "사용자 제보를 검토·반영하여 최신 정보 유지.", Icon: IconShield },
    { title: "리뷰/방문 트렌드", desc: "즐겨찾기·방문 지표를 간단히 확인(향후).", Icon: IconChart },
    { title: "사진/메뉴 관리", desc: "사진·메뉴를 손쉽게 업데이트.", Icon: IconNote },
    { title: "운영 공지 노출", desc: "휴무/이전 등 공지를 손님에게 명확히.", Icon: IconSpark },
];

export default function SiteIntro() {
    const navigate = useNavigate();
    const [tab, setTab] = useState("guest");
    const tabsRef = useRef(null);

    useEffect(() => {
        const initial = (window.location.hash || "").replace("#", "");
        if (initial === "owner") setTab("owner");
    }, []);

    useEffect(() => {
        const next = `#${tab}`;
        if (window.location.hash !== next) window.history.replaceState(null, "", next);
    }, [tab]);

    const onTabsKeyDown = (e) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
        e.preventDefault();
        const btns = Array.from(tabsRef.current.querySelectorAll(".intro-seg-tab"));
        const cur = btns.findIndex((b) => b.dataset.target === tab);
        if (e.key === "Home") return btns[0].click();
        if (e.key === "End") return btns.at(-1).click();
        const next = e.key === "ArrowRight" ? (cur + 1) % btns.length : (cur - 1 + btns.length) % btns.length;
        btns[next].click();
    };

    const cards = tab === "guest" ? GUEST_CARDS : OWNER_CARDS;

    return (
        <div className="intro-simple" style={{ ["--intro-accent"]: ACCENT }}>
            {/* Hero */}
            <header className="intro-hero">
                <div className="intro-hero-inner">
                    <div className="intro-eyebrow">MY PLATE · 서비스 안내</div>
                    <h1 className="intro-hero-title">서비스 소개</h1>
                    <p className="intro-hero-desc">
                        자취생·1인 가구와 <b>아동급식카드</b> 사용자를 위한 지역 음식점 탐색 & 리뷰 서비스.
                        정확한 데이터, 깔끔한 경험을 제공합니다.
                    </p>
                    <div className="intro-hero-actions">
                        <button className="intro-btn intro-btn--ghost" onClick={() => navigate(-1)}>← 뒤로</button>
                        <button className="intro-btn intro-btn--primary" onClick={() => navigate("/restaurantList")}>가게 찾아보기</button>
                    </div>
                </div>
            </header>

            {/* Tabs + Cards */}
            <section className="intro-svc">
                <div className="intro-container">

                    <h2 className="intro-section-title"> {tab === "guest" ? "MY PLATE는 이렇게 이루어집니다." : "사장님께 이런 서비스를 제공합니다."}</h2>
                    <p className="intro-section-sub">{tab === "guest" ? "필터로 빠르게 찾고, 정확하게 비교하고, 쉽게 기록할 수 있습니다." : "정확한 정보 노출과 배지 표기로 손님에게 신뢰를 전달합니다."}</p>

                    <nav className="intro-seg-tabs" role="tablist" aria-label="대상 선택" ref={tabsRef} onKeyDown={onTabsKeyDown}>
                        <button className={`intro-seg-tab ${tab === "guest" ? "intro-is-active" : ""}`} role="tab"
                            aria-selected={tab === "guest"} data-target="guest" onClick={() => setTab("guest")}>손님</button>
                        <button className={`intro-seg-tab ${tab === "owner" ? "intro-is-active" : ""}`} role="tab"
                            aria-selected={tab === "owner"} data-target="owner" onClick={() => setTab("owner")}>사장님</button>
                        <span className={`intro-seg-indicator intro-${tab}`} aria-hidden="true" />
                    </nav>

                    <div className="intro-svc-grid">{cards.map(({ title, desc, Icon }, i) => (<IntroCard key={i} title={title} desc={desc} icon={<Icon />} />))}</div>
                </div>
            </section>
        </div>
    );
}

function IntroCard({ title, desc, icon }) {
    return (
        <article className="intro-svc-card">
            <div className="intro-svc-ico">{icon}</div>
            <h3 className="intro-svc-title">{title}</h3>
            <p className="intro-svc-desc">{desc}</p>
        </article>
    );
}

/* outline icons */
function IconCompass() {
    return (
        <svg viewBox="0 0 24 24" className="intro-ico" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M15 9l-2 4-4 2 2-4 4-2z" />
        </svg>
    );
}
function IconSpark() {
    return (
        <svg viewBox="0 0 24 24" className="intro-ico" aria-hidden="true">
            <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
        </svg>
    );
}
function IconNote() {
    return (
        <svg viewBox="0 0 24 24" className="intro-ico" aria-hidden="true">
            <rect x="6" y="3" width="12" height="14" rx="2" />
            <path d="M9 8h6M9 12h6" />
            <path d="M14 17h4l-4-4z" />
        </svg>
    );
}
function IconStore() {
    return (
        <svg viewBox="0 0 24 24" className="intro-ico" aria-hidden="true">
            <path d="M4 7h16l-1 4H5z" />
            <path d="M5 11h14v8H5z" />
        </svg>
    );
}
function IconCard() {
    return (
        <svg viewBox="0 0 24 24" className="intro-ico" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 10h18" />
        </svg>
    );
}
function IconShield() {
    return (
        <svg viewBox="0 0 24 24" className="intro-ico" aria-hidden="true">
            <path d="M12 3l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7z" />
        </svg>
    );
}
function IconChart() {
    return (
        <svg viewBox="0 0 24 24" className="intro-ico" aria-hidden="true">
            <path d="M4 19h16" />
            <path d="M7 17V9m5 8V5m5 12v-6" />
        </svg>
    );
}
