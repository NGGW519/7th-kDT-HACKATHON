// API 연결 테스트용 유틸리티

const API_BASE_URL = 'http://10.0.2.2:8000';

export const testAPIConnection = async () => {
  try {
    console.log('? API 연결 테스트 시작...');
    
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('? API 연결 성공:', data);
    return { success: true, data };
  } catch (error) {
    console.error('? API 연결 실패:', error);
    return { success: false, error: error.message };
  }
};

export const testSignUpAPI = async () => {
  try {
    console.log('? 회원가입 API 테스트 시작...');
    
    const testUserData = {
      email: "test@example.com",
      password: "test123456",
      phone: null,
      profile: {
        display_name: "테스트 사용자",
        birth_year: 1990,
        gender: null,
        home_region: "함안군",
        target_region: "함안군",
        bio: null,
        mentor_available: false,
        mentor_hourly_rate: null,
        preferences: {
          userType: "returnee",
          careerType: "창업",
          careerPlan: "새로운 도전",
          previousCareer: "IT 개발자",
          personality: "적극적",
          hometownSchool: "함안초등학교",
        },
        profile_image: null,
      }
    };

    const response = await fetch(`${API_BASE_URL}/api/users/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUserData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('? 회원가입 API 실패:', data);
      return { success: false, error: data.detail || '회원가입 실패' };
    }

    console.log('? 회원가입 API 성공:', data);
    return { success: true, data };
  } catch (error) {
    console.error('? 회원가입 API 오류:', error);
    return { success: false, error: error.message };
  }
};