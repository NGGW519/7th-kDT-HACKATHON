import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { getCurrentUser, updateUserAndSave } from '../../utils/storage';
import { fetchMe, patchMyProfile, mergeServerUser } from '../../services/profileApi';

const PrivacySettingsScreen = ({ navigation }) => {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    locationSharing: false,
    pushNotifications: true,
    emailNotifications: true,
    dataCollection: true,
    thirdPartySharing: false,
    analytics: true,
    marketing: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const cached = await getCurrentUser();
      // 서버의 profile.preferences.privacy 를 읽는다. 실패하면 기기 캐시를 쓴다.
      const me = await fetchMe();
      const user = me.ok ? mergeServerUser(cached, me.data) : cached;
      if (user) {
        setCurrentUser(user);
        const saved = (user.profile && user.profile.preferences && user.profile.preferences.privacy) || user.privacySettings;
        if (saved && typeof saved === 'object') {
          setPrivacySettings(prev => ({ ...prev, ...saved }));
        }
      }
    } catch (error) {
      console.error('사용자 데이터 로드 오류:', error);
      Alert.alert('오류', '사용자 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleToggle = (key) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // preferences 는 통째로 교체되므로 서버의 현재 값을 읽어 privacy 만 바꿔 보낸다.
      const me = await fetchMe();
      if (!me.ok) {
        Alert.alert('오류', me.error);
        return;
      }
      const currentPrefs = (me.data.profile && me.data.profile.preferences) || {};
      const res = await patchMyProfile(
        { preferences: { ...currentPrefs, privacy: privacySettings } },
        '설정 저장 중 오류가 발생했습니다.'
      );
      if (!res.ok) {
        Alert.alert('오류', res.error);
        return;
      }

      const updatedUser = {
        ...mergeServerUser(currentUser, res.data),
        privacySettings,
      };

      const success = await updateUserAndSave(updatedUser);
      if (success) {
        Alert.alert('성공', '개인정보 설정이 저장되었습니다!', [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('오류', '설정 저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('설정 저장 오류:', error);
      Alert.alert('오류', '설정 저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToDefault = () => {
    Alert.alert(
      '기본값으로 초기화',
      '모든 개인정보 설정을 기본값으로 초기화하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '초기화',
          style: 'destructive',
          onPress: () => {
            setPrivacySettings({
              profileVisibility: true,
              locationSharing: false,
              pushNotifications: true,
              emailNotifications: true,
              dataCollection: true,
              thirdPartySharing: false,
              analytics: true,
              marketing: false,
            });
          },
        },
      ]
    );
  };

  const privacyItems = [
    {
      key: 'profileVisibility',
      title: '프로필 공개',
      description: '다른 사용자가 내 프로필을 볼 수 있습니다',
      icon: '👤',
    },
    {
      key: 'locationSharing',
      title: '위치 정보 공유',
      description: '근처의 멘토나 지역주민을 찾기 위해 위치 정보를 공유합니다',
      icon: '📍',
    },
    {
      key: 'pushNotifications',
      title: '푸시 알림',
      description: '새로운 미션, 메시지, 업데이트에 대한 알림을 받습니다',
      icon: '🔔',
    },
    {
      key: 'emailNotifications',
      title: '이메일 알림',
      description: '중요한 업데이트나 이벤트에 대한 이메일을 받습니다',
      icon: '📧',
    },
    {
      key: 'dataCollection',
      title: '데이터 수집',
      description: '서비스 개선을 위한 사용 데이터 수집에 동의합니다',
      icon: '📊',
    },
    {
      key: 'thirdPartySharing',
      title: '제3자 정보 공유',
      description: '신뢰할 수 있는 파트너사와 정보를 공유합니다',
      icon: '🤝',
    },
    {
      key: 'analytics',
      title: '분석 도구',
      description: '앱 사용 패턴 분석을 위한 쿠키 사용에 동의합니다',
      icon: '📈',
    },
    {
      key: 'marketing',
      title: '마케팅 정보',
      description: '새로운 서비스나 이벤트에 대한 마케팅 정보를 받습니다',
      icon: '📢',
    },
  ];

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
          <Text style={styles.headerTitle}>개인정보 설정</Text>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>🛡️ 개인정보 보호</Text>
          <Text style={styles.infoText}>
            고향으로 ON은 사용자의 개인정보를 안전하게 보호합니다. 
            아래 설정을 통해 개인정보 수집 및 이용에 대한 동의를 관리할 수 있습니다.
          </Text>
        </View>

        {/* Privacy Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>개인정보 수집 및 이용 동의</Text>
          
          {privacyItems.map((item) => (
            <View key={item.key} style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>{item.icon}</Text>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingDescription}>{item.description}</Text>
                </View>
              </View>
              <Switch
                value={privacySettings[item.key]}
                onValueChange={() => handleToggle(item.key)}
                trackColor={{ false: '#E0E0E0', true: '#6956E5' }}
                thumbColor={privacySettings[item.key] ? '#FFF' : '#FFF'}
              />
            </View>
          ))}
        </View>

        {/* Data Rights Section */}
        <View style={styles.rightsSection}>
          <Text style={styles.sectionTitle}>개인정보 권리</Text>
          
          <View style={styles.rightsItem}>
            <Text style={styles.rightsIcon}>📋</Text>
            <View style={styles.rightsText}>
              <Text style={styles.rightsTitle}>개인정보 열람</Text>
              <Text style={styles.rightsDescription}>
                수집된 개인정보의 내용을 확인할 수 있습니다
              </Text>
            </View>
          </View>

          <View style={styles.rightsItem}>
            <Text style={styles.rightsIcon}>✏️</Text>
            <View style={styles.rightsText}>
              <Text style={styles.rightsTitle}>개인정보 수정</Text>
              <Text style={styles.rightsDescription}>
                잘못된 개인정보를 정정하거나 수정할 수 있습니다
              </Text>
            </View>
          </View>

          <View style={styles.rightsItem}>
            <Text style={styles.rightsIcon}>🗑️</Text>
            <View style={styles.rightsText}>
              <Text style={styles.rightsTitle}>개인정보 삭제</Text>
              <Text style={styles.rightsDescription}>
                개인정보의 삭제를 요청할 수 있습니다
              </Text>
            </View>
          </View>

          <View style={styles.rightsItem}>
            <Text style={styles.rightsIcon}>⏸️</Text>
            <View style={styles.rightsText}>
              <Text style={styles.rightsTitle}>처리정지</Text>
              <Text style={styles.rightsDescription}>
                개인정보의 처리정지를 요청할 수 있습니다
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetToDefault}
          >
            <Text style={styles.resetButtonText}>기본값으로 초기화</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? '저장 중...' : '설정 저장'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>📞 개인정보 관련 문의</Text>
          <Text style={styles.contactText}>
            개인정보 처리에 관한 문의사항이 있으시면 언제든 연락주세요.
          </Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactItem}>📧 이메일: privacy@hometownon.com</Text>
            <Text style={styles.contactItem}>📱 전화: 1588-1234</Text>
            <Text style={styles.contactItem}>🕒 운영시간: 평일 09:00-18:00</Text>
          </View>
        </View>
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
    paddingVertical: 15,
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
    paddingHorizontal: 20,
  },
  infoSection: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6956E5',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  settingsSection: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6956E5',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  rightsSection: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
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
  rightsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rightsIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  rightsText: {
    flex: 1,
  },
  rightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  rightsDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  actionSection: {
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#6956E5',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  resetButtonText: {
    color: '#6956E5',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#6956E5',
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactSection: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
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
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  contactInfo: {
    gap: 8,
  },
  contactItem: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default PrivacySettingsScreen;
