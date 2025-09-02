import { useNavigate } from "react-router-dom";
import '../mainpage/MainPage.css';
function MainPage() {
    const navigate = useNavigate();

    return (
        <>

            <section className="mainpage-hero">
                <video muted autoPlay loop>
                    <source src={`${process.env.PUBLIC_URL}/video/MAIN_VIDEO.mp4`} type="video/mp4"></source>
                </video>
                <div className="text">
                    <h2>혼자서도 맛있게, 혼밥인</h2>
                    <p>당신을 위한 맞춤형 혼밥 맛집 추천 서비스</p>
                    <div>
                        <button className="mainpage-btn-orange" onClick={() => navigate(`/restaurantList`)}>맛집 탐색하기</button>
                        <button className="mainpage-btn-white" onClick={() => navigate(`/map`)}>지도로 보기</button>
                    </div>
                </div>
            </section>

            <section className="mainpage-container">
                <h3 style={{fontSize:"20px", fontWeight:"bold", marginBottom:"20px"}}>오늘의 추천 맛집</h3>

                <div className="mainpage-restaurant">
                    <h4>정성가득 한식당 <span style={{color:"#f97316"}}>⭐ 4.8</span></h4>
                    <div className="mainpage-tags"><span>#복지카드 사용 가능</span><span>#한식</span><span>#1인 전용</span></div>
                    <p>정성 가득한 집밥 같은 한식을 혼자서도 편안하게 즐길 수 있는 공간입니다. 제철 재료 식재료로 만든 건강한 반찬과 따뜻한 국물 요리가 일품입니다.</p>
                    <p>서울시 종로구 인사동길 12-1</p>
                    <p>11:00 - 21:00 (월요일 휴무)</p>
                </div>

                <div className="mainpage-restaurant">
                    <h4>혼라멘 <span style={{color:"#f97316"}}>⭐ 4.6</span></h4>
                    <div className="mainpage-tags"><span>#일식</span><span>#캐주얼</span><span>#라멘</span></div>
                    <p>일본 정통 라멘을 혼밥인의 입맛에 맞게 재해석한 라멘 전문점입니다. 카운터 구조로 혼자 방문해도 전혀 어색하지 않은 분위기로 자랑합니다.</p>
                    <p>서울시 마포구 동교동 마포구청역 3번 출구 옆</p>
                    <p>11:30 - 22:00 (연중무휴)</p>
                </div>

                <div className="mainpage-restaurant">
                    <h4>마라양 혼밥점 <span style={{color:"#f97316"}}>⭐ 4.5</span></h4>
                    <div className="mainpage-tags"><span>#중식</span><span>#1인분 주문 가능</span><span>#매운맛 조절 가능</span></div>
                    <p>혼자서도 부담 없이 즐길 수 있는 1인 마라탕 전문점입니다. 취향에 맞게 재료와 매운맛 단계를 조절할 수 있어 누구나 만족스러운 한 끼를 완성할 수 있습니다.</p>
                    <p>서울시 강남구 역삼동 823-25</p>
                    <p>10:00 - 22:00 (연중무휴)</p>
                </div>

                <div className="mainpage-restaurant">
                    <h4>그린테이블 <span style={{color:"#f97316"}}>⭐ 4.7</span></h4>
                    <div className="mainpage-tags"><span>#샐러드</span><span>#다이어트 음식</span><span>#복지카드 사용 가능</span></div>
                    <p>건강한 식단을 추구하는 혼밥족들을 위한 프리미엄 샐러드 전문점입니다. 신선한 로컬 식재료를 사용하며, 다양한 단백질 음식과 드레싱으로 자신만의 맞춤형 샐러드를 즐길 수 있습니다.</p>
                    <p>서울시 서초구 강남대로 369</p>
                    <p>08:00 - 21:00 (일요일 휴무)</p>
                </div>

            </section>

            <section className="mainpage-services">
                <div className="mainpage-container mainpage-grid">
                    <div className="mainpage-service-card">
                        <h4>맛집 검색</h4>
                        <p>지역, 음식 종류, 가격대 등 다양한 필터로 나에게 맞는 혼밥 맛집을 찾아보세요.</p>
                        <button className="mainpage-btn-orange">검색하기</button>
                    </div>
                    <div className="mainpage-service-card">
                        <h4>지도로 보기</h4>
                        <p>내 주변의 혼밥인 추천 식당들을 지도에서 확인하고 방문해보세요.</p>
                        <button className="mainpage-btn-orange">지도 보기</button>
                    </div>
                    <div className="mainpage-service-card">
                        <h4>맛집 리스트</h4>
                        <p>다양한 테마별 인기 맛집 리스트를 확인하고 나만의 맛집을 경험해보세요.</p>
                        <button className="mainpage-btn-orange">리스트 보기</button>
                    </div>
                </div>
            </section>


        </>

    );
}

export default MainPage;