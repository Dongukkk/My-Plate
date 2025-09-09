import "./Footer.css";

export default function Footer() {
    const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        <footer className="footer-wrap" role="contentinfo">
            <div className="footer-container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <h4 className="footer-head">MY PLATE</h4>
                        <ul className="footer-links">
                            <li><a className="footer-link">공지사항</a></li>
                            <li><a href="/siteIntro" className="footer-link">서비스 소개</a></li>
                            <li><a className="footer-link">채용</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4 className="footer-head">이용안내</h4>
                        <ul className="footer-links">
                            <li><a className="footer-link">FAQ</a></li>
                            <li><a href="/cardIntro" className="footer-link">복지카드</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4 className="footer-head">정책</h4>
                        <ul className="footer-links">
                            <li><a href="/termsOfUse#terms" className="footer-link">이용약관</a></li>
                            <li><a href="/termsOfUse#privacy" className="footer-link">개인정보처리방침</a></li>
                            <li><a href="/termsOfUse#images" className="footer-link">이미지 가이드</a></li>
                        </ul>
                    </div>
                    <div className="footer-col"></div>
                    <div className="footer-col">
                        <h4 className="footer-head">고객지원</h4>
                        <p className="footer-hours">평일 9:30 - 17:00 (12:00 - 14:00 제외)</p>
                        <a href="/contact" className="footer-btn">My Plate에 문의</a>
                    </div>
                </div>
                <hr className="footer-sep" />
                <div className="footer-bottom">
                    <div className="footer-company">
                        <p>
                            회사명 (주) 마이플레이트 | 주소 충청남도 천안시 동남구 대흥동 134 | 사업자등록번호 041-56-11122
                            | 대표번호 041-561-1122 | 이메일 support@example.com
                        </p>
                        <p>© 2025 Myplate.kr Inc.</p>
                    </div>
                    <div className="footer-social">
                        <a href="https://facebook.com" aria-label="Facebook" className="footer-sns">
                            <svg viewBox="0 0 24 24"><path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" /></svg>
                        </a>
                        <a href="https://x.com" aria-label="X" className="footer-sns">
                            <svg viewBox="0 0 24 24"><path d="M4 4l7.4 8.3L4.8 20h2.8l4.9-5.6 4 5.6H20l-7-9.8L19.1 4h-2.8l-4.4 5-3.6-5H4z" /></svg>
                        </a>
                        <a href="https://instagram.com" aria-label="Instagram" className="footer-sns">
                            <svg viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7zm5 3a5 5 0 110 10 5 5 0 010-10zm0 2.2a2.8 2.8 0 100 5.6 2.8 2.8 0 000-5.6zm5.6-.9a1 1 0 110 2 1 1 0 010-2z" /></svg>
                        </a>
                    </div>
                </div>
            </div>

            <button type="button" className="footer-top" onClick={scrollTop} aria-label="맨 위로">
                <svg viewBox="0 0 24 24"><path d="M12 7l6 6H6l6-6z" /></svg>
            </button>
        </footer>
    );
}
