import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

const API_BASE_URL = 'http://10.0.2.2:8000/api'; // Replace with your Django backend URL

interface UserData {
  id: number;
  email: string;
  name: string;
  birth_year: number;
  region: string;
  adapt_score: number;
}

const MyPageScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
      console.error('Error fetching user data:', err);
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  noDataText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default MyPageScreen;
