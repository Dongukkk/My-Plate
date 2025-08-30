import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PrettyAlert from "./pretty-alert";
import "./admin-main.css";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-content">
                <p>정말 로그아웃하시겠습니까?</p>
                <div className="admin-modal-actions">
                    <button onClick={onConfirm} className="admin-btn-logout">
                        로그아웃
                    </button>
                    <button onClick={onClose} className="admin-btn-cancel">
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatsCard = ({ title, value, change, onClick }) => (
    <div className="admin-card" onClick={onClick} style={{ cursor: "pointer" }}>
        {title}
        <br />
        <span className="admin-value">{value}</span>
        <br />
        <span className="admin-change">{change}</span>
    </div>
);

const AdminMain = () => {
    const navigate = useNavigate();

    const [stats] = useState({
        totalUsers: 24568,
        activeUsers: 18342,
        restaurants: 3845,
        reviews: 42156,
    });

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [logoutAlertOpen, setLogoutAlertOpen] = useState(false);

    const handleConfirmLogout = () => {
        console.log("로그아웃 진행");
        setIsModalOpen(false);
        setLogoutAlertOpen(true);
    };

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <h2 className="admin-logo"><img src={"https://i.imgur.com/tiY7WKl.png"} alt="My Plate Logo" className="admin-logo-img"/></h2>
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

            {/* 메인 */}
            <main className="admin-main-content">
                <div className="admin-topbar">
                    <div className="admin-profile-container">
                        <div className="admin-profile" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>관리자</div>
                        {isDropdownOpen && (<div className="admin-dropdown-menu"><button onClick={() => { setIsDropdownOpen(false); setIsModalOpen(true); }}>로그아웃</button></div>)}
                    </div>
                </div>

                {/* 요약 카드 */}
                <section className="admin-stats">
                    <StatsCard title="총 사용자" value={stats.totalUsers} change="+12.4% " onClick={() => navigate("/adminUser")}/>
                    <StatsCard title="활성 사용자" value={stats.activeUsers} change="+8.7% " onClick={() => navigate("/adminUser")}/>
                    <StatsCard title="등록된 레스토랑" value={stats.restaurants} change="+5.2% " onClick={() => navigate("/adminrestaurants")}/>
                    <StatsCard title="리뷰 수" value={stats.reviews} change="+15.8% " onClick={() => navigate("/adminContent")}/>
                </section>

                <section className="admin-charts">
                    <div className="admin-chart-box" onClick={() => navigate("/adminanalysis")}>사용자 등록 추이 (클릭 시 이동)</div>
                    <div className="admin-chart-box" onClick={() => navigate("/adminanalysis")}>사용자 활동 분석 (클릭 시 이동)</div>
                </section>

                <div className="admin-grid-container popular">
                    {/* 인기 가게 */}
                    <section className="admin-grid-item">
                        <div className="admin-section-header"><h3>인기 가게 TOP 5</h3>
                            <button className="admin-section-btn" onClick={() => navigate("/adminrestaurants")}>가게 관리</button>
                        </div>
                        <div className="admin-table-wrapper">
                            <table><thead><tr><th>가게 이름</th><th>위치</th><th>평점</th><th>방문자 수</th></tr></thead>
                                <tbody>
                                    {/* DB 기입하기 */}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* 사용자 관리 */}
                    <section className="admin-grid-item">
                        <div className="admin-section-header"><h3>사용자 관리</h3><button className="admin-section-btn" onClick={() => navigate("/adminUser")}>사용자 관리</button></div>
                        <div className="admin-user-stats">
                            <p>신규 가입자 (이번 주):</p>
                            <p>활성 사용자 (일간):</p>
                        </div>
                        <div className="admin-recent-users">
                            <h4>최근 가입한 사용자</h4>
                            <ul></ul>
                        </div>
                    </section>

                    {/* 콘텐츠 관리 */}
                    <section className="admin-grid-item">
                        <div className="admin-section-header"><h3>콘텐츠 관리</h3>
                            <button className="admin-section-btn" onClick={() => navigate("/adminContent")}>콘텐츠 관리</button>
                        </div>
                        <div className="admin-content-stats">
                            <p>대기 중인 리뷰:</p>
                            <p>이번 주에 등록된 사진:</p>
                            <p>신고된 콘텐츠:</p>
                        </div>
                        <div className="admin-recent-reviews"><h4>최근 리뷰</h4></div>
                    </section>

                    {/* 분석 및 통계 */}
                    <section className="admin-grid-item">
                        <div className="admin-section-header"><h3>분석 및 통계</h3><button className="admin-section-btn" onClick={() => navigate("/adminanalysis")}>자세한 분석</button></div>
                        <div className="admin-analysis-charts">
                            <div className="admin-chart-box">파이 차트 자리</div>
                            <div className="admin-chart-box">평점 분포 바 차트 자리</div>
                        </div>
                    </section>
                </div>
            </main>
            <LogoutModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmLogout}/>
            <PrettyAlert open={logoutAlertOpen} message="로그아웃되었습니다." onClose={() => setLogoutAlertOpen(false)}/>
        </div>
    );
};

export default AdminMain;
