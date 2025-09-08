import "./card-intro.css";

const DEFAULT_LINKS = {
    apply: "/mealcard/apply",
    eligibility: "/mealcard/eligibility",
    merchants: "/mealcard/merchants",
    balance: "/mealcard/balance",
    lost: "/mealcard/lost",
    benefits: "/mealcard/benefits",
    partner: "/mealcard/partner",
    support: "/support",
    notice: "/notice",
};

export default function LunchCardIntro({ links = {} }) {
    const L = { ...DEFAULT_LINKS, ...links };

    return (
        <main className="lunch-wrap">
            <header className="lunch-hero" role="banner">
                <div className="lunch-cardmock" aria-hidden="true" />
                <h1>아동급식카드, 더 쉽고 편리하게</h1>
                <p>
                    <b>아동급식카드</b>는 지자체가 결식 우려 아동에게 식사비를 바우처로 제공하는 복지카드로, 
                    <br/>지정 가맹점에서 안전하게 식사만 결제되도록 지원합니다.
                </p>
            </header>

            <div className="lunch-container">
                <section className="lunch-intro" aria-labelledby="lunch-intro-title">
                    <h2 id="lunch-intro-title">바로가기</h2>
                    <p>지역별 아동급식카드 공식 홈페이지 주소로 이동하기</p>

                    {/* 9 Links Grid */}
                    <div className="lunch-grid" id="lunch-quick">
                        <a className="lunch-linkcard" id="lunch-link-apply" href={"https://www.ddm.go.kr/www/contents.do?key=664"} aria-label="신청 안내">
                            <span className="lunch-icn" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="16" rx="2" />
                                    <path d="M3 10h18" />
                                    <path d="M7 16h5" />
                                </svg>
                            </span>
                            <span className="lunch-meta">
                                <div className="ttl">꿈나무카드</div>
                                <div className="dsc">서울특별시 아동급식카드</div>
                            </span>
                            <span className="lunch-go" aria-hidden="true">➜</span>
                        </a>
                        <a className="lunch-linkcard" id="lunch-link-eligibility" href={"https://ice.purmee.kr/main/"} aria-label="발급 대상">
                            <span className="lunch-icn" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="16" rx="2" />
                                    <path d="M3 10h18" />
                                    <path d="M7 16h5" />
                                </svg>
                            </span>
                            <span className="lunch-meta">
                                <div className="ttl">푸르미카드</div>
                                <div className="dsc">인천광역시 아동급식카드</div>
                            </span>
                            <span className="lunch-go" aria-hidden="true">➜</span>
                        </a>
                        <a className="lunch-linkcard" id="lunch-link-merchants" href={"https://www.gg.go.kr/gdream/view/fma/ordmain/main"} aria-label="사용처 찾기">
                            <span className="lunch-icn" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="16" rx="2" />
                                    <path d="M3 10h18" />
                                    <path d="M7 16h5" />
                                </svg>
                            </span>
                            <span className="lunch-meta">
                                <div className="ttl">G-dream 카드</div>
                                <div className="dsc">경기도 아동급식카드</div>
                            </span>
                            <span className="lunch-go" aria-hidden="true">➜</span>
                        </a>
                        <a className="lunch-linkcard" id="lunch-link-balance" href={"https://cn.nhdream.co.kr/security/loginForm"} aria-label="잔액 및 이용내역 조회">
                            <span className="lunch-icn" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="16" rx="2" />
                                    <path d="M3 10h18" />
                                    <path d="M7 16h5" />
                                </svg>
                            </span>
                            <span className="lunch-meta">
                                <div className="ttl">NH dream 카드</div>
                                <div className="dsc">충청남도 아동급식카드</div>
                            </span>
                            <span className="lunch-go" aria-hidden="true">➜</span>
                        </a>
                        <a className="lunch-linkcard" id="lunch-link-lost" href={"https://www.heemang.or.kr/heemang/login/mng/main.han"} aria-label="분실 및 재발급">
                            <span className="lunch-icn" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="16" rx="2" />
                                    <path d="M3 10h18" />
                                    <path d="M7 16h5" />
                                </svg>
                            </span>
                            <span className="lunch-meta">
                                <div className="ttl">희망카드</div>
                                <div className="dsc">아동급식전자카드</div>
                            </span>
                            <span className="lunch-go" aria-hidden="true">➜</span>
                        </a>
                        <a className="lunch-linkcard" id="lunch-link-benefits" href={"https://gsnd.nhdream.co.kr/security/hubform"} aria-label="이용 혜택">
                            <span className="lunch-icn" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="16" rx="2" />
                                    <path d="M3 10h18" />
                                    <path d="M7 16h5" />
                                </svg>
                            </span>
                            <span className="lunch-meta">
                                <div className="ttl">경남 Dream 카드</div>
                                <div className="dsc">경상남도 아동급식전자카드</div>
                            </span>
                            <span className="lunch-go" aria-hidden="true">➜</span>
                        </a>
                        <a className="lunch-linkcard" id="lunch-link-partner" href={"https://kidsmeal.daegu.go.kr/view/fma/ordmain/main"} aria-label="가맹점 제휴 문의">
                            <span className="lunch-icn" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="16" rx="2" />
                                    <path d="M3 10h18" />
                                    <path d="M7 16h5" />
                                </svg>
                            </span>
                            <span className="lunch-meta">
                                <div className="ttl">Kidsmeal 카드</div>
                                <div className="dsc">대구광역시 아동급식카드</div>
                            </span>
                            <span className="lunch-go" aria-hidden="true">➜</span>
                        </a>
                        <a className="lunch-linkcard" id="lunch-link-support" href={"http://busan.nhdream.co.kr/"} aria-label="고객센터">
                            <span className="lunch-icn" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="16" rx="2" />
                                    <path d="M3 10h18" />
                                    <path d="M7 16h5" />
                                </svg>
                            </span>
                            <span className="lunch-meta">
                                <div className="ttl">NHdream 카드</div>
                                <div className="dsc">부산광역시 아동급식카드</div>
                            </span>
                            <span className="lunch-go" aria-hidden="true">➜</span>
                        </a>
                        <a className="lunch-linkcard" id="lunch-link-notice" href={"https://dj.nhdream.co.kr/security/loginForm"} aria-label="공지사항">
                            <span className="lunch-icn" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="16" rx="2" />
                                    <path d="M3 10h18" />
                                    <path d="M7 16h5" />
                                </svg>
                            </span>
                            <span className="lunch-meta">
                                <div className="ttl">아이누리카드</div>
                                <div className="dsc">대전광역시 아동급식카드</div>
                            </span>
                            <span className="lunch-go" aria-hidden="true">➜</span>
                        </a>
                    </div>
                </section>

                {/* 설명 문구 */}
                <section className="lunch-brief" aria-labelledby="lunch-brief-title">
                    <h2 id="lunch-brief-title">아동급식카드란?</h2>

                    <p className="lunch-brief-lead">
                        지자체가 결식 우려가 있는 아동·청소년에게 <strong>식사 비용을 바우처 형태로 지원</strong>하기 위해
                        발급하는 선불형 복지카드입니다. 카드 결제처럼 간편하게 사용하면서, 지정 가맹점에서
                        <strong> 식사·간식 등 식품류</strong>만 결제되도록 설계되어 있어요.
                    </p>

                    <div className="lunch-brief-grid">
                        <div className="lunch-brief-box">
                            <h3 className="lunch-brief-sub">핵심 요약</h3>
                            <ul className="lunch-brief-list">
                                <li><b>지원 대상</b>: 만 18세 미만 아동·청소년 중 결식 우려가 인정된 경우(지자체별 기준 상이)</li>
                                <li><b>지원 방식</b>: 월 단위 바우처 충전 → 지정 가맹점에서 카드 결제</li>
                                <li><b>사용 범위</b>: 식사·식품 구매 한정(주류·담배·비식품·유흥업종 제한)</li>
                                <li><b>잔액/내역</b>: 전용 웹·앱 또는 카드사 채널에서 실시간 확인</li>
                                <li><b>분실/도난</b>: 즉시 사용 정지 후 재발급 가능</li>
                                <li><b>지역·시간</b>: 일부 지역은 사용 지역/시간이 제한될 수 있음</li>
                            </ul>
                        </div>

                        <div className="lunch-brief-box">
                            <h3 className="lunch-brief-sub">이용 전 체크사항</h3>
                            <ul className="lunch-brief-list">
                                <li>신청 방법·월 지원 한도·가맹점·방학/주말 운영은 <b>지역별 공고</b> 확인</li>
                                <li>배달앱 사용, 할인/포인트 중복 가능 여부는 <b>지자체·카드사 정책</b>에 따름</li>
                                <li>부정 사용이 의심될 경우 지원 제한 및 보호자·담당부서에 안내될 수 있음</li>
                            </ul>
                        </div>
                    </div>
                </section>


                {/* Info Section */}
                <section className="lunch-section" aria-label="급식카드 정보">
                    <div className="lunch-box" role="region" aria-labelledby="lunch-sec-trust">
                        <h3 id="lunch-sec-trust">안전한 이용을 위한 약속</h3>
                        <ul className="lunch-list">
                            <li>거래·잔액은 암호화 전송 및 보호 저장됩니다.</li>
                            <li>분실 신고 시 즉시 결제 정지 및 재발급 지원.</li>
                            <li>부정 사용 모니터링 및 이상 징후 알림.</li>
                        </ul>
                    </div>
                    <div className="lunch-box" role="region" aria-labelledby="lunch-sec-guide">
                        <h3 id="lunch-sec-guide">빠른 시작 가이드</h3>
                        <ul className="lunch-list">
                            <li>온라인·오프라인 신청 후 카드 수령</li>
                            <li>사용처 확인 및 첫 결제 테스트</li>
                            <li>모바일에서 잔액·내역 수시 체크</li>
                        </ul>
                    </div>
                </section>
            </div>
        </main>
    );
}
