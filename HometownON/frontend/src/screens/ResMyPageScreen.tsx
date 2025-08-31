// src/screens/MyPageScreen.tsx
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getCurrentUser, logout } from '../utils/storage';

const COLORS = {
  primary: '#6956E5',
  white: '#FFFFFF',
};

function formatHeaderDate(d = new Date()) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(d);
}

export default function ResMyPageScreen() {
  const navigation = useNavigation<any>();
  const [currentUser, setCurrentUser] = useState<{ name?: string; email?: string } | null>(null);
  const dateText = useMemo(() => formatHeaderDate(), []);

  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user || null);
      } catch (e) {
        console.error('사용자 정보 로드 오류:', e);
      }
    })();
  }, []);

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            // ⚠️ 'Welcome' 스크린이 실제로 등록되어 있어야 합니다.
            navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
          } catch (error) {
            console.error('로그아웃 오류:', error);
            Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerDate}>{dateText}</Text>
        <Text style={styles.headerTitle}>마이페이지</Text>
        <View pointerEvents="none" style={styles.panelTopRound} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Section */}
        <View style={styles.userSection}>
          <View style={styles.userAvatar}>
            <Image
              // 프로젝트 내 다른 파일과 동일 경로 사용 (필요시 경로 조정)
              source={require('../assets/images/회원가입_지역주민.png')}
              style={styles.avatarImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{currentUser ? `${currentUser.name}님` : '사용자님'}</Text>
            <Text style={styles.userType}>귀향자</Text>
            <Text style={styles.userEmail}>{currentUser?.email ?? 'user@example.com'}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MissionList')}>
            <Text style={styles.menuIcon}>📋</Text>
            <Text style={styles.menuText}>내 미션 현황</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Achievement')}>
            <Text style={styles.menuIcon}>🏆</Text>
            <Text style={styles.menuText}>업적</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MissionDashboard')}>
            <Text style={styles.menuIcon}>📊</Text>
            <Text style={styles.menuText}>미션 대시보드</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('GoalSetting')}>
            <Text style={styles.menuIcon}>🎯</Text>
            <Text style={styles.menuText}>목표 설정</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('LearningHistory')}>
            <Text style={styles.menuIcon}>📚</Text>
            <Text style={styles.menuText}>학습 기록</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ConnectedMentors')}>
            <Text style={styles.menuIcon}>🤝</Text>
            <Text style={styles.menuText}>연결된 멘토</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ResSettingsScreen')}>
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuText}>설정</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ResHelp')}>
            <Text style={styles.menuIcon}>❓</Text>
            <Text style={styles.menuText}>도움말</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 0,
    position: 'relative',
  },
  headerDate: { color: '#EDE6FF', fontSize: 13, marginBottom: 12 },
  headerTitle: { color: COLORS.white, fontSize: 22, fontWeight: '800' },
  panelTopRound: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -16,
    height: 30,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  content: { flex: 1, backgroundColor: '#F8F9FA', padding: 20 },

  userSection: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarImage: { width: 70, height: 70 },
  userInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  userType: {
    fontSize: 14,
    color: '#6956E5',
    fontWeight: '600',
    marginBottom: 5,
    backgroundColor: '#F0F0FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  userEmail: { fontSize: 14, color: '#666' },

  menuSection: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuIcon: { fontSize: 20, marginRight: 15 },
  menuText: { flex: 1, fontSize: 16, color: '#333' },
  menuArrow: { fontSize: 18, color: '#CCC' },

  logoutButton: {
    backgroundColor: '#F88742',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutIcon: { fontSize: 20, marginRight: 10 },
  logoutText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
});
