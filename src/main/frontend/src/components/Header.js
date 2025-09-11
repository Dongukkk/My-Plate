import { useNavigate } from "react-router-dom";
import "../components/Header.css"
import RestaurantSearchBar from "./RestaurantSearchBar";
import { clearUser } from '../store/store';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from "react";
import {useAlert} from '../ui/alert-center';
import ConfirmModal from "../modal/ConfirmModal";

function Header(){
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);
    const {alert} = useAlert();

    const dispatch = useDispatch();

    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    const handleLogoutClick = () => {
        setIsConfirmModalVisible(true);
        console.log('1');
    };

    const logout = () => {
        dispatch(clearUser());
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        alert("로그아웃이 완료되었습니다!");
        setIsDropdownVisible(false);
        setIsConfirmModalVisible(false);
    };

    const toggleDropdown = () => {
        setIsDropdownVisible(!isDropdownVisible);
    };

    return (
        <header className="main-header">
            <img src={process.env.PUBLIC_URL + '/images/logo/MYPLATEHEADERLOGO.png'} style={{width:"150px", cursor:"pointer"}} alt="로고" onClick={() => navigate(`/`)}/>
            <div style={{display:"flex", justifyContent:"center"}}>
                <div className="search-bar-wrapper">
                    <RestaurantSearchBar />
                </div>
                
                <div style={{display:"inline-flex", alignItems:"center", marginLeft:"10px"}}>
                    { user && user.name ? (
                        <span
                            style={{ fontSize: "16px", fontWeight: "bold", color: "white", cursor: "pointer" }}
                            onClick={toggleDropdown}
                            >
                            {user.name}님
                            </span>

                    ) : (<span onClick={() => navigate(`/login`, { state: { from: window.location.pathname } })} style={{ fontSize: "16px", fontWeight: "bold", color: "white", cursor: "pointer" }}>로그인</span>
                    )}
                    {isDropdownVisible && user && user.name && (
                        <div className="mh-dropdown-menu">
                            <span onClick={() => { navigate("/mypage"); setIsDropdownVisible(false); }}>마이페이지</span>
                            <span onClick={() => {handleLogoutClick()}}>로그아웃</span>
                        </div>
                    )}
                </div>
            </div>
            {isConfirmModalVisible && (
                <ConfirmModal 
                    message="정말 로그아웃하시겠습니까?"
                    onConfirm={logout}
                    onCancel={() => setIsConfirmModalVisible(false)}
                />
            )}
        </header>
    );
}

export default Header;