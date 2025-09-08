import { Link, useLocation } from 'react-router-dom';
import "../components/SideBarMenu.css"
import { useSelector } from 'react-redux';

function SideBarMenu(){
    const location = useLocation();

      const user = useSelector(state => state.user);
    return(
        <>
            <nav className="main-sidebar-menu" style={{display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
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
                    {user && user.id && 
                    
                        <li className={`main-menu-item ${location.pathname === '/bookmarks' ? 'active' : ''}`}>
                            <Link to="/bookmarks">
                                <span className="main-side-bar-text">즐겨찾기</span>
                            </Link>
                        </li>
                    }
                    {user && user.id && 
                    <li className={`main-menu-item ${location.pathname === '/reviews' ? 'active' : ''}`}>
                        <Link to="/reviews">
                            <span className="main-side-bar-text">리뷰</span>
                        </Link>
                    </li>
                    }
                    {user && user.id && 
                    <li className={`main-menu-item ${location.pathname === '/settings' ? 'active' : ''}`}>
                        <Link to="/settings">
                            <span className="main-side-bar-text">설정</span>
                        </Link>
                    </li>
                    }
                </ul>
                <div className="main-side-bar-divider"></div>
                <div style={{ margin:'20px 20px', display:'flex',justifyContent:'center', fontSize:'12px', color:'gray'}}>
                    <span style={{cursor:'pointer'}}>About Us ㅤ</span>•
                    <span style={{cursor:'pointer'}}>ㅤ복지카드란?</span>

                </div>
            </nav>
        </>
    );
}

export default SideBarMenu;