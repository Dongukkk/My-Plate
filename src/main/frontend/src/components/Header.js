import { useNavigate } from "react-router-dom";
import "../components/Header.css"
import RestaurantSearchBar from "./RestaurantSearchBar";
import { clearUser } from '../store/store';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from "react";
import { toast } from "react-toastify";

function Header(){
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

            toast.success("로그아웃이 완료되었습니다!", {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

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

                    ) : (<span onClick={() => navigate(`/login`)} style={{ fontSize: "16px", fontWeight: "bold", color: "white", cursor: "pointer" }}>로그인</span>
                    )}
                    {isDropdownVisible && user && user.name && (
                        <div className="mh-dropdown-menu">
                            <span onClick={() => { navigate("/mypage"); setIsDropdownVisible(false); }}>마이페이지</span>
                            <span onClick={() => { logout(); setIsDropdownVisible(false); }}>로그아웃</span>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;