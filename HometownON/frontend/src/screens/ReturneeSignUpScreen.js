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
import AuthService from '../services/AuthService';


const ReturneeSignUpScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    returnName: '',
    hometown: '',
    hometownSchool: '',
    previousCareer: '',
    careerType: '',
    careerPlan: '',
    personality: '',
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
      console.log("✅ Google 로그인 성공:", userInfo);

      // Google Sign-in 응답 구조 확인 (data.user에 사용자 정보가 있음)
      if (!userInfo || !userInfo.data || !userInfo.data.user) {
        console.error("❌ Google 사용자 정보가 없습니다:", userInfo);
        Alert.alert('오류', 'Google 사용자 정보를 가져올 수 없습니다.');
        return;
      }

      const { user } = userInfo.data;
      console.log("🔍 Google 사용자 정보:", user);

      // 이메일과 이름만 가져오고, 나머지는 사용자가 입력하도록
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        // returnName은 사용자가 직접 입력하도록 비워둠
      }));

      setGoogleUser(user);
      setUseGoogleSignUp(true);
      Alert.alert('성공', 'Google 계정이 연결되었습니다!\n이제 나머지 정보를 입력해주세요.');
    } catch (error) {
      console.error("❌ Google 로그인 실패:", error);
      if (error.code === 'SIGN_IN_CANCELLED') {
        console.log("사용자가 Google 로그인을 취소했습니다.");
      } else {
        Alert.alert('오류', 'Google 로그인에 실패했습니다.');
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCareerTypeSelect = (type) => {
    setFormData(prev => ({
      ...prev,
      careerType: type,
    }));
  };

  const handleCareerPlanSelect = (plan) => {
    setFormData(prev => ({
      ...prev,
      careerPlan: plan,
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
      if (!formData.returnName.trim()) return Alert.alert('오류', '이름을 입력해주세요.'), false;
      if (!formData.hometown.trim()) return Alert.alert('오류', '나의 고향을 입력해주세요.'), false;
      if (!formData.previousCareer.trim()) return Alert.alert('오류', '은퇴 혹은 이전 커리어를 입력해주세요.'), false;
      if (!formData.careerType) return Alert.alert('오류', '커리어 유형을 선택해주세요.'), false;
      if (!formData.careerPlan) return Alert.alert('오류', '커리어 계획을 선택해주세요.'), false;
      if (!formData.privacyAgreed) return Alert.alert('오류', '개인정보보호 동의에 체크해주세요.'), false;
      if (!googleUser) return Alert.alert('오류', 'Google 로그인을 먼저 진행해주세요.'), false;
    } else {
      if (!formData.email.trim()) return Alert.alert('오류', '이메일을 입력해주세요.'), false;
      if (!formData.password.trim()) return Alert.alert('오류', '비밀번호를 입력해주세요.'), false;
      if (formData.password.length < 6) return Alert.alert('오류', '비밀번호는 6자 이상이어야 합니다.'), false;
      if (formData.password !== formData.confirmPassword) return Alert.alert('오류', '비밀번호가 일치하지 않습니다.'), false;
      if (!formData.returnName.trim()) return Alert.alert('오류', '이름을 입력해주세요.'), false;
      if (!formData.hometown.trim()) return Alert.alert('오류', '나의 고향을 입력해주세요.'), false;
      if (!formData.previousCareer.trim()) return Alert.alert('오류', '은퇴 혹은 이전 커리어를 입력해주세요.'), false;
      if (!formData.careerType) return Alert.alert('오류', '커리어 유형을 선택해주세요.'), false;
      if (!formData.careerPlan) return Alert.alert('오류', '커리어 계획을 선택해주세요.'), false;
      if (!formData.privacyAgreed) return Alert.alert('오류', '개인정보보호 동의에 체크해주세요.'), false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // API 호출용 사용자 데이터 준비
      const userData = {
        email: formData.email.trim(),
        password: formData.password,
        phone: null, // 전화번호 필드가 없으므로 null
        name: formData.returnName,
        userType: 'returnee',
        hometown: formData.hometown,
        targetRegion: formData.hometown, // 고향으로 돌아가는 것이므로 같게 설정
        careerType: formData.careerType,
        careerPlan: formData.careerPlan,
        previousCareer: formData.previousCareer,
        personality: formData.personality,
        hometownSchool: formData.hometownSchool,
        picture: googleUser?.photo || null,
      };

      // 실제 API 호출
      const result = await AuthService.signUp(userData);
      
      if (result.success) {
        // 로컬 스토리지에도 저장 (기존 로직 유지)
        const localUserData = {
          id: result.data.id,
          email: result.data.email,
          name: formData.returnName,
          userType: 'returnee',
          ...formData,
          createdAt: new Date().toISOString(),
        };
        
        await updateUserAndSave(localUserData);
        await saveCurrentUser(localUserData);
        
        Alert.alert('성공', '귀향자 회원가입이 완료되었습니다!', [
          { text: '확인', onPress: () => navigation.navigate('ReturneeMain') },
        ]);
      } else {
        Alert.alert('오류', result.error || '회원가입 중 오류가 발생했습니다.');
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
      <View style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>귀향자 회원가입</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Google 로그인 섹션 */}
            <View style={styles.googleSection}>
              {!useGoogleSignUp ? (
                              <TouchableOpacity 
                style={styles.googleButton}
                onPress={handleGoogleLogin}
              >
                <Image 
                  source={require('../assets/images/google.png')}
                  style={styles.googleIcon}
                  resizeMode="contain"
                />
                <Text style={styles.googleButtonText}>Google로 회원가입</Text>
              </TouchableOpacity>
              ) : (
                <View style={styles.googleUserInfo}>
                  <Text style={styles.googleUserText}>✅ Google 계정 연결됨</Text>
                  <Text style={styles.googleUserEmail}>{formData.email}</Text>
                  <TouchableOpacity 
                    style={styles.changeGoogleButton}
                    onPress={() => {
                      setUseGoogleSignUp(false);
                      setGoogleUser(null);
                      setFormData(prev => ({ ...prev, email: '' }));
                    }}
                  >
                    <Text style={styles.changeGoogleButtonText}>다른 계정으로 변경</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>또는</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* 이메일 입력 필드 (Google 로그인 시에는 읽기 전용) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>이메일</Text>
              <TextInput
                style={[styles.input, useGoogleSignUp && styles.inputDisabled]}
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                placeholder="이메일을 입력하세요"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!useGoogleSignUp}
              />
            </View>

            {/* 비밀번호 입력 필드 (Google 로그인 시에는 숨김) */}
            {!useGoogleSignUp && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>비밀번호</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.password}
                    onChangeText={(text) => handleInputChange('password', text)}
                    placeholder="비밀번호를 입력하세요"
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>비밀번호 확인</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.confirmPassword}
                    onChangeText={(text) => handleInputChange('confirmPassword', text)}
                    placeholder="비밀번호를 다시 입력하세요"
                    secureTextEntry
                  />
                </View>
              </>
            )}

            {/* 공통 입력 필드 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>이름</Text>
              <TextInput
                style={styles.input}
                value={formData.returnName}
                onChangeText={(text) => handleInputChange('returnName', text)}
                placeholder="이름을 입력하세요"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>나의 고향</Text>
              <TextInput
                style={styles.input}
                value={formData.hometown}
                onChangeText={(text) => handleInputChange('hometown', text)}
                placeholder="귀향할 지역인 본인의 고향을 입력하세요(ex.함안군 가야읍)"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>고향에서 나온 학교</Text>
              <TextInput
                style={styles.input}
                value={formData.hometownSchool}
                onChangeText={(text) => handleInputChange('hometownSchool', text)}
                placeholder="고향에서 다녔던 학교를 입력하세요(ex.함안고등학교)"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>은퇴 혹은 이전 커리어</Text>
              <TextInput
                style={styles.input}
                value={formData.previousCareer}
                onChangeText={(text) => handleInputChange('previousCareer', text)}
                placeholder="이전에 하던 일을 입력하세요(ex. 주식회사 대표)"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>커리어 유형</Text>
              <View style={styles.careerTypeContainer}>
                {['전문직', '사무직', '서비스업', '자영업', '기타'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.careerTypeButton,
                      formData.careerType === type && styles.careerTypeButtonActive
                    ]}
                    onPress={() => handleCareerTypeSelect(type)}
                  >
                    <Text style={[
                      styles.careerTypeButtonText,
                      formData.careerType === type && styles.careerTypeButtonTextActive
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>귀향 후 커리어 계획</Text>
              <View style={styles.careerTypeContainer}>
                {['커리어 전환형', '커리어 지속형'].map((plan) => (
                  <TouchableOpacity
                    key={plan}
                    style={[
                      styles.careerTypeButton,
                      formData.careerPlan === plan && styles.careerTypeButtonActive
                    ]}
                    onPress={() => handleCareerPlanSelect(plan)}
                  >
                    <Text style={[
                      styles.careerTypeButtonText,
                      formData.careerPlan === plan && styles.careerTypeButtonTextActive
                    ]}>
                      {plan}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>성격 (선택사항)</Text>
              <TextInput
                style={styles.input}
                value={formData.personality}
                onChangeText={(text) => handleInputChange('personality', text)}
                placeholder="자신의 성격을 간단히 설명해주세요"
                multiline
              />
            </View>

            <View style={styles.privacySection}>
              <TouchableOpacity 
                style={styles.privacyCheckbox}
                onPress={handlePrivacyToggle}
              >
                <Text style={styles.checkboxText}>
                  {formData.privacyAgreed ? '☑️' : '☐'} 
                </Text>
                <Text style={styles.privacyText}>
                  개인정보보호 정책에 동의합니다
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text style={styles.signUpButtonText}>
                {isLoading ? '가입 중...' : '회원가입'}
              </Text>
            </TouchableOpacity>
          </View>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
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
    padding: 5,
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
  headerSpacer: {
    width: 30,
  },
  content: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    flex: 1,
  },
  googleSection: {
    marginBottom: 20,
  },
  googleButton: {
    backgroundColor: '#F88742',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
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
    padding: 10,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    alignItems: 'center',
  },
  googleUserText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
  },
  googleUserEmail: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
  changeGoogleButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
  },
  changeGoogleButtonText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#666',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    color: '#666',
  },
  careerTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  careerTypeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFF',
  },
  careerTypeButtonActive: {
    backgroundColor: '#6956E5',
    borderColor: '#6956E5',
  },
  careerTypeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  careerTypeButtonTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  privacySection: {
    marginBottom: 20,
  },
  privacyCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxText: {
    fontSize: 18,
    marginRight: 10,
  },
  privacyText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  signUpButton: {
    backgroundColor: '#6956E5',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  signUpButtonDisabled: {
    backgroundColor: '#CCC',
  },
  signUpButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReturneeSignUpScreen;
