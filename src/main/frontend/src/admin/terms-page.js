import { useEffect, useState } from "react";
import "./terms-page.css";

const TABS = {
    terms: "이용약관",
    privacy: "개인정보 처리방침",
    images: "이미지 가이드",
};

export default function LegalPage() {
    const [tab, setTab] = useState("terms");

    useEffect(() => {
        const hash = window.location.hash?.replace("#", "");
        if (hash && Object.keys(TABS).includes(hash)) setTab(hash);
    }, []);

    useEffect(() => {
        if (tab) window.history.replaceState(null, "", `#${tab}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [tab]);

    return (
        <div className="terms-page">
            <div className="terms-container">
                <div className="terms-topbar">
                    <h1 className="terms-title">정책 및 가이드</h1>
                    <p className="terms-sub">서비스 이용에 필요한 약관과 안내를 한 곳에서 확인하세요.</p>
                </div>

                <div className="terms-tabs" role="tablist" aria-label="정책 탭">
                    {Object.entries(TABS).map(([key, label]) => (
                        <button
                            key={key}
                            role="tab"
                            aria-selected={tab === key}
                            className={`terms-tab ${tab === key ? "terms-active" : ""}`}
                            onClick={() => setTab(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="terms-card">
                    {tab === "terms" && <Terms />}
                    {tab === "privacy" && <Privacy />}
                    {tab === "images" && <ImagesGuide />}
                </div>

                <div className="terms-meta">
                    <span className="terms-updated">최종 업데이트: 2025-09-01</span>
                    <span className="terms-dot" aria-hidden>·</span>
                    <span>문의: support@example.com</span>
                </div>
            </div>
        </div>
    );
}

/* === 섹션 컴포넌트 === */
function Terms() {
    return (
        <section id="terms">
            <h2>이용약관</h2>
            <p className="terms-lead">
                본 약관은 서비스 이용과 관련하여 회사와 이용자 간의 권리·의무 및 책임 사항을 규정합니다.
            </p>

            <h3>1. 용어의 정의</h3>
            <ul className="terms-bullets">
                <li>“서비스”란 회사가 제공하는 웹/모바일 기반 모든 기능을 말합니다.</li>
                <li>“이용자”란 본 서비스에 접속하여 약관에 따라 서비스를 이용하는 자를 말합니다.</li>
                <li>“콘텐츠”란 이용자가 서비스에 업로드하거나 서비스 내에서 제공되는 모든 자료를 의미합니다.</li>
            </ul>

            <h3>2. 계정 및 보안</h3>
            <ul className="terms-bullets">
                <li>이용자는 정확한 정보를 제공하고 최신 상태로 유지해야 합니다.</li>
                <li>계정의 비밀 유지 책임은 이용자에게 있으며, 계정 오남용에 대한 책임도 이용자에게 있습니다.</li>
            </ul>

            <h3>3. 이용 제한</h3>
            <ul className="terms-bullets">
                <li>불법·유해 정보의 게시, 타인의 권리 침해, 시스템/네트워크 공격 행위를 금지합니다.</li>
                <li>약관 위반 시 게시물 삭제, 이용 제한 또는 해지 조치가 이루어질 수 있습니다.</li>
            </ul>

            <h3>4. 콘텐츠 권리</h3>
            <ul className="terms-bullets">
                <li>이용자는 자신이 업로드한 콘텐츠에 대한 필요한 권리를 보유해야 합니다.</li>
                <li>이용자는 콘텐츠에 대해 회사에 비독점적 사용권을 부여합니다(서비스 제공·운영 목적 한정).</li>
            </ul>

            <h3>5. 면책</h3>
            <ul className="terms-bullets">
                <li>천재지변, 불가항력 또는 이용자 귀책 사유로 인한 손해에 대해 회사는 책임을 지지 않습니다.</li>
                <li>외부 링크 또는 제3자 서비스에 대한 책임은 각 제공사에 있습니다.</li>
            </ul>

            <h3>6. 약관의 변경</h3>
            <ul className="terms-bullets">
                <li>회사는 관련 법령을 준수하여 약관을 변경할 수 있으며, 변경 시 공지합니다.</li>
                <li>변경 이후에도 서비스를 계속 이용하면 변경된 약관에 동의한 것으로 봅니다.</li>
            </ul>
        </section>
    );
}

function Privacy() {
    return (
        <section id="privacy">
            <h2>개인정보 처리방침</h2>
            <p className="terms-lead">
                회사는 개인정보보호법 등 관련 법령을 준수하며 이용자의 개인정보를 안전하게 보호합니다.
            </p>

            <h3>1. 처리 목적 및 수집 항목</h3>
            <ul className="terms-bullets">
                <li>회원가입·본인확인: 이메일, 비밀번호, 이름, 연락처</li>
                <li>서비스 제공·고객지원: 접속기록, 쿠키, 서비스 이용기록</li>
            </ul>

            <h3>2. 보유 및 이용 기간</h3>
            <ul className="terms-bullets">
                <li>회원 탈퇴 시 지체 없이 파기하되, 관계법령에 따라 일정 기간 보관할 수 있습니다.</li>
            </ul>

            <h3>3. 제3자 제공 및 처리위탁</h3>
            <ul className="terms-bullets">
                <li>법령에 근거한 경우를 제외하고 사전 동의 없이 제3자에게 제공하지 않습니다.</li>
                <li>처리위탁 시 수탁자·업무내용·보유기간을 공개하고 관리·감독을 수행합니다.</li>
            </ul>

            <h3>4. 정보주체의 권리</h3>
            <ul className="terms-bullets">
                <li>열람·정정·삭제·처리정지 요구, 동의철회 및 회원탈퇴를 요청할 수 있습니다.</li>
            </ul>

            <h3>5. 안전성 확보 조치</h3>
            <ul className="terms-bullets">
                <li>암호화 저장, 접근권한 통제, 접속기록 보관 등 보호조치를 시행합니다.</li>
            </ul>

            <h3>6. 문의</h3>
            <ul className="terms-bullets">
                <li>개인정보보호 책임자: privacy@example.com</li>
            </ul>
        </section>
    );
}

function ImagesGuide() {
    return (
        <section id="images">
            <h2>이미지 가이드</h2>
            <p className="terms-lead">
                보다 안전하고 깔끔한 서비스 운영을 위해 이미지 업로드 기준과 저작권 안내를 제공합니다.
            </p>

            <h3>1. 업로드 규정</h3>
            <ul className="terms-bullets">
                <li>권리자 동의 없는 저작물, 음란물·폭력물 등은 금지됩니다.</li>
                <li>타인의 초상 포함 시 사전 동의(모델 릴리스)를 권장합니다.</li>
            </ul>

            <h3>2. 권리 및 책임</h3>
            <ul className="terms-bullets">
                <li>이미지의 권리는 업로더에게 있으며, 서비스 운영을 위한 범위 내 사용권을 회사에 부여합니다.</li>
                <li>권리침해 신고 접수 시 검토 후 필요한 조치를 수행합니다: report@example.com</li>
            </ul>

            <h3>3. 품질 권장사항</h3>
            <ul className="terms-bullets">
                <li>권장 해상도: 최소 1080px 이상 / 비율 1:1, 4:3, 16:9 지원</li>
                <li>워터마크·테두리·과도한 필터는 가독성을 해칠 수 있어 지양합니다.</li>
            </ul>
        </section>
    );
}
