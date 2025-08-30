import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.0.2.2:8000/api'; // Android ���ķ����Ϳ�

class AuthService {
  // ȸ������ API ȣ��
  static async signUp(userData) {
    try {
      console.log('? ȸ������ API ȣ��:', userData);
      
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
            home_region: userData.hometown || '�Ծȱ�',
            target_region: userData.targetRegion || '�Ծȱ�',
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
        throw new Error(data.detail || 'ȸ�����Կ� �����߽��ϴ�.');
      }

      console.log('? ȸ������ ����:', data);
      return { success: true, data };
    } catch (error) {
      console.error('? ȸ������ ����:', error);
      return { success: false, error: error.message };
    }
  }

  // �α��� API ȣ��
  static async signIn(email, password) {
    try {
      console.log('? �α��� API ȣ��:', email);
      
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
        throw new Error(data.detail || '�α��ο� �����߽��ϴ�.');
      }

      // JWT ��ū ����
      await AsyncStorage.setItem('access_token', data.access_token);
      
      console.log('? �α��� ����:', data);
      return { success: true, data };
    } catch (error) {
      console.error('? �α��� ����:', error);
      return { success: false, error: error.message };
    }
  }

  // Google �α��� API ȣ��
  static async googleSignIn(idToken) {
    try {
      console.log('? Google �α��� API ȣ��');
      
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
        throw new Error(data.detail || 'Google �α��ο� �����߽��ϴ�.');
      }

      // JWT ��ū ����
      await AsyncStorage.setItem('access_token', data.access_token);
      
      console.log('? Google �α��� ����:', data);
      return { success: true, data };
    } catch (error) {
      console.error('? Google �α��� ����:', error);
      return { success: false, error: error.message };
    }
  }

  // ���� ����� ���� ��������
  static async getCurrentUser() {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        return { success: false, error: '�α����� �ʿ��մϴ�.' };
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
        throw new Error(data.detail || '����� ������ ������ �� �����ϴ�.');
      }

      console.log('? ����� ���� ��ȸ ����:', data);
      return { success: true, data };
    } catch (error) {
      console.error('? ����� ���� ��ȸ ����:', error);
      return { success: false, error: error.message };
    }
  }

  // �α׾ƿ�
  static async signOut() {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('current_user');
      console.log('? �α׾ƿ� �Ϸ�');
      return { success: true };
    } catch (error) {
      console.error('? �α׾ƿ� ����:', error);
      return { success: false, error: error.message };
    }
  }

  // ��ū Ȯ��
  static async getToken() {
    try {
      const token = await AsyncStorage.getItem('access_token');
      return token;
    } catch (error) {
      console.error('? ��ū ��ȸ ����:', error);
      return null;
    }
  }
}

export default AuthService;