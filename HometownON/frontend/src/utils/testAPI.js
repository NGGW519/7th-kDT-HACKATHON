// API ���� �׽�Ʈ�� ��ƿ��Ƽ

const API_BASE_URL = 'http://10.0.2.2:8000';

export const testAPIConnection = async () => {
  try {
    console.log('? API ���� �׽�Ʈ ����...');
    
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('? API ���� ����:', data);
    return { success: true, data };
  } catch (error) {
    console.error('? API ���� ����:', error);
    return { success: false, error: error.message };
  }
};

export const testSignUpAPI = async () => {
  try {
    console.log('? ȸ������ API �׽�Ʈ ����...');
    
    const testUserData = {
      email: "test@example.com",
      password: "test123456",
      phone: null,
      profile: {
        display_name: "�׽�Ʈ �����",
        birth_year: 1990,
        gender: null,
        home_region: "�Ծȱ�",
        target_region: "�Ծȱ�",
        bio: null,
        mentor_available: false,
        mentor_hourly_rate: null,
        preferences: {
          userType: "returnee",
          careerType: "â��",
          careerPlan: "���ο� ����",
          previousCareer: "IT ������",
          personality: "������",
          hometownSchool: "�Ծ��ʵ��б�",
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
      console.error('? ȸ������ API ����:', data);
      return { success: false, error: data.detail || 'ȸ������ ����' };
    }

    console.log('? ȸ������ API ����:', data);
    return { success: true, data };
  } catch (error) {
    console.error('? ȸ������ API ����:', error);
    return { success: false, error: error.message };
  }
};