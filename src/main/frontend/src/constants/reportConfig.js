// src/constants/reportConfig.js
export const REPORT_CONFIG = {
  types: { store: "가게 정보 오류", review: "부적절한 리뷰" },
  reasons: {
    store: [
      { value: "closed", label: "폐업/장기휴업" },
      { value: "wrong_hours", label: "영업시간 변경" },
      { value: "wrong_info", label: "가게명/주소 변경" },
      { value: "other", label: "기타" }
    ],
    review: [
      { value: "inappropriate_photo", label: "부적절한 사진" },
      { value: "spam", label: "스팸/홍보성" },
      { value: "abuse", label: "욕설/비방" },
      { value: "privacy", label: "개인정보 노출" },
      { value: "other", label: "기타" }
    ]
  },
  status: { 
    new: "신규", 
    in_progress: "처리중", 
    resolved: "완료" 
  }
};