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
  Image,
} from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { updateUserAndSave, isEmailExists, saveCurrentUser } from '../utils/storage';


const MentorSignUpScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    mentorName: '',
    mentorType: '', // 'individual' or 'institution'
    expertise: '',
    experience: '',
    qualifications: '',
    privacyAgreed: false,
  });

  const [googleUser, setGoogleUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useGoogleSignUp, setUseGoogleSignUp] = useState(false);

  useEffect(() => {
    // Google Sign-In 초기화
    GoogleSignin.configure({
      webClientId: process.env.GOOGLE_CLIENT_ID_WEB,
      iosClientId: process.env.GOOGLE_CLIENT_ID_IOS,
      scopes: ['email', 'profile'],
      offlineAccess: true,
    });
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const userInfo = await GoogleSignin.signIn();
      console.log("✅ 로그인 성공:", userInfo);
      
      // Google 사용자 정보를 폼에 자동 입력
      setFormData(prev => ({
        ...prev,
        email: userInfo.data.user.email,
        mentorName: userInfo.data.user.name,
      }));
      
      setGoogleUser(userInfo.data.user);
      setUseGoogleSignUp(true);
      Alert.alert('성공', 'Google 로그인이 완료되었습니다!');
    } catch (error) {
      console.error("❌ 로그인 실패:", error);
      Alert.alert('오류', 'Google 로그인에 실패했습니다.');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMentorTypeSelect = (type) => {
    setFormData(prev => ({
      ...prev,
      mentorType: type,
    }));
  };

  const handlePrivacyToggle = () => {
    setFormData(prev => ({
      ...prev,
      privacyAgreed: !prev.privacyAgreed,
    }));
  };

  const validateForm = () => {
    if (useGoogleSignUp) {
      // Google 회원가입인 경우
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
      if (!formData.privacyAgreed) {
        Alert.alert('오류', '개인정보보호 동의에 체크해주세요.');
        return false;
      }
      if (!googleUser) {
        Alert.alert('오류', 'Google 로그인을 먼저 진행해주세요.');
        return false;
      }
    } else {
      // 기본 회원가입인 경우
      if (!formData.email.trim()) {
        Alert.alert('오류', '이메일을 입력해주세요.');
        return false;
      }
      if (!formData.password.trim()) {
        Alert.alert('오류', '비밀번호를 입력해주세요.');
        return false;
      }
      if (formData.password.length < 6) {
        Alert.alert('오류', '비밀번호는 6자 이상이어야 합니다.');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
        return false;
      }
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
      if (!formData.privacyAgreed) {
        Alert.alert('오류', '개인정보보호 동의에 체크해주세요.');
        return false;
      }
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (useGoogleSignUp) {
        // Google 회원가입
        const userData = {
          id: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
          userType: 'mentor',
          googleUser,
          ...formData,
          createdAt: new Date().toISOString(),
        };
        
        const success = await updateUserAndSave(userData);
        if (success) {
          // 현재 사용자로 저장
          await saveCurrentUser(userData);
          Alert.alert('성공', '멘토 회원가입이 완료되었습니다!', [
            {
              text: '확인',
              onPress: () => navigation.navigate('MentorMain'),
            },
          ]);
        } else {
          Alert.alert('오류', '회원가입 중 오류가 발생했습니다.');
        }
      } else {
        // 기본 회원가입
        const emailExists = await isEmailExists(formData.email.trim());
        if (emailExists) {
          Alert.alert('오류', '이미 가입된 이메일입니다.');
          return;
        }

        const userData = {
          id: Date.now().toString(),
          email: formData.email.trim(),
          password: formData.password,
          name: formData.mentorName,
          userType: 'mentor',
          ...formData,
          createdAt: new Date().toISOString(),
        };

        const success = await updateUserAndSave(userData);
        if (success) {
          // 현재 사용자로 저장
          await saveCurrentUser(userData);
          Alert.alert('성공', '멘토 회원가입이 완료되었습니다!', [
            {
              text: '확인',
              onPress: () => navigation.navigate('MentorMain'),
            },
          ]);
        } else {
          Alert.alert('오류', '회원가입 중 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      Alert.alert('오류', '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6956E5" />
      
      {/* Header */}
      <View style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>멘토 회원가입</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Sign Up Method Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. 회원가입 방법 선택</Text>
            <View style={styles.methodContainer}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  !useGoogleSignUp && styles.methodButtonActive,
                ]}
                onPress={() => setUseGoogleSignUp(false)}
              >
                <Text style={[
                  styles.methodButtonText,
                  !useGoogleSignUp && styles.methodButtonTextActive,
                ]}>
                  이메일로 가입
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  useGoogleSignUp && styles.methodButtonActive,
                ]}
                onPress={() => setUseGoogleSignUp(true)}
              >
                <Text style={[
                  styles.methodButtonText,
                  useGoogleSignUp && styles.methodButtonTextActive,
                ]}>
                  Google로 가입
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Google Sign In Section */}
          {useGoogleSignUp && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Google 계정으로 로그인</Text>
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleLogin}
                disabled={!!googleUser}
              >
                <Image 
                  source={require('../assets/images/google.png')}
                  style={styles.googleIcon}
                  resizeMode="contain"
                />
                <Text style={styles.googleButtonText}>
                  {googleUser ? '✓ Google 로그인 완료' : 'Google로 로그인'}
                </Text>
              </TouchableOpacity>
              {googleUser && (
                <Text style={styles.googleUserInfo}>
                  {googleUser.email}
                </Text>
              )}
            </View>
          )}

          {/* Email/Password Section */}
          {!useGoogleSignUp && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. 계정 정보 입력</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>이메일 *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  placeholder="이메일을 입력해주세요"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>비밀번호 *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  placeholder="비밀번호를 입력해주세요 (6자 이상)"
                  placeholderTextColor="#999"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>비밀번호 확인 *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleInputChange('confirmPassword', text)}
                  placeholder="비밀번호를 다시 입력해주세요"
                  placeholderTextColor="#999"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>
          )}

          {/* Basic Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {useGoogleSignUp ? '3. 기본 정보 입력' : '3. 기본 정보 입력'}
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>멘토 이름 *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.mentorName}
                onChangeText={(text) => handleInputChange('mentorName', text)}
                placeholder="멘토 이름을 입력해주세요"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Mentor Type Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. 멘토 유형 선택 *</Text>
            <View style={styles.mentorTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.mentorTypeButton,
                  formData.mentorType === 'individual' && styles.mentorTypeButtonActive,
                ]}
                onPress={() => handleMentorTypeSelect('individual')}
              >
                <Text style={[
                  styles.mentorTypeButtonText,
                  formData.mentorType === 'individual' && styles.mentorTypeButtonTextActive,
                ]}>
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
                <Text style={[
                  styles.mentorTypeButtonText,
                  formData.mentorType === 'institution' && styles.mentorTypeButtonTextActive,
                ]}>
                  교육기관
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Expertise Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. 전문 분야 *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.expertise}
              onChangeText={(text) => handleInputChange('expertise', text)}
              placeholder="가르치실 전문 분야를 입력해주세요 (예: IT 프로그래밍, 농업 기술, 요리 등)"
              placeholderTextColor="#999"
            />
          </View>

          {/* Experience Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. 경력 및 자격 *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.experience}
              onChangeText={(text) => handleInputChange('experience', text)}
              placeholder="관련 경력, 자격증, 수상 경력 등을 자세히 입력해주세요"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Qualifications Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. 추가 자격증/이력서</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.qualifications}
              onChangeText={(text) => handleInputChange('qualifications', text)}
              placeholder="추가적인 자격증이나 이력서 정보를 입력해주세요 (선택사항)"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Privacy Agreement Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.privacyContainer}
              onPress={handlePrivacyToggle}
            >
              <View style={[
                styles.checkbox,
                formData.privacyAgreed && styles.checkboxChecked,
              ]}>
                {formData.privacyAgreed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.privacyText}>
                개인정보보호 정책에 동의합니다 *
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpButton, isLoading && styles.disabledButton]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            <Text style={styles.signUpButtonText}>
              {isLoading ? '회원가입 중...' : '회원가입 완료'}
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
  backButtonText: {
    fontSize: 24,
    color: '#FFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  placeholder: {
    width: 40,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
  },
  methodContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  methodButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  methodButtonActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  methodButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  methodButtonTextActive: {
    color: '#4CAF50',
  },
  googleButton: {
    backgroundColor: '#F88742',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  googleUserInfo: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  mentorTypeContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  mentorTypeButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  mentorTypeButtonActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  mentorTypeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  mentorTypeButtonTextActive: {
    color: '#4CAF50',
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  privacyText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  signUpButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 30,
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  signUpButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MentorSignUpScreen;
