import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// ===== 공통: Access 헤더 자동 첨부 =====
api.interceptors.request.use((cfg) => {
  const access = localStorage.getItem('access');
  if (access) {
    const bearer = /^Bearer\s/i.test(access) ? access : `Bearer ${access}`;
    cfg.headers = cfg.headers ?? {};
    // 이미 Authorization가 있으면 덮어쓰지 않음
    if (!cfg.headers.Authorization) {
      cfg.headers.Authorization = bearer;
    }
  }
  return cfg;
});

// ===== 401/403 → 자동 재발급 후 재시도 =====
let isRefreshing = false;
let refreshPromise = null;
const requestQueue = [];

const runQueued = (newAccess) => {
  requestQueue.splice(0).forEach(({ resolve, reject, cfg }) => {
    try {
      cfg.headers = cfg.headers ?? {};
      cfg.headers.Authorization = `Bearer ${newAccess}`;
      resolve(api(cfg));
    } catch (e) {
      reject(e);
    }
  });
};

const flushWithError = (err) => {
  requestQueue.splice(0).forEach(({ reject }) => reject(err));
};

// refresh 전용 클라이언트(인터셉터 없음)
const bare = axios.create({ baseURL: '/api' });

api.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err) => {
    const status = err?.response?.status;
    const cfg = err?.config || {};
    const url = cfg?.url || '';

    console.log('[ERR]', status ?? 'NETWORK', url, err?.response?.data || err.message);

    // 재발급 대상 아님: 네트워크 오류이거나, refresh 호출 자체에서 터진 경우
    if (!status || (status !== 401 && status !== 403) || cfg._retry || url.includes('/refresh')) {
      return Promise.reject(err);
    }

    // 저장된 refresh 토큰 확인
    const refresh = localStorage.getItem('refresh');
    if (!refresh) {
      // 토큰 없음 → 바로 로그아웃
      localStorage.removeItem('access');
      // if (window.location.pathname !== '/login') window.location.href = '/login';
      return Promise.reject(err);
    }

    // 같은 시점에 여러 요청이 401이 되면 큐에 쌓았다가 한 번에 재시도
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        requestQueue.push({ resolve, reject, cfg: { ...cfg, _retry: true } });
      });
    }

    // 여기서 실제 재발급 시도
    try {
      isRefreshing = true;
      cfg._retry = true;

      if (!refreshPromise) {
        refreshPromise = bare.post('/refresh', { refresh });
      }

      const r = await refreshPromise;
      const newAccess =
        r?.data?.access ?? r?.data?.accessToken ?? r?.data?.token ?? r?.data?.jwt ?? null;
      const newRefresh = r?.data?.refresh ?? null;

      if (!newAccess) {
        throw new Error('No access token in refresh response');
      }

      // 스토리지 업데이트
      localStorage.setItem('access', newAccess);
      if (newRefresh) localStorage.setItem('refresh', newRefresh);

      // 대기중인 요청들 재시도
      runQueued(newAccess);

      // 현재 실패했던 요청도 재시도
      cfg.headers = cfg.headers ?? {};
      cfg.headers.Authorization = `Bearer ${newAccess}`;
      return api(cfg);
    } catch (e) {
      // 재발급 실패 → 모두 실패 처리 + 로그아웃
      flushWithError(e);
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      if (window.location.pathname !== '/login') window.location.href = '/login';
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  }
);

// 식당 목록 가져오기
export const getRestaurants = (params) => {
  return api.get('/restaurants/getAllRestaurants', { params });
};

// 식당 상세 정보 가져오기
export const getRestaurantDetail = (id) => {
  return api.get(`/restaurants/${id}`);
};

// 식당 태그 정보 가져오기
export const getRestaurantTags = (id) => {
  return api.get(`/restaurants/${id}/tags`);
};

// 모든 태그 코드 가져오기
export const getAllTagCodes = () => {
  return api.get('/restaurants/tagCodes');
};

// 북마크 토글하기 (POST 요청)
export const toggleBookmark = (restaurantId) => {
  return api.post(`/bookmarks/${restaurantId}`);
};

// 내 북마크 목록 가져오기 (GET 요청)
export const getMyBookmarks = () => {
  return api.get('/bookmarks/me');
};

export const getRestaurantReviews = async (restaurantId, page = 0, size = 10) => {
    try {
        const response = await api.get(`/reviews/${restaurantId}`,{
          params: {
            page: page,
            size: size
          }
        });
        return response.data;
    } catch (error) {
        console.error(`식당 ID ${restaurantId}의 리뷰 목록을 가져오는 데 실패했습니다:`, error);
        throw error;
    }
};

export const getOperationTimesByRestaurantId = async (restaurantId) => {
    try {
        const response = await api.get(`/operation-times/restaurants/${restaurantId}`);
        return response.data;
    } catch (error) {
        console.error(`레스토랑 ID ${restaurantId}의 운영 시간 정보 조회 실패:`, error);
        throw error;
    }
};

export const getOperationTimesForToday = async (restaurantId) => {
    try {
        const response = await api.get(`/operation-times/restaurants/${restaurantId}/today`);
        return response.data;
    } catch (error) {
        console.error(`레스토랑 ID ${restaurantId}의 오늘 운영 시간 정보 조회 실패:`, error);
        throw error;
    }
};

export default api;