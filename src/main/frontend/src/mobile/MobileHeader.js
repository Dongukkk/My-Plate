// src/components/MobileHeader.js

import { useNavigate } from "react-router-dom";
import "./MobileHeader.css";
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../store/store';
import { useState } from "react";
import { toast } from "react-toastify";

function MobileHeader() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    const logout = () => {
        const confirmLogout = window.confirm("정말 로그아웃하시겠습니까?");
        if (confirmLogout) {
            dispatch(clearUser());
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            toast.success("로그아웃이 완료되었습니다!", { autoClose: 2000 });
            setTimeout(() => {
                navigate("/", { replace: true });
                setIsDropdownVisible(false);
            }, 1000);
        }
    };

    const toggleDropdown = () => {
        setIsDropdownVisible(!isDropdownVisible);
    };

    return (
        <header className="mobile-header">
            <img
                src={process.env.PUBLIC_URL + '/images/logo/MYPLATEHEADERLOGO.png'}
                className="mobile-header-logo"
                alt="로고"
                onClick={() => navigate(`/`)}
            />
            <div className="mobile-auth-section">
                {user && user.name ? (
                    <span className="mobile-auth-text" onClick={toggleDropdown}>
                        {user.name}님
                    </span>
                ) : (
                    <span className="mobile-auth-text" onClick={() => navigate(`/login`)}>
                        로그인
                    </span>
                )}
                {isDropdownVisible && user && user.name && (
                    <div className="mobile-dropdown-menu">
                        <span onClick={() => { navigate("/mypage"); setIsDropdownVisible(false); }}>마이페이지</span>
                        <span onClick={() => { logout(); setIsDropdownVisible(false); }}>로그아웃</span>
                    </div>
                )}
            </div>
        </header>
    );
}

export default MobileHeader;