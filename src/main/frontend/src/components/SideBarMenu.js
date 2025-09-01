import { Link, useLocation } from 'react-router-dom';
import "../components/SideBarMenu.css"

function SideBarMenu(){
    const location = useLocation();

    return(
        <>
            <nav className="main-sidebar-menu">
                <ul>
                    <li className={`main-menu-item ${location.pathname === '/' ? 'active' : ''}`}>
                        <Link to="/">
                            <span className="main-side-bar-text">홈</span>
                        </Link>
                    </li>
                    <li className={`main-menu-item ${location.pathname === '/restaurantList' || location.pathname.startsWith('/search') || location.pathname.startsWith('/restaurants/detail')? 'active' : ''}`}>
                        <Link to="/restaurantList">
                            <span className="main-side-bar-text">식당 목록</span>
                        </Link>
                    </li>
                    <li className={`main-menu-item ${location.pathname === '/map' ? 'active' : ''}`}>
                        <Link to="/map">
                            <span className="main-side-bar-text">지도</span>
                        </Link>
                    </li>
                    <li className={`main-menu-item ${location.pathname === '/favorites' ? 'active' : ''}`}>
                        <Link to="/favorites">
                            <span className="main-side-bar-text">즐겨찾기</span>
                        </Link>
                    </li>
                    <li className={`main-menu-item ${location.pathname === '/reviews' ? 'active' : ''}`}>
                        <Link to="/reviews">
                            <span className="main-side-bar-text">리뷰</span>
                        </Link>
                    </li>
                    <li className={`main-menu-item ${location.pathname === '/settings' ? 'active' : ''}`}>
                        <Link to="/settings">
                            <span className="main-side-bar-text">설정</span>
                        </Link>
                    </li>
                </ul>
                <div className="main-side-bar-divider"></div>
                
            </nav>
        </>
    );
}

export default SideBarMenu;