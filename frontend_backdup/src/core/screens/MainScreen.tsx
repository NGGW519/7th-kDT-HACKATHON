import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage 추가
import axios from 'axios'; // axios 추가
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RadarChart from '../../components/RadarChart';

interface MainScreenProps {
  route?: {
    params?: {
      scores?: number[];
    };
  };
  navigation?: any;
}

const TOTAL_BADGES = 10; // 전체 배지 수
const COMPLETED_BADGES = 6; // 완료된 배지 수 (임시 값)

export default function MainScreen({ route, navigation }: MainScreenProps) {
  

  const passedScores = route?.params?.scores;

  const randomScores = useMemo(
    () => Array.from({ length: 5 }, () => Math.floor(Math.random() * 6)),
    [passedScores],
  );

  const [scores, setScores] = useState<number[]>(passedScores ?? randomScores);

  useEffect(() => {
    if (passedScores) setScores(passedScores);
  }, [passedScores]);

  const regenerate = () => {
    setScores(Array.from({ length: 5 }, () => Math.floor(Math.random() * 6)));
  };

  /**
   * @function testLogin
   * @description 테스트 유저로 로그인하는 함수.
   * 백엔드 API를 호출하여 토큰을 받고 AsyncStorage에 저장합니다.
   */
  const testLogin = async () => {
    try {
      // 백엔드 서버 주소 (개발 환경에 맞게 변경 필요)
      const API_URL = 'http://10.0.2.2:8000/api/test-login/'; // Django 서버 주소

      const response = await axios.post(API_URL);
      const { token, user_id, email } = response.data;

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userId', user_id.toString());
      await AsyncStorage.setItem('userEmail', email);

      Alert.alert('로그인 성공', `테스트 유저 (${email})로 로그인되었습니다.`);
      // 로그인 후 필요한 화면으로 이동 (예: 메인 대시보드 새로고침 또는 다른 화면으로 navigate)
      // navigation.replace('MainDashboard'); // 예시
    } catch (error) {
      console.error('테스트 유저 로그인 실패:', error);
      Alert.alert('로그인 실패', '테스트 유저 로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <StatusBar hidden />
        {/* 헤더 섹션: 프로필 이미지, 환영 메시지, 레벨 배지 */}
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://example.com/profile.png' }}
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.welcomeText}>귀향자님 안녕하세요.</Text>
            <Text style={styles.subText}>
              현재 <Text style={{ fontWeight: 'bold' }}>Advanced Level</Text>입니다
            </Text>
          </View>
          <Image
            source={require('../../assets/images/advanced_level.png')}
            style={styles.levelBadge}
          />
        </View>

        {/* 테스트 유저 로그인 버튼 */}
        <TouchableOpacity onPress={testLogin} style={styles.testLoginButton}>
          <Text style={styles.testLoginButtonText}>테스트 유저로 로그인</Text>
        </TouchableOpacity>

        {/* AI 목표 제시 카드 */}
        <View style={styles.aiCard}>
          <View style={styles.aiTitleRow}>
            <Text style={styles.aiTitle}>AI 목표제시</Text>
            <Image
              source={require('../../assets/images/free-icon-ai-assistant-14355209.png')}
              style={styles.AiImage}
            />
          </View>

          <Text style={styles.aiContent}>
            Expert level까지 한번의 미션을 수행하시면 됩니다!{'\n'}
            의지 관련 미션이 적합해요. 멘토와 매칭해볼까요?
          </Text>
        </View>

        {/* 금일의 미션 추천 박스 */}
        <View style={styles.missionBox}>
          <Image
            source={require('../../assets/images/mission_assistant.png')}
            style={styles.dogImage}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.missionText}>금일의 미션추천</Text>
            <Text>오늘은 주민센터와 함께하는 운동데이입니다!</Text>
           {/* 바로가기 버튼 페이지 이동 */}
            <TouchableOpacity style={styles.missionButton} onPress={() => navigation?.navigate('MissionScreen')}>
              <Text style={styles.buttonText}>바로가기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 현재 인증 배지 현황 섹션 */}
        <View style={styles.badgeBox}>
          <Text style={styles.sectionTitle}>현재 인증배지 현황</Text>
          <Text style={styles.smallText}>xx회까지 xx개 중 4개 남았습니다.</Text>
        </View>
        <View style={styles.badgeRow}>
          {[...Array(TOTAL_BADGES)].map((_, i) => (
            <Image
              key={i}
              source={
                i < COMPLETED_BADGES
                  ? require('../../assets/images/badge.png')
                  : require('../../assets/images/badge_gray.png')
              }
              style={styles.badge}
            />
          ))}
        </View>

        {/* 활동 현황 차트 섹션 */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>활동현황</Text>
          <View style={styles.chartRow}>
            <View style={styles.chartInfo}>
              <Text>나의 지역적응도: 62%</Text>
              <Text>미션 진행도: 27%</Text>
              <Text>나의 온도: ?%</Text>
            </View>

            <View style={styles.chartWrapper}>
              <RadarChart scores={scores} />
            </View>
          </View>

          <TouchableOpacity onPress={regenerate} style={styles.testBtn}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>임의 점수 생성</Text>
          </TouchableOpacity>
        </View>

        {/* 지역 주민 페이지 이동 버튼 */}
        <TouchableOpacity
          style={styles.residentButton}
          onPress={() => navigation?.navigate('ResidentScreen')}
        >
          <Text style={styles.residentButtonText}>지역 주민 페이지로 이동</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

import { styles } from './MainScreen.styles';