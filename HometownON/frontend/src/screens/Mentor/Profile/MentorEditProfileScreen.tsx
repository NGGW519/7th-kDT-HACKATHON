import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { getCurrentUser, saveUser } from '../../../utils/storage';

const MentorEditProfileScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    mentorName: '',
    mentorType: '', // 'individual' | 'institution'
    expertise: '',
    experience: '',
    qualifications: '',
    privacyAgreed: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setFormData({
          email: user.email || '',
          mentorName: user.mentorName || user.name || '',
          mentorType: user.mentorType || '',
          expertise: user.expertise || '',
          experience: user.experience || '',
          qualifications: user.qualifications || '',
          privacyAgreed: !!user.privacyAgreed,
        });
      }
    } catch (error) {
      console.error('사용자 데이터 로드 오류:', error);
      Alert.alert('오류', '사용자 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMentorTypeSelect = (type) => {
    setFormData(prev => ({ ...prev, mentorType: type }));
  };

  const handlePrivacyToggle = () => {
    setFormData(prev => ({ ...prev, privacyAgreed: !prev.privacyAgreed }));
  };

  const validateForm = () => {
    if (!formData.mentorName.trim()) {
      Alert.alert('오류', '멘토 이름을 입력해주세요.');
      return false;
    }
    if (!formData.mentorType) {
      Alert.alert('오류', '멘토 유형을 선택해주세요.');
      return false;
    }
    if (!formData.expertise.trim()) {
      Alert.alert('오류', '전문 분야를 입력해주세요.');
      return false;
    }
    if (!formData.experience.trim()) {
      Alert.alert('오류', '경력을 입력해주세요.');
      return false;
    }
    // 회원가입과 동일하게 강제하려면 주석 해제
    // if (!formData.privacyAgreed) {
    //   Alert.alert('오류', '개인정보보호 동의에 체크해주세요.');
    //   return false;
    // }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const updatedUser = {
        ...currentUser,
        // 표준 키
        email: formData.email,
        userType: 'mentor',
        mentorName: formData.mentorName,
        mentorType: formData.mentorType,
        expertise: formData.expertise,
        experience: formData.experience,
        qualifications: formData.qualifications,
        privacyAgreed: formData.privacyAgreed,
        // 호환 키
        name: formData.mentorName,
        updatedAt: new Date().toISOString(),
      };

      const success = await saveUser(updatedUser);
      if (success) {
        Alert.alert('성공', '회원정보가 수정되었습니다!', [
          { text: '확인', onPress: () => navigation.goBack() },
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
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>멘토 정보 수정</Text>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* 1. 계정 정보 */}
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

          {/* 2. 기본 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. 기본 정보</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>멘토 이름 *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.mentorName}
                onChangeText={(t) => handleInputChange('mentorName', t)}
                placeholder="멘토 이름을 입력해주세요"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* 3. 멘토 유형 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. 멘토 유형 선택 *</Text>
            <View style={styles.mentorTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.mentorTypeButton,
                  formData.mentorType === 'individual' && styles.mentorTypeButtonActive,
                ]}
                onPress={() => handleMentorTypeSelect('individual')}
              >
                <Text
                  style={[
                    styles.mentorTypeButtonText,
                    formData.mentorType === 'individual' && styles.mentorTypeButtonTextActive,
                  ]}
                >
                  개인 멘토
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.mentorTypeButton,
                  formData.mentorType === 'institution' && styles.mentorTypeButtonActive,
                ]}
                onPress={() => handleMentorTypeSelect('institution')}
              >
                <Text
                  style={[
                    styles.mentorTypeButtonText,
                    formData.mentorType === 'institution' && styles.mentorTypeButtonTextActive,
                  ]}
                >
                  교육기관
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 4. 전문 분야 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. 전문 분야 *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.expertise}
              onChangeText={(t) => handleInputChange('expertise', t)}
              placeholder="예: IT 프로그래밍, 농업 기술, 요리 등"
              placeholderTextColor="#999"
            />
          </View>

          {/* 5. 경력 및 자격 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. 경력 및 자격 *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.experience}
              onChangeText={(t) => handleInputChange('experience', t)}
              placeholder="관련 경력, 자격증, 수상 경력 등을 입력해주세요"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* 6. 추가 자격증/이력서 (선택) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. 추가 자격증/이력서 (선택)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.qualifications}
              onChangeText={(t) => handleInputChange('qualifications', t)}
              placeholder="추가적인 자격증이나 이력서 정보를 입력해주세요"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* 7. 개인정보 동의 (선택/표시) */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.privacyContainer} onPress={handlePrivacyToggle}>
              <View
                style={[
                  styles.checkbox,
                  formData.privacyAgreed && styles.checkboxChecked,
                ]}
              >
                {formData.privacyAgreed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.privacyText}>개인정보보호 정책에 동의합니다</Text>
            </TouchableOpacity>
          </View>

          {/* 저장 */}
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>{isLoading ? '저장 중...' : '저장하기'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#6956E5' },
  headerSafeArea: { backgroundColor: '#6956E5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 30, backgroundColor: '#6956E5',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 24, color: '#FFF', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', flex: 1, textAlign: 'center' },
  headerRight: { width: 40 },
  keyboardContainer: { flex: 1 },
  scrollContainer: { flex: 1, backgroundColor: '#F8F9FA', paddingHorizontal: 20 },
  section: {
    marginVertical: 20, backgroundColor: '#FFF', borderRadius: 15, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
    shadowRadius: 4, elevation: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50', marginBottom: 15 },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  textInput: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10,
    paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, backgroundColor: '#FAFAFA',
  },
  disabledInput: { backgroundColor: '#F0F0F0', color: '#666' },
  textArea: { height: 100, textAlignVertical: 'top' },
  mentorTypeContainer: { flexDirection: 'row', gap: 15 },
  mentorTypeButton: {
    flex: 1, borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 10,
    paddingVertical: 15, alignItems: 'center', backgroundColor: '#FAFAFA',
  },
  mentorTypeButtonActive: { borderColor: '#4CAF50', backgroundColor: '#E8F5E8' },
  mentorTypeButtonText: { fontSize: 16, fontWeight: '600', color: '#666' },
  mentorTypeButtonTextActive: { color: '#4CAF50' },
  privacyContainer: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 24, height: 24, borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 4,
    marginRight: 10, justifyContent: 'center', alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  checkmark: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  privacyText: { fontSize: 16, color: '#333', flex: 1 },
  saveButton: {
    backgroundColor: '#4CAF50', paddingVertical: 18, borderRadius: 10, alignItems: 'center',
    marginVertical: 30,
  },
  disabledButton: { backgroundColor: '#CCC' },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default MentorEditProfileScreen;
