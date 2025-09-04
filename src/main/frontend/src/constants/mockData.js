// 주어진 배열에서 무작위 항목을 선택하는 유틸리티 함수
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 랜덤 타임스탬프를 '2025. 9. 1. 오후 9:30:00' 형식으로 생성하는 함수
const generateRandomTimestamp = () => {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const randomDate = new Date(threeDaysAgo.getTime() + Math.random() * (now.getTime() - threeDaysAgo.getTime()));

    const year = randomDate.getFullYear();
    const month = randomDate.getMonth() + 1;
    const day = randomDate.getDate();

    let hour = randomDate.getHours();
    const minute = String(randomDate.getMinutes()).padStart(2, '0');
    const second = String(randomDate.getSeconds()).padStart(2, '0');

    const ampm = hour >= 12 ? '오후' : '오전';
    hour = hour % 12;
    hour = hour ? hour : 12; // 0시일 경우 12로 변경

    return `${year}. ${month}. ${day}. ${ampm} ${hour}:${minute}:${second}`;
};

// 무작위 신고 데이터를 생성하는 메인 함수
const generateMockTickets = (count) => {
    const types = ['review', 'store'];
    const reviewReasons = ['abuse', 'spam', 'wrong_info'];
    const storeReasons = ['wrong_hours', 'wrong_location', 'closed'];
    const statuses = ['new', 'in_progress', 'resolved'];

    // 사유에 따른 상세 내용 예시
    const reasonDetails = {
        'abuse': '심한 욕설과 비방이 포함되어 있습니다. 확인 부탁드립니다.',
        'spam': '광고성 내용으로 의심됩니다. 확인해주세요.',
        'wrong_info': '잘못된 정보가 기재되어 있습니다. 수정이 필요합니다.',
        'wrong_hours': '영업시간이 잘못 기재되어 있습니다. 확인 부탁드립니다.',
        'wrong_location': '주소가 다릅니다. 지도가 잘못 표시되어 있어요.',
        'closed': '이미 폐업한 가게인데 정보가 남아있습니다.'
    };

    const tickets = [];
    for (let i = 1; i <= count; i++) {
        const id = `TICKET-${i}`;
        const type = getRandomItem(types);
        
        let reason;
        if (type === 'review') {
            reason = getRandomItem(reviewReasons);
        } else {
            reason = getRandomItem(storeReasons);
        }

        const details = reasonDetails[reason];
        const status = getRandomItem(statuses);
        const timestamp = generateRandomTimestamp();
        
        const targetId = `${type === 'review' ? 'rev-' : 'store-'}${Math.random().toString(36).substring(2, 8)}`;

        tickets.push({
            id,
            type,
            targetId,
            reason,
            details,
            status,
            timestamp,
        });
    }

    return tickets;
};

// 사용 예시: 5개의 무작위 데이터를 생성합니다.
const mockTickets = generateMockTickets(5);
console.log(mockTickets);