import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, {
  getMe,
  getMyStats,
  updateMyName,
  getMyRecentReviews,
  getMyBookmarks,
  getRestaurantDetail,
} from '../api/api';
import './MyPage.css';
import SideBarMenu from '../components/SideBarMenu';

const NICK_RULE = /^[가-힣a-zA-Z0-9_-]{2,20}$/;

const MONTH_IDX = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };

function parseLegacyBookmarkDate(str) {
  if (!str || typeof str !== 'string') return null;
  const m = str.match(
    /^[A-Za-z]{3}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s+(\d{2}):(\d{2}):(\d{2})\s+[A-Z]{2,5}\s+(\d{4})$/
  );
  if (!m) return null;
  const [, mon, d, hh, mm, ss, yyyy] = m;
  return new Date(Number(yyyy), MONTH_IDX[mon], Number(d), Number(hh), Number(mm), Number(ss));
}
function coerceDate(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === 'number') return new Date(v);
  if (typeof v === 'string') {
    const n = Date.parse(v);
    if (!Number.isNaN(n)) return new Date(n);
    const legacy = parseLegacyBookmarkDate(v);
    if (legacy) return legacy;
  }
  return null;
}

export default function MyPage() {
  const [me, setMe] = useState(null);
  const [msg, setMsg] = useState('');

  // 닉네임 편집
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // KPI
  const [stats, setStats] = useState({
    reviewCount: 0,
    bookmarkCount: 0,
    visitCount: 0,
    averageRating: 0,
  });

  // 최근 리뷰(3)
  const [reviews, setReviews] = useState([]);
  const [rvLoading, setRvLoading] = useState(true);

  // 즐겨찾기 미리보기(3)
  const [bm3, setBm3] = useState([]);
  const [bmLoading, setBmLoading] = useState(true);

  const navigate = useNavigate();

  // ===== 유틸 =====
  const fmtDate = (s) => {
    try {
      return new Date(s).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' });
    } catch { return s; }
  };
  const toArr = (data) => Array.isArray(data) ? data : (data?.content || data?.items || data?.data || []);

  // 레스토랑/북마크 응답 → 미리보기 아이템(원본 보존)
  const normalizeBookmarkItem = (item) => {
    const r = item?.restaurant || item?.restaurantDto || item?.store || item?.rest || null;
    const base = r || item;

    const id =
      base?.restaurantId ?? base?.id ??
      item?.restaurantId ?? item?.restId ?? item?.storeId ?? item?.targetId;

    const name =
      base?.restaurantName ?? base?.name ?? base?.title ?? base?.storeName ??
      item?.restaurantName ?? item?.name;

    const roadAddress =
      base?.roadAddress ?? base?.address2 ?? base?.address ?? base?.roadAddr ?? base?.addr ??
      item?.roadAddress ?? item?.address;

    const phone =
      base?.phone ?? base?.tel ?? base?.telephone ?? base?.phoneNumber ?? item?.phone;

    const rating = base?.rating ?? base?.avgRating ?? item?.rating;

    const createdAt =
      coerceDate(item?.bookmarkedAt) ??
      coerceDate(item?.createdAt) ??
      coerceDate(item?.created_at) ??
      coerceDate(item?.createdDate) ??
      coerceDate(item?.regDate) ??
      coerceDate(item?.created);

    return { id, name, roadAddress, phone, rating, createdAt, raw: item };
  };

  // 중복 제거(id 기준)
  const dedupById = (arr) => {
    const seen = new Set();
    const out = [];
    for (const x of arr) {
      if (!x?.id) continue;
      if (seen.has(String(x.id))) continue;
      seen.add(String(x.id));
      out.push(x);
    }
    return out;
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const meData = await getMe();
        if (!mounted) return;
        setMe(meData);
        setNickname(meData?.name ?? meData?.username ?? '');

        // KPI
        try {
          const s = await getMyStats();
          if (!mounted) return;
          setStats({
            reviewCount: Number(s?.reviewCount ?? 0),
            bookmarkCount: Number(s?.bookmarkCount ?? 0),
            visitCount: Number(s?.visitCount ?? 0),
            averageRating: Number(s?.averageRating ?? 0),
          });
        } catch (e) {
          console.warn('getMyStats failed:', e?.response?.data || e.message);
        }

        // 최근 리뷰(3)
        try {
          const list = await getMyRecentReviews(3);
          if (!mounted) return;
          setReviews(Array.isArray(list) ? list : (list?.content || []));
        } catch (e) {
          console.warn('getMyRecentReviews(3) failed:', e?.response?.data || e.message);
        } finally {
          if (mounted) setRvLoading(false);
        }

        // 즐겨찾기 미리보기(3)
        let preview = [];
        try {
          const r1 = await api.get('/account/bookmarks', { params: { limit: 3 } });
          const list = toArr(r1?.data).map(normalizeBookmarkItem);
          preview = dedupById(list).slice(0, 3);
        } catch (_) {}

        if (!preview.length) {
          try {
            const r2 = await getMyBookmarks();
            const list = toArr(r2?.data).map(normalizeBookmarkItem);
            preview = dedupById(list).slice(0, 3);
          } catch (_) {}
        }

        if (preview.length) {
          const needIdx = preview
            .map((x, i) => (!x.name || !x.roadAddress ? i : -1))
            .filter(i => i >= 0);
          if (needIdx.length) {
            const results = await Promise.allSettled(
              needIdx.map(i => getRestaurantDetail(preview[i].id))
            );
            results.forEach((res, k) => {
              const i = needIdx[k];
              if (res.status === 'fulfilled') {
                const d = res.value?.data ?? {};
                preview[i].name = preview[i].name || d.name || d.restaurantName || d.title || d.storeName;
                preview[i].roadAddress = preview[i].roadAddress || d.roadAddress || d.address2 || d.address || d.roadAddr || d.addr;
                preview[i].phone = preview[i].phone || d.phone || d.tel || d.telephone || d.phoneNumber;
                preview[i].rating = preview[i].rating ?? d.rating ?? d.avgRating;
              }
            });
          }
        }

        if (!mounted) return;
        setBm3(preview);
      } catch (e) {
        const data = e?.response?.data;
        setMsg(typeof data === 'string' ? data : (data?.message || '불러오기 실패'));
      } finally {
        if (mounted) setBmLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // 이벤트
  const onLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/login', { replace: true });
  };

  const role = useMemo(() => String(me?.role || '').toUpperCase(), [me]);
  const providerName = useMemo(() => String(me?.provider || 'MYPLATE').toUpperCase(), [me]);

  const initials = useMemo(() => {
    const base = me?.name || me?.username || me?.email || '?';
    const parts = String(base).trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const second = parts[1]?.[0] ?? '';
    return (first + second || first || '?').toUpperCase();
  }, [me]);

  // 닉네임 편집
  const startEdit = () => {
    setNickname(me?.name ?? me?.username ?? '');
    setError('');
    setEditing(true);
  };
  const cancelEdit = () => {
    setEditing(false);
    setError('');
    setNickname(me?.name ?? me?.username ?? '');
  };
  const saveNick = async () => {
    const next = (nickname ?? '').trim();
    if (!NICK_RULE.test(next)) {
      setError('닉네임은 2~20자, 한글/영문/숫자/(_)(-)만 가능합니다.');
      return;
    }
    if (next === (me?.name ?? me?.username ?? '')) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateMyName(next);
      setMe((prev) => ({ ...prev, name: next, username: next }));
      setEditing(false);
    } catch (e) {
      const st = e?.response?.status;
      if (st === 409) setError('이미 사용 중인 닉네임입니다.');
      else if (st === 400) setError(e?.response?.data?.message || '형식이 올바르지 않습니다.');
      else setError('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (msg) return <div className="lp-myp-wrap"><div className="lp-myp-error">에러: {msg}</div></div>;
  if (!me) return <div className="lp-myp-wrap"><div className="lp-myp-loading">불러오는 중…</div></div>;

  return (
    <div className="app-shell with-sidebar">
      <aside className="app-sidebar">
        <SideBarMenu />
      </aside>

      <main className="app-main">
        <div className="lp-myp-wrap in-layout">
          <div className="lp-myp-card">
            {/* 헤더 */}
            <div className="lp-myp-header">
              <div className="lp-myp-avatar" aria-hidden>{initials}</div>
              <div className="lp-myp-id">
                <div className="lp-myp-name">{me.name || me.username || '사용자'}</div>
              </div>
              <div className="lp-myp-right">
                {role && <span className={`myp-badge ${role === 'ADMIN' ? 'is-admin' : 'is-user'}`}>{role}</span>}
              </div>
            </div>

            {/* provider / logout */}
            <div className="lp-myp-subbar">
              <div className="lp-myp-provider">{providerName}</div>
              <button className="lp-logout-top" onClick={onLogout}>로그아웃</button>
            </div>

            {/* 본문 */}
            <div className="lp-myp-body">
              {/* 이메일 */}
              <div className="lp-myp-row">
                <span className="lp-myp-key">이메일</span>
                <span className="lp-myp-val">{me.email}</span>
              </div>

              {/* 이름 편집 */}
              <div className="lp-myp-row">
                <span className="lp-myp-key">이름</span>
                {!editing ? (
                  <span className="lp-myp-val">
                    {me.name || me.username}
                    <button type="button" className="lp-myp-btn" onClick={startEdit}>수정</button>
                  </span>
                ) : (
                  <span className="lp-myp-val">
                    <input
                      className="lp-myp-input"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      maxLength={20}
                      placeholder="새 닉네임"
                      disabled={saving}
                    />
                    <button type="button" className="lp-myp-btn primary" onClick={saveNick} disabled={saving}>
                      저장
                    </button>
                    <button type="button" className="lp-myp-btn" onClick={cancelEdit} disabled={saving}>
                      취소
                    </button>
                    {error && <div className="lp-myp-error small">{error}</div>}
                  </span>
                )}
              </div>

              {/* KPI: 3개 */}
              <div className="lp-myp-kpis">
                <div className="kpi" onClick={() => navigate('/reviews')} role="button" tabIndex={0}>
                  <div className="num">{stats.reviewCount}</div>
                  <div className="label">내 리뷰</div>
                </div>
                <div className="kpi" onClick={() => navigate('/bookmarks')} role="button" tabIndex={0}>
                  <div className="num">{stats.bookmarkCount}</div>
                  <div className="label">즐겨찾기</div>
                </div>
                <div className="kpi">
                  <div className="num">{Number(stats.averageRating || 0).toFixed(1)}</div>
                  <div className="label">평균 평점</div>
                </div>
              </div>

              {/* 즐겨찾기(3) */}
              <div className="lp-myp-section">
                <div className="lp-myp-sec-head">
                  <div className="lp-myp-sec-title">즐겨찾기</div>
                  <button className="lp-myp-link sm" onClick={() => navigate('/bookmarks')}>전체보기</button>
                </div>

                {bmLoading ? (
                  <div className="lp-myp-loading sm">불러오는 중…</div>
                ) : bm3.length === 0 ? (
                  <div className="lp-myp-empty">즐겨찾기가 없어요.</div>
                ) : (
                  <ul className="lp-myp-reviewlist is-bookmarks">
                    {bm3.map((bm, i) => (
                      <li key={bm.id ?? i} className="lp-myp-rv">
                        <div
                          className="rv-row"
                          onClick={() => bm.id && navigate(`/restaurants/detail/${bm.id}`)}
                          style={{ cursor: bm.id ? 'pointer' : 'default' }}
                        >
                          <span className="rv-name">{bm.name || '(이름 없음)'}</span>
                          {bm.createdAt && (
                            <div className="rv-date" style={{ marginBottom: '5px', fontSize: '12px' }}>
                              {fmtDate(bm.createdAt)}
                            </div>
                          )}
                        </div>
                        {(bm.roadAddress || bm.phone) && (
                          <span className="rv-comment" style={{ fontSize: '12px', color: '#666' }}>
                            {bm.roadAddress || ''}{bm.roadAddress && bm.phone ? ' · ' : ''}{bm.phone || ''}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 최근 리뷰(3) */}
              <div className="lp-myp-section">
                <div className="lp-myp-sec-head">
                  <div className="lp-myp-sec-title">최근 리뷰</div>
                  <button className="lp-myp-link sm" onClick={() => navigate('/reviews')}>전체보기</button>
                </div>

                {rvLoading ? (
                  <div className="lp-myp-loading sm">불러오는 중…</div>
                ) : reviews.length === 0 ? (
                  <div className="lp-myp-empty">아직 리뷰가 없어요.</div>
                ) : (
                  <ul className="lp-myp-reviewlist is-reviews">
                    {reviews.map((rv) => (
                      <li key={rv.id ?? `${rv.restaurantId}-${rv.createdAt}`} className="lp-myp-rv">
                        <div className="rv-row" onClick={() => navigate(`/restaurants/detail/${rv.restaurantId}`)}>
                          <span className="rv-name">{rv.restaurantName}</span>
                          <span className="rv-rating">
                            <i aria-hidden>★</i>
                            <b>{Number(rv.rating || 0).toFixed(1)}</b>
                          </span>
                          <time
                            className="rv-date"
                            dateTime={rv.createdAt ? new Date(rv.createdAt).toISOString() : undefined}
                          >
                            {fmtDate(rv.createdAt)}
                          </time>
                        </div>
                        {rv.comment && <div className="rv-comment">{rv.comment}</div>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* 하단 */}
            <div className="lp-myp-actions">
              {role === 'ADMIN' && <Link to="/admin" className="lp-myp-link">관리자 페이지로</Link>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}