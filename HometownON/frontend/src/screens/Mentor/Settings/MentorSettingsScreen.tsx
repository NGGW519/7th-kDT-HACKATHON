import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const MentorSettingsScreen = ({ navigation }) => {
  const [fontSize, setFontSize] = useState('medium'); // small, medium, large
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  const handleEditProfile = () => {
    navigation.navigate('MentorEditProfileScreen');
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handlePrivacySettings = () => {
    navigation.navigate('PrivacySettings');
  };

  const handleAppInfo = () => {
    Alert.alert(
      '앱 정보',
      '고향으로 ON\n버전: 1.0.0\n개발: 고향으로 ON 팀',
      [{ text: '확인' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '로그아웃', 
          style: 'destructive',
          onPress: () => {
            // 로그아웃 로직
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          }
        },
      ]
    );
  };

  const getFontSizeText = () => {
    switch (fontSize) {
      case 'small': return '작게';
      case 'large': return '크게';
      default: return '보통';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6956E5" />
      
      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>설정</Text>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 계정 설정</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MentorEditProfileScreen')}>
            <Text style={styles.menuIcon}>📝</Text>
            <Text style={styles.menuText}>회원정보 수정 </Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
            <Text style={styles.menuIcon}>🔒</Text>
            <Text style={styles.menuText}>비밀번호 변경</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handlePrivacySettings}>
            <Text style={styles.menuIcon}>🛡️</Text>
            <Text style={styles.menuText}>개인정보 설정</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ 앱 설정</Text>
          <View style={styles.menuItem}>
            <Text style={styles.menuIcon}>📏</Text>
            <Text style={styles.menuText}>글씨 크기</Text>
            <View style={styles.fontSizeSelector}>
              <TouchableOpacity 
                style={[styles.fontSizeButton, fontSize === 'small' && styles.fontSizeButtonActive]}
                onPress={() => setFontSize('small')}
              >
                <Text style={[styles.fontSizeButtonText, fontSize === 'small' && styles.fontSizeButtonTextActive]}>A</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.fontSizeButton, fontSize === 'medium' && styles.fontSizeButtonActive]}
                onPress={() => setFontSize('medium')}
              >
                <Text style={[styles.fontSizeButtonText, fontSize === 'medium' && styles.fontSizeButtonTextActive]}>A</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.fontSizeButton, fontSize === 'large' && styles.fontSizeButtonActive]}
                onPress={() => setFontSize('large')}
              >
                <Text style={[styles.fontSizeButtonText, fontSize === 'large' && styles.fontSizeButtonTextActive]}>A</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuIcon}>🔔</Text>
            <Text style={styles.menuText}>알림 설정</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#E0E0E0', true: '#6956E5' }}
              thumbColor={notifications ? '#FFF' : '#FFF'}
            />
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuIcon}>🌙</Text>
            <Text style={styles.menuText}>다크 모드</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#E0E0E0', true: '#6956E5' }}
              thumbColor={darkMode ? '#FFF' : '#FFF'}
            />
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuIcon}>💾</Text>
            <Text style={styles.menuText}>자동 저장</Text>
            <Switch
              value={autoSave}
              onValueChange={setAutoSave}
              trackColor={{ false: '#E0E0E0', true: '#6956E5' }}
              thumbColor={autoSave ? '#FFF' : '#FFF'}
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 지원</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📧</Text>
            <Text style={styles.menuText}>문의하기</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>⭐</Text>
            <Text style={styles.menuText}>앱 평가하기</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleAppInfo}>
            <Text style={styles.menuIcon}>ℹ️</Text>
            <Text style={styles.menuText}>앱 정보</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6956E5',
  },
  headerSafeArea: {
    backgroundColor: '#6956E5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: '#6956E5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    padding: 20,
    paddingBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  menuArrow: {
    fontSize: 18,
    color: '#CCC',
  },
  fontSizeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  fontSizeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontSizeButtonActive: {
    backgroundColor: '#6956E5',
  },
  fontSizeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  fontSizeButtonTextActive: {
    color: '#FFF',
  },
  logoutButton: {
    backgroundColor: '#F88742',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default MentorSettingsScreen;
