export default function Forbidden() {

    return (
    <div style={{ padding: 20 }}>
        <h2>접근 불가</h2>
        <div>이 페이지에 접근할 권한이 없습니다.</div>
        <a href="/mypage">돌아가기</a> <br></br>
        <a href="/login">다른 계정으로 로그인</a>
    </div>
    );
}