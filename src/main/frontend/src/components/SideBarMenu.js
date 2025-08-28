import "../components/SideBarMenu.css"

function SideBarMenu(){
    return(
        <>
            <nav class="main-sidebar-menu">
                <ul>
                    <li class="main-menu-item active">
                        <a href="#">
                            <span class="main-side-bar-icon">🏠</span>
                            <span class="main-side-bar-text">홈</span>
                        </a>
                    </li>
                    <li class="main-menu-item">
                        <a href="#">
                            <span class="main-side-bar-icon">🍽️</span>
                            <span class="main-side-bar-text">식당 찾기</span>
                        </a>
                    </li>
                    <li class="main-menu-item">
                        <a href="#">
                            <span class="main-side-bar-icon">📍</span>
                            <span class="main-side-bar-text">내 주변</span>
                        </a>
                    </li>
                    <li class="main-menu-item">
                        <a href="#">
                            <span class="main-side-bar-icon">⭐</span>
                            <span class="main-side-bar-text">즐겨찾기</span>
                        </a>
                    </li>
                    <li class="main-menu-item">
                        <a href="#">
                            <span class="main-side-bar-icon">📈</span>
                            <span class="main-side-bar-text">리뷰</span>
                        </a>
                    </li>
                    <li class="main-menu-item">
                        <a href="#">
                            <span class="main-side-bar-icon">⚙️</span>
                            <span class="main-side-bar-text">설정</span>
                        </a>
                    </li>
                    <li class="main-menu-item">
                        <a href="#">
                            <span class="main-side-bar-icon">👤</span>
                            <span class="main-side-bar-text">관리자</span>
                        </a>
                    </li>
                </ul>
                <div class="main-side-bar-divider"></div>
                <ul>
                    <li class="main-menu-item">
                        <a href="#">
                            <span class="main-side-bar-icon">➡️</span>
                            <span class="main-side-bar-text">로그아웃</span>
                        </a>
                    </li>
                </ul>
            </nav>
        </>
    );
}

export default SideBarMenu;