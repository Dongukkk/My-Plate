// src/components/GuideModal.js
import React from 'react';
import './ReviewApp.css'; // 스타일은 ReviewApp.css에서 함께 관리

const GuideModal = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>맛있어 보이는 사진 촬영 팁 ✨</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {/* 좋은 예시 */}
          <div className="example-column good-example">
            <h3>Good Example 👍</h3>
            <img src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Good" />
            <ul>
              <li>✔️ 밝은 자연광에서 촬영</li>
              <li>✔️ 음식에 초점이 선명함</li>
              <li>✔️ 깔끔하고 정돈된 배경</li>
            </ul>
          </div>
          {/* 나쁜 예시 */}
          <div className="example-column bad-example">
            <h3>Bad Example 👎</h3>
            <img src="https://images.pexels.com/photos/1893557/pexels-photo-1893557.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Bad" />
            <ul>
              <li>❌ 어둡고 노란 조명 사용</li>
              <li>❌ 흔들려서 초점이 흐림</li>
              <li>❌ 주변이 어지럽고 산만함</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideModal;