import { useEffect } from 'react';
import './ErrorPage.css'; // 404 페이지 스타일링을 위한 CSS 파일

const ErrorPage = () => {
    useEffect(() => {
        const errorContent = document.querySelector('.error-content');

        if (errorContent) {
            errorContent.classList.add('show');
        }
    }, []); // 빈 배열을 넣어 컴포넌트가 처음 마운트될 때만 실행되도록 설정

    return (
        <div className="error-container">
            <div className="error-content">
                <h1 className="error-title">404</h1>
                <p className="error-message">페이지를 찾을 수 없습니다.</p>
                <p className="error-description">죄송합니다. 요청하신 페이지가 존재하지 않거나, 더 이상 제공되지 않는 페이지입니다.</p>
                <a href="/" className="btn-home">홈으로 돌아가기</a>
            </div>
        </div>
    );
};

export default ErrorPage;