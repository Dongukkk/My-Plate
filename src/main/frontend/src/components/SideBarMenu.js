import "../components/SideBarMenu.css"

function SideBarMenu(){
    return(
        <>
            <nav class="sidebar-menu">
                <ul>
                    <li class="menu-item active">
                        <a href="#">
                            <span class="icon">🏠</span>
                            <span class="text">홈</span>
                        </a>
                    </li>
                    <li class="menu-item">
                        <a href="#">
                            <span class="icon">🍽️</span>
                            <span class="text">식당 찾기</span>
                        </a>
                    </li>
                    <li class="menu-item">
                        <a href="#">
                            <span class="icon">📍</span>
                            <span class="text">내 주변</span>
                        </a>
                    </li>
                    <li class="menu-item">
                        <a href="#">
                            <span class="icon">⭐</span>
                            <span class="text">즐겨찾기</span>
                        </a>
                    </li>
                    <li class="menu-item">
                        <a href="#">
                            <span class="icon">📈</span>
                            <span class="text">리뷰</span>
                        </a>
                    </li>
                    <li class="menu-item">
                        <a href="#">
                            <span class="icon">⚙️</span>
                            <span class="text">설정</span>
                        </a>
                    </li>
                    <li class="menu-item">
                        <a href="#">
                            <span class="icon">👤</span>
                            <span class="text">관리자</span>
                        </a>
                    </li>
                </ul>
                <div class="divider"></div>
                <ul>
                    <li class="menu-item">
                        <a href="#">
                            <span class="icon">➡️</span>
                            <span class="text">로그아웃</span>
                        </a>
                    </li>
                </ul>
            </nav>
        </>
    );
}

export default SideBarMenu;