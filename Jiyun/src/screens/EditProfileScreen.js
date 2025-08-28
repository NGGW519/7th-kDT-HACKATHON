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

const EditProfileScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    returnName: '',
    hometown: '',
    previousCareer: '',
    careerType: '',
    personality: '',
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
          returnName: user.returnName || user.name || '',
          hometown: user.hometown || '',
          previousCareer: user.previousCareer || '',
          careerType: user.careerType || '',
          personality: user.personality || '',
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

  const handleCareerTypeSelect = (type) => {
    setFormData(prev => ({
      ...prev,
      careerType: type,
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
    if (!formData.careerType) {
      Alert.alert('오류', '커리어 유형을 선택해주세요.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const updatedUser = {
        ...currentUser,
        ...formData,
        updatedAt: new Date().toISOString(),
      };

      const success = await saveUser(updatedUser);
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
            <Text style={styles.sectionTitle}>3. 커리어 유형 선택 *</Text>
            <View style={styles.careerTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.careerTypeButton,
                  formData.careerType === 'continue' && styles.careerTypeButtonActive,
                ]}
                onPress={() => handleCareerTypeSelect('continue')}
              >
                <Text style={[
                  styles.careerTypeButtonText,
                  formData.careerType === 'continue' && styles.careerTypeButtonTextActive,
                ]}>
                  커리어 지속형
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.careerTypeButton,
                  formData.careerType === 'change' && styles.careerTypeButtonActive,
                ]}
                onPress={() => handleCareerTypeSelect('change')}
              >
                <Text style={[
                  styles.careerTypeButtonText,
                  formData.careerType === 'change' && styles.careerTypeButtonTextActive,
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
