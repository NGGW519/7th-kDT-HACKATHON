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
import { saveUser, isEmailExists, saveCurrentUser } from '../utils/storage';
import { GOOGLE_CLIENT_ID_WEB, GOOGLE_CLIENT_ID_IOS } from '@env';

const ResidentSignUpScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    residentName: '',
    location: '',
    interests: [],
    privacyAgreed: false,
  });

  const [googleUser, setGoogleUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useGoogleSignUp, setUseGoogleSignUp] = useState(false);

  // Interest options
  const interestOptions = [
    '수리/정비',
    '농업/원예',
    '교육/강의',
    '의료/건강',
    '요리/음식',
    '운송/배송',
    '기술/IT',
    '예술/문화',
    '기타',
  ];

  useEffect(() => {
    // Google Sign-In 초기화
    GoogleSignin.configure({
      webClientId: GOOGLE_CLIENT_ID_WEB,
      iosClientId: GOOGLE_CLIENT_ID_IOS,
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
        residentName: userInfo.data.user.name,
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

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(item => item !== interest)
        : [...prev.interests, interest],
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
      if (!formData.residentName.trim()) {
        Alert.alert('오류', '지역주민 이름을 입력해주세요.');
        return false;
      }
      if (!formData.location.trim()) {
        Alert.alert('오류', '거주 지역을 입력해주세요.');
        return false;
      }
      if (formData.interests.length === 0) {
        Alert.alert('오류', '관심 있는 의뢰 유형을 선택해주세요.');
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
      if (!formData.residentName.trim()) {
        Alert.alert('오류', '지역주민 이름을 입력해주세요.');
        return false;
      }
      if (!formData.location.trim()) {
        Alert.alert('오류', '거주 지역을 입력해주세요.');
        return false;
      }
      if (formData.interests.length === 0) {
        Alert.alert('오류', '관심 있는 의뢰 유형을 선택해주세요.');
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
          userType: 'resident',
          googleUser,
          ...formData,
          createdAt: new Date().toISOString(),
        };
        
        const success = await saveUser(userData);
        if (success) {
          // 현재 사용자로 저장
          await saveCurrentUser(userData);
          Alert.alert('성공', '지역주민 회원가입이 완료되었습니다!', [
            {
              text: '확인',
              onPress: () => navigation.navigate('ResidentMain'),
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
          name: formData.residentName,
          userType: 'resident',
          ...formData,
          createdAt: new Date().toISOString(),
        };

        const success = await saveUser(userData);
        if (success) {
          // 현재 사용자로 저장
          await saveCurrentUser(userData);
          Alert.alert('성공', '지역주민 회원가입이 완료되었습니다!', [
            {
              text: '확인',
              onPress: () => navigation.navigate('ResidentMain'),
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
          <Text style={styles.headerTitle}>지역주민 회원가입</Text>
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
              <Text style={styles.inputLabel}>지역주민 이름 *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.residentName}
                onChangeText={(text) => handleInputChange('residentName', text)}
                placeholder="지역주민 이름을 입력해주세요"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>거주 지역 *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.location}
                onChangeText={(text) => handleInputChange('location', text)}
                placeholder="현재 거주하고 계신 지역을 입력해주세요 (예: 경기도 수원시 팔달구)"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Interest Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. 관심 있는 의뢰 유형 *</Text>
            <Text style={styles.sectionDescription}>
              귀향자에게 의뢰하고 싶은 일의 유형을 선택해주세요 (중복 선택 가능)
            </Text>
            
            <View style={styles.interestGrid}>
              {interestOptions.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.interestButton,
                    formData.interests.includes(interest) && styles.interestButtonActive,
                  ]}
                  onPress={() => handleInterestToggle(interest)}
                >
                  <Text style={[
                    styles.interestButtonText,
                    formData.interests.includes(interest) && styles.interestButtonTextActive,
                  ]}>
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
    color: '#9C27B0',
    marginBottom: 15,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
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
    borderColor: '#9C27B0',
    backgroundColor: '#F3E5F5',
  },
  methodButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  methodButtonTextActive: {
    color: '#9C27B0',
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
  interestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestButton: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FAFAFA',
    minWidth: '45%',
  },
  interestButtonActive: {
    borderColor: '#9C27B0',
    backgroundColor: '#F3E5F5',
  },
  interestButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  interestButtonTextActive: {
    color: '#9C27B0',
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
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
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
    backgroundColor: '#9C27B0',
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

export default ResidentSignUpScreen;
