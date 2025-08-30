import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import WeatherInfo from '../components/WeatherInfo';
import MissionCard from '../components/MissionCard';
import MyMenu from '../components/MyMenu';
import { getCurrentUser } from '../utils/storage';
import LocationService from '../services/LocationService';
import WeatherService from '../services/WeatherService';
import { testAPIConnection, testSignUpAPI } from '../utils/testAPI';
import { Alert } from 'react-native';

const ReturneeMainScreen = ({ navigation }) => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('고향에왓고님');
  const [isLoading, setIsLoading] = useState(true);

  // 날씨 관련 상태
  const [weatherData, setWeatherData] = useState({
    weather: '맑음',
    temperature: 20,
    airQuality: '대기 최고',
    location: '함안군 가야읍'
  });
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  // 미션 데이터 (실제로는 API에서 가져올 데이터)
  const [missionData, setMissionData] = useState({
    userName: '',
    todayMission: '가야초등학교를 방문하기',
    remaining: {
      exploration: 23,
      bonding: 40,
      career: 23,
    },
    completed: {
      exploration: 10,
      bonding: 15,
      career: 0,
    },
  });

  useEffect(() => {
    // 현재 날짜 업데이트
    const updateDateTime = () => {
      const now = new Date();
      const dateString = now.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });

      setCurrentDate(dateString);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000); // 1분마다 업데이트

    // 앱 시작시 날씨 정보 로드
    loadWeatherData();

    return () => clearInterval(interval);
  }, []);

  // 날씨 데이터 로드
  const loadWeatherData = async () => {
    try {
      setIsWeatherLoading(true);
      console.log('🌤️ 날씨 데이터 로드 시작...');

      // 권한 상태 디버깅
      await LocationService.debugPermissionStatus();

      // 위치 권한 요청 및 현재 위치 가져오기
      const location = await LocationService.getLocationWithPermission();

      if (location) {
        console.log('📍 위치 정보 획득:', location);

        // 백엔드에서 날씨 정보 가져오기
        const weather = await WeatherService.getCurrentWeather(
          location.latitude,
          location.longitude
        );

        setWeatherData({
          weather: weather.weather,
          temperature: weather.temperature,
          airQuality: weather.airQuality,
          location: weather.location
        });

        console.log('✅ 날씨 정보 로드 완료:', weather);
      } else {
        console.log('⚠️ 위치 정보를 가져올 수 없어 기본 날씨 정보 사용');
        // 기본값 유지
      }
    } catch (error) {
      console.error('❌ 날씨 정보 로드 오류:', error);
    } finally {
      setIsWeatherLoading(false);
    }
  };

  // 화면이 포커스될 때마다 사용자 정보 새로고침
  useFocusEffect(
    React.useCallback(() => {
      const loadUser = async () => {
        try {
          setIsLoading(true);
          const currentUser = await getCurrentUser();
          if (currentUser && currentUser.name) {
            setUser(currentUser);
            const userName = currentUser.name;
            setUserName(userName);
            setMissionData(prev => ({
              ...prev,
              userName: userName
            }));
            console.log('✅ 사용자 정보 로드 완료:', userName);
          } else {
            console.log('⚠️ 사용자 정보가 없습니다');
          }
        } catch (error) {
          console.error('사용자 정보 로드 오류:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadUser();
    }, [])
  );

  const handleViewCompleted = () => {
    // 미션 대시보드로 이동
    navigation.navigate('MissionDashboard');
  };

  const handleStartMission = () => {
    // 미션 로딩 화면으로 이동
    navigation.navigate('MissionLoading');
  };

  const handleViewAll = () => {
    // 미션 리스트 화면으로 이동
    navigation.navigate('MissionList');
  };

  const handleAIChatbot = () => {
    // AI 챗봇 화면으로 이동
    navigation.navigate('Chatbot');
  };

  const handleMissionDashboard = () => {
    // 미션 대시보드 화면으로 이동
    navigation.navigate('MissionDashboard');
  };

  const handleFindEducation = () => {
    // 멘토게시판으로 바로 이동
    navigation.navigate('MentorBoard');
  };

  const handleBoard = () => {
    // 게시판 화면으로 이동
    navigation.navigate('Board');
  };

  const handleAccountSwitch = () => {
    // 계정 전환 기능
    console.log('계정 전환');
  };

  const handleExplorationMission = () => {
    // 탐색형 미션 화면으로 이동
    navigation.navigate('ExplorationMission');
  };

  const handleTestMap = () => {
    // 지도 테스트 화면으로 이동
    navigation.navigate('TestMap');
  };

  const handleTestAPI = async () => {
    // API 연결 테스트
    const result = await testAPIConnection();
    if (result.success) {
      Alert.alert('성공', 'API 연결이 성공했습니다!');
    } else {
      Alert.alert('실패', `API 연결 실패: ${result.error}`);
    }
  };

  const handleTestSignUp = async () => {
    // 회원가입 API 테스트
    const result = await testSignUpAPI();
    if (result.success) {
      Alert.alert('성공', '회원가입 API 테스트 성공!');
    } else {
      Alert.alert('실패', `회원가입 API 테스트 실패: ${result.error}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6956E5" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.dateRow}>
            <Text style={styles.date}>{currentDate}</Text>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notification')}
            >
              <Image
                source={require('../assets/images/notification.png')}
                style={styles.notificationIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.greeting}>고향에서의 오늘은{'\n'}어떤 하루일까요?</Text>
          <View style={styles.locationContainer}>
            <Text style={styles.location}>{weatherData.location}</Text>
            <WeatherInfo
              weather={weatherData.weather}
              temperature={weatherData.temperature}
              airQuality={weatherData.airQuality}
              isLoading={isWeatherLoading}
            />
          </View>
        </View>
      </View>

      {/* User Input Section - Fixed above scroll */}
      <View style={styles.userInputSection}>
        <View style={styles.inputContainer}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>🐎</Text>
          </View>
          <Text style={styles.userNameText}>
            {userName}님
          </Text>
          <TouchableOpacity
            style={styles.accountSwitchButton}
            onPress={handleAccountSwitch}
          >
            <Text style={styles.accountSwitchIcon}>👥</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content with White Background */}
      <View style={styles.scrollContainer}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Mission Card */}
          <MissionCard
            mission={missionData}
            onViewCompleted={handleViewCompleted}
            onStartMission={handleStartMission}
            onViewAll={handleViewAll}
          />

          {/* My Menu */}
          <MyMenu
            onAIChatbot={handleAIChatbot}
            onMissionDashboard={handleMissionDashboard}
            onFindEducation={handleFindEducation}
            onBoard={handleBoard}
            onExplorationMission={handleExplorationMission}
            onTestMap={handleTestMap}
            onTestAPI={handleTestAPI}
            onTestSignUp={handleTestSignUp}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6956E5',
  },
  header: {
    backgroundColor: '#6956E5',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  date: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  greeting: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 15,
    lineHeight: 30,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  location: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
  notificationButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    width: 20,
    height: 20,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  userInputSection: {
    paddingHorizontal: 20,
    paddingBottom: 5,
    marginTop: -15,
  },
  inputContainer: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    fontSize: 24,
  },
  userNameText: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    paddingVertical: 0,
  },
  accountSwitchButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountSwitchIcon: {
    fontSize: 18,
  },
});

export default ReturneeMainScreen;
