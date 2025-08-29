import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { authenticateUser, saveCurrentUser } from '../utils/storage';


const SignInScreen = ({ navigation }) => {
  const [googleUser, setGoogleUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Google Sign-In 초기화
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
      scopes: ['email', 'profile'],
      offlineAccess: true,
    });
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true); // 로딩 상태 시작
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log("✅ Google 로그인 성공:", userInfo);

      const idToken = userInfo.idToken; // Google ID Token 추출
      if (!idToken) {
        Alert.alert('오류', 'Google ID 토큰을 가져올 수 없습니다.');
        setIsLoading(false);
        return;
      }

      // 백엔드 API 호출
      const backendApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000'; // .env에서 API URL 가져오기
      const response = await fetch(`${backendApiUrl}/api/users/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_token: idToken }),
      });

      const data = await response.json();

      if (response.ok) {
        await saveCurrentUser({ token: data.access_token }); // 백엔드에서 받은 토큰 저장
        Alert.alert('성공', 'Google 로그인이 완료되었습니다!', [
          {
            text: '확인',
            onPress: () => navigation.navigate('ReturneeMain'), // 메인 화면으로 이동
          },
        ]);
      } else {
        Alert.alert('오류', `백엔드 로그인 실패: ${data.detail || response.statusText}`);
      }
    } catch (error) {
      console.error("❌ Google 로그인 또는 백엔드 통신 실패:", error);
      Alert.alert('오류', 'Google 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false); // 로딩 상태 종료
    }
  };

  const handleEmailSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('오류', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await authenticateUser(email.trim(), password);
      if (user) {
        await saveCurrentUser(user);
        Alert.alert('성공', '로그인이 완료되었습니다!', [
          {
            text: '확인',
            onPress: () => {
              // 사용자 유형에 따라 다른 화면으로 이동
              switch (user.userType) {
                case 'returnee':
                  navigation.navigate('ReturneeMain');
                  break;
                case 'resident':
                  navigation.navigate('ResidentMain');
                  break;
                case 'mentor':
                  navigation.navigate('MentorMain');
                  break;
                default:
                  navigation.navigate('ReturneeMain');
              }
            },
          },
        ]);
      } else {
        Alert.alert('오류', '이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      Alert.alert('오류', '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>로그인</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Main Content */}
      <KeyboardAvoidingView 
        style={styles.mainContent}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.appTitle}>고향으로 ON</Text>
          <Text style={styles.subtitle}>로그인하여 서비스를 이용하세요</Text>
        </View>

        {/* Email/Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="이메일"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="비밀번호"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Email Sign In Button */}
        <TouchableOpacity
          style={[styles.emailButton, isLoading && styles.disabledButton]}
          onPress={handleEmailSignIn}
          disabled={isLoading}
        >
          <Text style={styles.emailButtonText}>
            {isLoading ? '로그인 중...' : '로그인'}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>또는</Text>
          <View style={styles.divider} />
        </View>

        {/* Google Sign In Button */}
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
            {googleUser ? '로그인 중...' : 'Google로 로그인'}
          </Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>계정이 없으신가요? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signUpLink}>회원가입</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#F8F8F8',
  },
  emailButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  emailButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#666',
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#F88742',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 30,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 16,
    color: '#666',
  },
  signUpLink: {
    fontSize: 16,
    color: '#FF9800',
    fontWeight: '600',
  },
});

export default SignInScreen;
