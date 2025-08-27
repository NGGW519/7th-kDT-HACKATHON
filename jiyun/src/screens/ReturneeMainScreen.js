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
import WeatherInfo from '../components/WeatherInfo';
import MissionCard from '../components/MissionCard';
import MyMenu from '../components/MyMenu';
import { getCurrentUser } from '../utils/storage';

const ReturneeMainScreen = ({ navigation }) => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('고향에왓고님');

  // 미션 데이터 (실제로는 API에서 가져올 데이터)
  const [missionData, setMissionData] = useState({
    userName: '고향에왓고님',
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

    // 사용자 정보 가져오기
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          const userName = currentUser.name || '고향에왓고님';
          setUserName(userName);
          setMissionData(prev => ({
            ...prev,
            userName: userName
          }));
        }
      } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
      }
    };

    loadUser();

    return () => clearInterval(interval);
  }, []);

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
    // 교육/멘토 찾기 화면으로 이동
    navigation.navigate('EducationMentor');
  };

  const handleBoard = () => {
    // 게시판 화면으로 이동
    navigation.navigate('Board');
  };

  const handleAccountSwitch = () => {
    // 계정 전환 기능
    console.log('계정 전환');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6956E5" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.dateRow}>
            <Text style={styles.date}>{currentDate}</Text>
            <TouchableOpacity style={styles.notificationButton}>
              <Image 
                source={require('../assets/images/notification.png')}
                style={styles.notificationIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.greeting}>고향에서의 오늘은{'\n'}어떤 하루일까요?</Text>
          <View style={styles.locationContainer}>
            <Text style={styles.location}>함안군 가야읍</Text>
            <WeatherInfo 
              weather="맑음"
              temperature="20"
              airQuality="대기 최고"
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
