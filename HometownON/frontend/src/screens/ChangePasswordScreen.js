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
import { getCurrentUser, saveUser } from '../utils/storage';

const ChangePasswordScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
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

  const validateForm = () => {
    if (!formData.currentPassword.trim()) {
      Alert.alert('오류', '현재 비밀번호를 입력해주세요.');
      return false;
    }
    if (!formData.newPassword.trim()) {
      Alert.alert('오류', '새 비밀번호를 입력해주세요.');
      return false;
    }
    if (formData.newPassword.length < 6) {
      Alert.alert('오류', '새 비밀번호는 6자 이상이어야 합니다.');
      return false;
    }
    if (formData.newPassword !== formData.confirmNewPassword) {
      Alert.alert('오류', '새 비밀번호가 일치하지 않습니다.');
      return false;
    }
    if (formData.currentPassword === formData.newPassword) {
      Alert.alert('오류', '새 비밀번호는 현재 비밀번호와 달라야 합니다.');
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    // 현재 비밀번호 확인
    if (currentUser.password !== formData.currentPassword) {
      Alert.alert('오류', '현재 비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    try {
      const updatedUser = {
        ...currentUser,
        password: formData.newPassword,
        updatedAt: new Date().toISOString(),
      };

      const success = await saveUser(updatedUser);
      if (success) {
        Alert.alert('성공', '비밀번호가 변경되었습니다!', [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('오류', '비밀번호 변경 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      Alert.alert('오류', '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'current':
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
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
          <Text style={styles.headerTitle}>비밀번호 변경</Text>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>🔒 비밀번호 변경</Text>
            <Text style={styles.infoText}>
              안전한 계정 관리를 위해 정기적으로 비밀번호를 변경하는 것을 권장합니다.
            </Text>
          </View>

          {/* Current Password Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. 현재 비밀번호</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>현재 비밀번호 *</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.currentPassword}
                  onChangeText={(text) => handleInputChange('currentPassword', text)}
                  placeholder="현재 비밀번호를 입력해주세요"
                  placeholderTextColor="#999"
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => togglePasswordVisibility('current')}
                >
                  <Text style={styles.eyeIcon}>
                    {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* New Password Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. 새 비밀번호</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>새 비밀번호 *</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.newPassword}
                  onChangeText={(text) => handleInputChange('newPassword', text)}
                  placeholder="새 비밀번호를 입력해주세요 (6자 이상)"
                  placeholderTextColor="#999"
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => togglePasswordVisibility('new')}
                >
                  <Text style={styles.eyeIcon}>
                    {showNewPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.passwordHint}>
                • 6자 이상 입력해주세요{'\n'}
                • 현재 비밀번호와 다른 비밀번호를 사용해주세요
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>새 비밀번호 확인 *</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.confirmNewPassword}
                  onChangeText={(text) => handleInputChange('confirmNewPassword', text)}
                  placeholder="새 비밀번호를 다시 입력해주세요"
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => togglePasswordVisibility('confirm')}
                >
                  <Text style={styles.eyeIcon}>
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Password Strength Indicator */}
          {formData.newPassword.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>비밀번호 강도</Text>
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <View 
                    style={[
                      styles.strengthFill, 
                      {
                        width: `${Math.min((formData.newPassword.length / 8) * 100, 100)}%`,
                        backgroundColor: formData.newPassword.length >= 6 ? '#4CAF50' : '#FF9800'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.strengthText}>
                  {formData.newPassword.length >= 8 ? '강함' : 
                   formData.newPassword.length >= 6 ? '보통' : '약함'}
                </Text>
              </View>
            </View>
          )}

          {/* Change Password Button */}
          <TouchableOpacity
            style={[styles.changeButton, isLoading && styles.disabledButton]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            <Text style={styles.changeButtonText}>
              {isLoading ? '변경 중...' : '비밀번호 변경'}
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
  section: {
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
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeButton: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  eyeIcon: {
    fontSize: 20,
  },
  passwordHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    lineHeight: 16,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  strengthBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 4,
  },
  strengthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    minWidth: 40,
  },
  changeButton: {
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
  changeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChangePasswordScreen;
