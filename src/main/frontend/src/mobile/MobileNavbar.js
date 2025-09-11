// src/components/MobileNavbar.js

import { Link, useLocation } from 'react-router-dom';
import "./MobileNavbar.css";
import { useSelector } from 'react-redux';

function MobileNavbar(){
    const location = useLocation();
    const user = useSelector(state => state.user);
    
    // 사용자의 로그인 상태에 따라 '즐겨찾기' 또는 '마이페이지'를 표시
    const myPageLink = user && user.id ? '/mypage' : '/login';
    
    return(
        <nav className="mobile-navbar">
            <Link to="/" className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                <img src={`${process.env.PUBLIC_URL}/images/icon/mobile/HOME.png`} style={{height:'22px'}}></img>
                <span className="nav-text">홈</span>
            </Link>
            <Link to="/restaurantList" className={`mobile-nav-item ${location.pathname === '/restaurantList' || location.pathname.startsWith('/search') || location.pathname.startsWith('/restaurants/detail')? 'active' : ''}`}>
                <img src={`${process.env.PUBLIC_URL}/images/icon/mobile/RESTAURANT.png`} style={{height:'22px'}}></img>
                <span className="nav-text">식당</span>
            </Link>
            <Link to="/map" className={`mobile-nav-item ${location.pathname === '/map' ? 'active' : ''}`}>
                <img src={`${process.env.PUBLIC_URL}/images/icon/mobile/MAP.png`} style={{height:'22px'}}></img>
                <span className="nav-text">지도</span>
            </Link>
            {user && user.id && 
                <Link to="/bookmarks" className={`mobile-nav-item ${location.pathname === '/bookmarks' ? 'active' : ''}`}>
                    <img src={`${process.env.PUBLIC_URL}/images/restaurant/bookmark/BOOKMARK_ON.png`} style={{height:'22px'}}></img>
                    <span className="nav-text">즐겨찾기</span>
                </Link>
            }
            <Link to={myPageLink} className={`mobile-nav-item ${location.pathname.includes('/mypage') ? 'active' : ''}`}>
                <img src={`${process.env.PUBLIC_URL}/images/icon/mobile/ACCOUNT.png`} style={{height:'22px'}}></img>
                <span className="nav-text">마이</span>
            </Link>
        </nav>
    );
}

export default MobileNavbar;