import AuthService from './AuthService';

// 로그인 토큰이 있으면 Authorization 헤더를 붙인 헤더 객체를 돌려준다. (토큰 없으면 헤더 생략)
export async function authHeaders(extra = {}) {
  const token = await AuthService.getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
}
