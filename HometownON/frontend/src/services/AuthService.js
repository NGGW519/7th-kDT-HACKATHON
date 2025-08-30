import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.0.2.2:8000/api'; // Android 에뮬레이터용

class AuthService {
  // 회원가입 API 호출
  static async signUp(userData) {
    try {
      console.log('? 회원가입 API 호출:', userData);
      
      const response = await fetch(`${API_BASE_URL}/users/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          phone: userData.phone || null,
          profile: {
            display_name: userData.name,
            birth_year: userData.birthYear || new Date().getFullYear() - 30,
            gender: userData.gender || null,
            home_region: userData.hometown || '함안군',
            target_region: userData.targetRegion || '함안군',
            bio: userData.bio || null,
            mentor_available: userData.userType === 'mentor',
            mentor_hourly_rate: userData.mentorHourlyRate || null,
            preferences: {
              userType: userData.userType,
              careerType: userData.careerType,
              careerPlan: userData.careerPlan,
              previousCareer: userData.previousCareer,
              personality: userData.personality,
              hometownSchool: userData.hometownSchool,
            },
            profile_image: userData.picture || null,
          }
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || '회원가입에 실패했습니다.');
      }

      console.log('? 회원가입 성공:', data);
      return { success: true, data };
    } catch (error) {
      console.error('? 회원가입 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 로그인 API 호출
  static async signIn(email, password) {
    try {
      console.log('? 로그인 API 호출:', email);
      
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || '로그인에 실패했습니다.');
      }

      // JWT 토큰 저장
      await AsyncStorage.setItem('access_token', data.access_token);
      
      console.log('? 로그인 성공:', data);
      return { success: true, data };
    } catch (error) {
      console.error('? 로그인 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // Google 로그인 API 호출
  static async googleSignIn(idToken) {
    try {
      console.log('? Google 로그인 API 호출');
      
      const response = await fetch(`${API_BASE_URL}/users/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: idToken,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Google 로그인에 실패했습니다.');
      }

      // JWT 토큰 저장
      await AsyncStorage.setItem('access_token', data.access_token);
      
      console.log('? Google 로그인 성공:', data);
      return { success: true, data };
    } catch (error) {
      console.error('? Google 로그인 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 현재 사용자 정보 가져오기
  static async getCurrentUser() {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        return { success: false, error: '로그인이 필요합니다.' };
      }

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || '사용자 정보를 가져올 수 없습니다.');
      }

      console.log('? 사용자 정보 조회 성공:', data);
      return { success: true, data };
    } catch (error) {
      console.error('? 사용자 정보 조회 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 로그아웃
  static async signOut() {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('current_user');
      console.log('? 로그아웃 완료');
      return { success: true };
    } catch (error) {
      console.error('? 로그아웃 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 토큰 확인
  static async getToken() {
    try {
      const token = await AsyncStorage.getItem('access_token');
      return token;
    } catch (error) {
      console.error('? 토큰 조회 실패:', error);
      return null;
    }
  }
}

export default AuthService;