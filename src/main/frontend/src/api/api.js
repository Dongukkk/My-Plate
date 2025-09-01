import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

/**
 * 요청 인터셉터
 * - access 토큰 자동 첨부 (이미 "Bearer "로 시작하면 그대로 사용)
 * - 디버그 로그 출력
 */
api.interceptors.request.use((cfg) => {
  const access = localStorage.getItem('access');

  if (access) {
    const bearer = /^Bearer\s/i.test(access) ? access : `Bearer ${access}`;
    cfg.headers = cfg.headers ?? {};
    cfg.headers.Authorization = bearer;
  }

  console.log('[REQ]', (cfg.method || 'GET').toUpperCase(), cfg.url, cfg.data);
  return cfg;
});

/**
 * 응답 인터셉터
 * - 디버그 로그
 * - 401/403이면 access 토큰 제거하고 로그인으로 이동
 */
api.interceptors.response.use(
  (res) => {
    console.log('[RES]', res.status, res.config?.url, res.data);
    return res;
  },
  (err) => {
    const status = err?.response?.status;
    const data = err?.response?.data;

    console.log('[ERR]', status ?? 'NETWORK', err?.config?.url, data || err.message);

    if (status === 401 || status === 403) {
      try {
        localStorage.removeItem('access');
        // 필요하면 refresh도 함께 제거:
        // localStorage.removeItem('refresh');
      } finally {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export default api;