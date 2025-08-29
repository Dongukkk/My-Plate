import "../components/SideBarMenu.css"

function SideBarMenu(){
    return(
        <>
            <nav className="main-sidebar-menu">
                <ul>
                    <li className="main-menu-item active">
                        <a href="#">
                            <span className="main-side-bar-text">홈</span>
                        </a>
                    </li>
                    <li className="main-menu-item">
                        <a href="#">
                            <span className="main-side-bar-text">식당 찾기</span>
                        </a>
                    </li>
                    <li className="main-menu-item">
                        <a href="#">
                            <span className="main-side-bar-text">내 주변</span>
                        </a>
                    </li>
                    <li className="main-menu-item">
                        <a href="#">
                            <span className="main-side-bar-text">즐겨찾기</span>
                        </a>
                    </li>
                    <li className="main-menu-item">
                        <a href="#">
                            <span className="main-side-bar-text">리뷰</span>
                        </a>
                    </li>
                    <li className="main-menu-item">
                        <a href="#">
                            <span className="main-side-bar-text">설정</span>
                        </a>
                    </li>
                    <li className="main-menu-item">
                        <a href="#">
                            <span className="main-side-bar-text">관리자</span>
                        </a>
                    </li>
                </ul>
                <div className="main-side-bar-divider"></div>
                <ul>
                    <li className="main-menu-item">
                        <a href="#">
                            <span className="main-side-bar-icon">➡️</span>
                            <span className="main-side-bar-text">로그아웃</span>
                        </a>
                    </li>
                </ul>
            </nav>
        </>
    );
}

export default SideBarMenu;