import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { styles } from './MyPageScreen.styles';

const API_BASE_URL = 'http://10.0.2.2:8000/api'; // Django 백엔드 API 기본 URL

/**
 * @interface UserData
 * @description 사용자 데이터 구조를 정의합니다.
 * @property {number} id - 사용자 ID.
 * @property {string} email - 사용자 이메일.
 * @property {string} name - 사용자 이름.
 * @property {number} birth_year - 출생 연도.
 * @property {string} region - 지역.
 * @property {number} adapt_score - 적응 점수.
 */
interface UserData {
  id: number;
  email: string;
  name: string;
  birth_year: number;
  region: string;
  adapt_score: number;
}

/**
 * @function MyPageScreen
 * @description 사용자 마이 페이지 화면 컴포넌트.
 * 사용자 정보를 표시하고 로그아웃 기능을 제공합니다.
 * @param {{ navigation: any }} props - 컴포넌트 props.
 */
const MyPageScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * @function fetchUserData
   * @description 사용자 정보를 백엔드에서 불러오는 비동기 함수.
   * @returns {Promise<void>}
   */
  const fetchUserData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        setError('로그인 정보가 없습니다.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/me/`, {
        headers: {
          Authorization: `Token ${userToken}`,
        },
      });
      setUserData(response.data);
    } catch (err) {
      // console.error('Error fetching user data:', err);
      setError('사용자 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  /**
   * @function handleLogout
   * @description 사용자 로그아웃을 처리하는 함수.
   * AsyncStorage에서 사용자 토큰을 제거하고 스플래시 화면으로 리디렉션합니다.
   * @returns {Promise<void>}
   */
  const handleLogout = async () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          onPress: async () => {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('userEmail');
            // 로그인 화면으로 리디렉션 (예: 스택 초기화)
            navigation.reset({
              index: 0,
              routes: [{ name: 'Splash' }], // Splash 화면으로 이동하여 앱 초기화
            });
          },
        },
      ],
      { cancelable: false }
    );
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>사용자 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchUserData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>마이 페이지</Text>
      {userData ? (
        <View style={styles.card}>
          <Text style={styles.label}>이름:</Text>
          <Text style={styles.value}>{userData.name}</Text>

          <Text style={styles.label}>이메일:</Text>
          <Text style={styles.value}>{userData.email}</Text>

          <Text style={styles.label}>출생년도:</Text>
          <Text style={styles.value}>{userData.birth_year}</Text>

          <Text style={styles.label}>지역:</Text>
          <Text style={styles.value}>{userData.region}</Text>

          <Text style={styles.label}>적응 점수:</Text>
          <Text style={styles.value}>{userData.adapt_score}</Text>
        </View>
      ) : (
        <Text style={styles.noDataText}>사용자 정보를 찾을 수 없습니다.</Text>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MyPageScreen;
