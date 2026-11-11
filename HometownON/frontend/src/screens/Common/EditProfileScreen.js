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
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { getCurrentUser, updateUserAndSave } from '../../utils/storage';
import { fetchMe, patchMyProfile, mergeServerUser, mergePreferences } from '../../services/profileApi';

// 커리어 계획 (가입 화면의 careerPlan 과 같은 값). 직업 분류(careerType)와는 다른 키다.
const PLAN_CONTINUE = '커리어 지속형';
const PLAN_CHANGE = '커리어 전환형';
// 이전 수정 코드가 'continue'/'change' 로 저장했을 수 있어 같이 해석한다.
const normalizePlan = (v) => {
  if (v === PLAN_CONTINUE || v === 'continue') return PLAN_CONTINUE;
  if (v === PLAN_CHANGE || v === 'change') return PLAN_CHANGE;
  return '';
};

const EditProfileScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    returnName: '',
    hometown: '',
    previousCareer: '',
    careerPlan: '',
    personality: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const cached = await getCurrentUser();
      // 서버의 현재 값이 있으면 그것으로 채운다. 실패하면 기기 캐시를 쓴다.
      const me = await fetchMe();
      const user = me.ok ? mergeServerUser(cached, me.data) : cached;
      if (user) {
        setCurrentUser(user);
        const p = user.profile || {};
        const prefs = p.preferences || {};
        setFormData({
          email: user.email || '',
          returnName: p.display_name || user.returnName || user.name || '',
          hometown: p.home_region || user.hometown || '',
          previousCareer: prefs.previousCareer || user.previousCareer || '',
          careerPlan: normalizePlan(prefs.careerPlan) || normalizePlan(user.careerPlan) || normalizePlan(prefs.careerType) || normalizePlan(user.careerType),
          personality: prefs.personality || user.personality || '',
        });
      }
    } catch (error) {
      console.error('사용자 데이터 로드 오류:', error);
      Alert.alert('오류', '사용자 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCareerPlanSelect = (plan) => {
    setFormData(prev => ({
      ...prev,
      careerPlan: plan,
    }));
  };

  const validateForm = () => {
    if (!formData.returnName.trim()) {
      Alert.alert('오류', '귀향 이름을 입력해주세요.');
      return false;
    }
    if (!formData.hometown.trim()) {
      Alert.alert('오류', '나의 고향을 입력해주세요.');
      return false;
    }
    if (!formData.previousCareer.trim()) {
      Alert.alert('오류', '은퇴 혹은 이전 커리어를 입력해주세요.');
      return false;
    }
    if (!formData.careerPlan) {
      Alert.alert('오류', '커리어 계획을 선택해주세요.');
      return false;
    }
    if (formData.returnName.trim().length > 80) {
      Alert.alert('오류', '귀향 이름은 80자 이하로 입력해주세요.');
      return false;
    }
    if (formData.hometown.trim().length > 120) {
      Alert.alert('오류', '고향은 120자 이하로 입력해주세요.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // preferences 는 서버에서 통째로 교체되므로 현재 값을 읽어 바꿀 키만 덮어쓴다.
      // 읽기에 실패하면 서버 값을 덮어쓸 수 있으니 저장하지 않는다.
      const me = await fetchMe();
      if (!me.ok) {
        Alert.alert('오류', me.error);
        return;
      }
      const currentPrefs = (me.data.profile && me.data.profile.preferences) || {};
      const region = formData.hometown.trim();
      const name = formData.returnName.trim();
      const previousCareer = formData.previousCareer.trim();
      const personality = formData.personality.trim();
      const res = await patchMyProfile({
        display_name: name,
        home_region: region,
        target_region: region,
        preferences: mergePreferences(currentPrefs, {
          previousCareer,
          careerPlan: formData.careerPlan,
          personality,
        }),
      });
      if (!res.ok) {
        Alert.alert('오류', res.error);
        return;
      }

      // 캐시에는 trim 한 값(서버 응답 값 우선)을 저장한다.
      const saved = res.data.profile || {};
      const updatedUser = {
        ...mergeServerUser(currentUser, res.data),
        email: formData.email,
        returnName: saved.display_name || name,
        hometown: saved.home_region || region,
        previousCareer,
        careerPlan: formData.careerPlan,
        careerType: (saved.preferences && saved.preferences.careerType) || currentUser?.careerType,
        personality,
        name: saved.display_name || name,
        updatedAt: new Date().toISOString(),
      };

      const success = await updateUserAndSave(updatedUser);
      if (success) {
        Alert.alert('성공', '회원정보가 수정되었습니다!', [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('오류', '회원정보 수정 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('회원정보 수정 오류:', error);
      Alert.alert('오류', '회원정보 수정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
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
          <Text style={styles.headerTitle}>회원정보 수정</Text>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Account Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. 계정 정보</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>이메일</Text>
              <TextInput
                style={[styles.textInput, styles.disabledInput]}
                value={formData.email}
                editable={false}
                placeholder="이메일은 수정할 수 없습니다"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Basic Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. 기본 정보</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>귀향 이름 *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.returnName}
                maxLength={80}
                onChangeText={(text) => handleInputChange('returnName', text)}
                placeholder="귀향하신 이름을 입력해주세요"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>나의 고향 *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.hometown}
                maxLength={120}
                onChangeText={(text) => handleInputChange('hometown', text)}
                placeholder="고향 지역을 입력해주세요 (예: 경기도 수원시)"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>은퇴 혹은 이전 커리어 *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.previousCareer}
                onChangeText={(text) => handleInputChange('previousCareer', text)}
                placeholder="이전에 하신 일이나 은퇴 전 직업을 입력해주세요"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Career Type Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. 커리어 계획 선택 *</Text>
            <View style={styles.careerTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.careerTypeButton,
                  formData.careerPlan === PLAN_CONTINUE && styles.careerTypeButtonActive,
                ]}
                onPress={() => handleCareerPlanSelect(PLAN_CONTINUE)}
              >
                <Text style={[
                  styles.careerTypeButtonText,
                  formData.careerPlan === PLAN_CONTINUE && styles.careerTypeButtonTextActive,
                ]}>
                  커리어 지속형
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.careerTypeButton,
                  formData.careerPlan === PLAN_CHANGE && styles.careerTypeButtonActive,
                ]}
                onPress={() => handleCareerPlanSelect(PLAN_CHANGE)}
              >
                <Text style={[
                  styles.careerTypeButtonText,
                  formData.careerPlan === PLAN_CHANGE && styles.careerTypeButtonTextActive,
                ]}>
                  커리어 전환형
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Personality Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. 나의 성향 및 기대</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.personality}
              onChangeText={(text) => handleInputChange('personality', text)}
              placeholder="본인의 성향, 관심사, 고향에서의 기대 등을 자유롭게 작성해주세요"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? '저장 중...' : '저장하기'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
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
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  disabledInput: {
    backgroundColor: '#F0F0F0',
    color: '#666',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  careerTypeContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  careerTypeButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  careerTypeButtonActive: {
    borderColor: '#6956E5',
    backgroundColor: '#F0F0FF',
  },
  careerTypeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  careerTypeButtonTextActive: {
    color: '#6956E5',
  },
  saveButton: {
    backgroundColor: '#6956E5',
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 30,
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
});

export default EditProfileScreen;
