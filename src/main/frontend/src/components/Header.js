import { useNavigate } from "react-router-dom";
import "../components/Header.css"

function Header(){
    const navigate = useNavigate();

    return (
        <header className="main-header">
            <img src={process.env.PUBLIC_URL + '/images/logo/MYPLATEHEADERLOGO.png'} style={{width:"150px", cursor:"pointer"}} alt="로고" onClick={() => navigate(`/`)}/>
            <div style={{display:"flex", justifyContent:"center"}}>
                <div class="search-box">
                    <input type="text" placeholder="맛집 검색하기..." />
                    <button>검색</button>
                </div>
                <div style={{display:"inline-flex", alignItems:"center", marginLeft:"10px"}}>
                    <img src="https://cdn.pixabay.com/photo/2025/08/17/10/46/bird-9779577_1280.png" style={{borderRadius:"90%", marginRight:"6px", height:"40px", width:"40px"}} />
                    <span style={{fontSize:"16px", fontWeight:"bold", color:"white"}}>김밥천국</span>
                </div>
            </div>
        </header>
    );
}

export default Header;