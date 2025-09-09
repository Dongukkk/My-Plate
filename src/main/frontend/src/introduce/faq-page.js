// Footer에서 /faq 로 연결 (예: /faq#mealcard 로 특정 탭 직접 진입)
// 사이트 콘셉트: 음식점 정보 공유·리뷰 플랫폼 + 아동급식카드 연동
import { useEffect, useMemo, useState } from "react";
import "./faq-page.css";

/* ===== 탭 정의(전체보기 제거) ===== */
const FAQ_CATEGORIES = [
    { key: "intro", label: "서비스 소개" },
    { key: "search", label: "식당 탐색/지도" },
    { key: "reviews", label: "리뷰/사진 가이드" },
    { key: "mealcard", label: "아동급식카드" },
    { key: "merchants", label: "가맹점/결제" },
    { key: "account", label: "회원/보안" },
    { key: "policy", label: "신고/운영정책" },
];

/* ===== 프로젝트 맞춤 FAQ 데이터 ===== */
const FAQ_DATA = {
    intro: [
        {
            q: "이 서비스는 무엇인가요?",
            a: "지역 음식점 정보를 공유하고 리뷰를 남길 수 있는 플랫폼입니다. ‘아동급식카드 가능’ 식당을 손쉽게 찾고, 이용후기를 통해 안전하고 합리적인 식사를 돕습니다."
        },
        {
            q: "앱 설치가 필요한가요?",
            a: "웹앱 기반이라 모바일/PC 브라우저에서 바로 이용할 수 있습니다. 모바일에서는 ‘홈 화면에 추가’로 앱처럼 사용 가능합니다."
        },
        {
            q: "푸터의 정책·가이드는 어떤 내용인가요?",
            a: "이용약관, 개인정보 처리방침, 이미지 가이드, FAQ를 제공합니다. 주요 변경 사항은 서비스 내 공지로 안내합니다."
        },
    ],

    search: [
        {
            q: "아동급식카드 사용 가능한 식당만 보고 싶어요.",
            a: "탐색/지도 상단의 필터에서 ‘급식카드 가능’을 켜면 해당 배지가 있는 식당만 표시됩니다. 상세 페이지에서도 ‘급식카드 가능’ 여부를 확인할 수 있습니다."
        },
        {
            q: "메뉴·가격 정보가 실제와 달라요.",
            a: "현장 변동(가격/메뉴/영업시간)이 있을 수 있습니다. 상세 페이지의 ••• 메뉴에서 ‘정보 제보’를 보내주시면 검수 후 반영합니다."
        },
        {
            q: "저장/공유는 어떻게 하나요?",
            a: "식당 카드의 북마크 아이콘으로 내 보관함에 저장할 수 있고, 공유 버튼으로 링크를 복사해 지인과 공유할 수 있습니다."
        },
        {
            q: "지도가 느리거나 위치가 정확하지 않아요.",
            a: "네트워크 환경과 브라우저 위치 권한을 확인해 주세요. 권한이 꺼져 있으면 주변 추천 정확도가 떨어질 수 있습니다."
        },
    ],

    reviews: [
        {
            q: "리뷰 작성 규칙은 무엇인가요?",
            a: "욕설·비방·허위정보·광고성 홍보는 금지됩니다. 방문 경험을 바탕으로 음식/위생/가격/접근성 등 구체적인 정보를 남겨주세요."
        },
        {
            q: "사진 업로드 가이드는요?",
            a: "타인의 얼굴·개인정보가 식별되지 않도록 주의해 주세요. 과도한 보정/워터마크/저작권 위반 이미지는 삭제될 수 있습니다."
        },
        {
            q: "리뷰 수정/삭제가 가능한가요?",
            a: "내 프로필 > 리뷰 목록에서 수정/삭제할 수 있습니다. 운영정책 위반 시 사전 경고 없이 숨김/삭제될 수 있습니다."
        },
        {
            q: "평점 기준은 어떻게 되나요?",
            a: "별점은 0.5 단위로 남길 수 있으며, 종합 평점은 최근성과 신뢰도를 반영해 집계됩니다."
        },
    ],

    mealcard: [
        {
            q: "아동급식카드는 무엇인가요?",
            a: "지자체가 결식 우려 아동에게 식사비를 바우처 형태로 제공하는 복지카드입니다. 본 서비스는 ‘급식카드 가능’ 식당을 쉽게 찾도록 돕습니다."
        },
        {
            q: "신청/자격/가맹점 정보는 어디서 확인하나요?",
            a: "푸터의 ‘아동급식카드 안내’ 페이지에서 신청 방법, 자격 요건, 가맹점, 잔액 조회, 분실/재발급 절차를 단계별로 안내합니다."
        },
        {
            q: "카드 사용 제한이 있나요?",
            a: "지자체 정책에 따라 허용 업종·사용 시간·품목이 제한될 수 있습니다. 상세 기준은 ‘아동급식카드 안내’ 페이지에서 확인하세요."
        },
        {
            q: "분실했는데 어떻게 해야 하나요?",
            a: "전용 안내 페이지의 ‘분실/정지’ 절차에 따라 즉시 정지 후 재발급을 신청하세요. 임시 카드 사용 안내는 지자체 지침을 따릅니다."
        },
    ],

    merchants: [
        {
            q: "어떤 식당에서 급식카드를 사용할 수 있나요?",
            a: "상세 페이지에서 ‘급식카드 가능’ 배지가 표시되며, 지도 필터로 한 번에 모아볼 수 있습니다. 방문 전 영업시간·휴무는 전화 확인을 권장합니다."
        },
        {
            q: "결제가 실패해요.",
            a: "카드 한도, 사용 제한 시간/업종, 단말기 오류 등이 원인일 수 있습니다. 다른 결제수단을 시도하거나 매장/발급기관에 문의해 주세요."
        },
        {
            q: "영수증/사용 내역은 어디에서 보나요?",
            a: "매장 영수증과 발급기관(또는 전용 앱/웹)의 거래 내역에서 확인할 수 있습니다. 사이트 내 ‘내 활동’에는 리뷰·북마크 기록만 저장됩니다."
        },
    ],

    account: [
        {
            q: "회원가입/로그인은 어떻게 하나요?",
            a: "이메일 또는 소셜 계정으로 가입할 수 있습니다. 최초 로그인 시 닉네임과 관심 카테고리를 설정하면 추천 품질이 좋아집니다."
        },
        {
            q: "비밀번호를 잊었어요.",
            a: "로그인 화면의 ‘비밀번호 찾기’에서 재설정 링크를 받아 변경하세요. 공용 PC에서는 ‘모든 기기 로그아웃’을 권장합니다."
        },
        {
            q: "계정 보안을 강화하고 싶어요.",
            a: "설정 > 보안에서 2단계 인증을 활성화하고, 주기적으로 비밀번호를 변경해 주세요."
        },
        {
            q: "회원 탈퇴 시 데이터는 어떻게 되나요?",
            a: "법령상 보관이 필요한 최소 정보를 제외한 나머지 데이터는 익명화/삭제 처리됩니다. 자세한 내용은 개인정보 처리방침을 확인하세요."
        },
    ],

    policy: [
        {
            q: "허위 정보/부적절한 리뷰는 어떻게 신고하나요?",
            a: "리뷰 우측 상단 ••• 메뉴에서 신고 사유를 선택해 제출하세요. 운영정책에 따라 심사 후 경고/숨김/삭제/제재가 이뤄질 수 있습니다."
        },
        {
            q: "이미지 저작권과 사용 규칙은?",
            a: "이용자가 업로드한 이미지의 저작권은 이용자에게 있으며, 타인의 권리를 침해해서는 안 됩니다. 세부 규칙은 ‘이미지 가이드’를 참고해 주세요."
        },
        {
            q: "약관/개인정보 변경은 어떻게 안내되나요?",
            a: "중요 변경은 서비스 내 공지와(동의자) 이메일로 사전 안내합니다. 시행일 이후 계속 이용 시 변경 약관에 동의한 것으로 간주됩니다."
        },
    ],
};

/* ===== 해시 유틸 ===== */
const getHash = () =>
    (typeof window !== "undefined" ? window.location.hash.replace("#", "") : "");
const initialTab = () => {
    const h = getHash();
    const exists = FAQ_CATEGORIES.some(c => c.key === h);
    return exists ? h : FAQ_CATEGORIES[0].key; // 첫 탭으로 기본 진입 (intro)
};

export default function FAQPage() {
    const [active, setActive] = useState(initialTab);

    useEffect(() => {
        const onHash = () => {
            const h = getHash();
            if (h) setActive(h);
        };
        window.addEventListener("hashchange", onHash);
        return () => window.removeEventListener("hashchange", onHash);
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            if (getHash() !== active) {
                window.history.replaceState(null, "", `#${active}`);
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [active]);

    const list = useMemo(() => FAQ_DATA[active] ?? [], [active]);
    const activeLabel =
        FAQ_CATEGORIES.find(c => c.key === active)?.label ?? "FAQ";

    return (
        <main className="FAQ-page">
            <div className="FAQ-container">
                {/* 상단 바 */}
                <div className="FAQ-topbar">
                    <h1 className="FAQ-title">FAQ · 자주 묻는 질문</h1>
                    <p className="FAQ-sub">
                        음식점 정보 공유·리뷰 · 아동급식카드 가맹점/결제 안내 · 신고/정책 가이드
                    </p>
                </div>

                {/* 탭 */}
                <div className="FAQ-tabs" role="tablist" aria-label="FAQ Categories">
                    {FAQ_CATEGORIES.map(cat => (
                        <button
                            key={cat.key}
                            role="tab"
                            aria-selected={active === cat.key}
                            className={`FAQ-tab ${active === cat.key ? "FAQ-active" : ""}`}
                            onClick={() => setActive(cat.key)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* 본문 카드 */}
                <section className="FAQ-card" role="region" aria-live="polite">
                    <h2>{activeLabel}</h2>
                    <p className="FAQ-lead">아래 항목에서 원하는 답변을 찾아보세요.</p>

                    <ul className="FAQ-bullets">
                        {list.map((it, i) => (
                            <li key={i}>
                                <h3>Q. {it.q}</h3>
                                <p>A. {it.a}</p>
                            </li>
                        ))}
                    </ul>

                    <div className="FAQ-meta">
                        <span className="FAQ-updated">최종 업데이트 2025-09-09</span>
                        <span className="FAQ-dot">•</span>
                        <span>항목 {list.length}개</span>
                    </div>
                </section>
            </div>
        </main>
    );
}
