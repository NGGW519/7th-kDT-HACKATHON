import { API_BASE } from '../config/apiConfig';
import { authHeaders } from './apiClient';
import { errorText } from './AuthService';

// 서버 프로필 API. 결과는 { ok, status, data, error } 로 돌려준다.
// 401 은 '로그인이 필요합니다.', 그 밖의 실패는 errorText 문구.
const toResult = async (response, fallback) => {
  const data = await response.json().catch(() => ({}));
  if (response.ok) return { ok: true, status: response.status, data };
  const error = response.status === 401 ? '로그인이 필요합니다.' : errorText(data && data.detail, fallback);
  return { ok: false, status: response.status, error };
};

export async function fetchMe() {
  try {
    const response = await fetch(`${API_BASE}/users/me`, { headers: await authHeaders() });
    return await toResult(response, '사용자 정보를 불러오지 못했습니다.');
  } catch (e) {
    return { ok: false, status: 0, error: '서버에 연결할 수 없습니다.' };
  }
}

// body 에는 서버가 아는 칸만 넣는다 (display_name, home_region, target_region, bio, mentor_hourly_rate, preferences ...)
export async function patchMyProfile(body, fallback = '회원정보 수정 중 오류가 발생했습니다.') {
  try {
    const response = await fetch(`${API_BASE}/users/me/profile`, {
      method: 'PATCH',
      headers: await authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body),
    });
    return await toResult(response, fallback);
  } catch (e) {
    return { ok: false, status: 0, error: '서버에 연결할 수 없습니다.' };
  }
}

// preferences 는 서버에서 통째로 교체된다. 현재 값을 펼친 뒤 바꿀 키만 덮어쓴다.
// 값이 undefined 인 키는 덮어쓰지 않는다.
export function mergePreferences(current, changes) {
  const merged = { ...(current && typeof current === 'object' ? current : {}) };
  Object.keys(changes || {}).forEach((k) => {
    if (changes[k] !== undefined) merged[k] = changes[k];
  });
  return merged;
}

// 서버 사용자(GET /me 형식)를 기기 캐시 사용자에 합친다. 비밀번호는 다루지 않는다.
export function mergeServerUser(cached, server) {
  const profile = (server && server.profile) || {};
  return {
    ...(cached || {}),
    id: server.id,
    email: server.email,
    phone: server.phone,
    profile,
    name: profile.display_name || (cached && cached.name) || '',
    updatedAt: server.updated_at || new Date().toISOString(),
  };
}

// 가입 직후 기기 캐시로 저장할 사용자를 만든다. 서버 GET /me 결과가 있으면 그것을 기준으로 하고,
// 없으면 trim 한 입력값을 쓴다. Google 계정 이름이 아니라 사용자가 입력한 이름(서버 값)이 이름이 된다.
export async function buildSignupCache(local) {
  const trimmed = {};
  Object.keys(local || {}).forEach((k) => {
    trimmed[k] = typeof local[k] === 'string' ? local[k].trim() : local[k];
  });
  const me = await fetchMe();
  if (!me.ok) return trimmed;
  const p = (me.data && me.data.profile) || {};
  const merged = mergeServerUser(trimmed, me.data);
  ['returnName', 'mentorName', 'residentName'].forEach((k) => {
    if (k in merged && p.display_name) merged[k] = p.display_name;
  });
  if (p.home_region) {
    ['hometown', 'location'].forEach((k) => { if (k in merged) merged[k] = p.home_region; });
  }
  return merged;
}
