import React from 'react';
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
  View
} from 'react-native';
import { getCurrentUser } from '../utils/storage';

const ResEditProfileScreen = ({ navigation }) => {
  const [formData, setFormData] = React.useState({
    email: '',
    residentName: '',
    location: '',
    personality: '',
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);

  React.useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      if (user) {
        setFormData({
          email: user.email || '',
          residentName: user.residentName || user.returnName || user.name || '',
          location: user.location || user.hometown || '',
          personality: user.personality || '',
        });
      }
    } catch (error) {
      console.error('사용자 정보 로드 오류:', error);
      Alert.alert('오류', '사용자 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.residentName.trim()) {
      Alert.alert('오류', '지역주민 이름을 입력해주세요.');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('오류', '거주 지역을 입력해주세요.');
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
        email: formData.email,
        residentName: formData.residentName,
        location: formData.location,
        personality: formData.personality,
        // 호환을 위해 기존 키도 업데이트(선택)
        returnName: formData.residentName,
        hometown: formData.location,
        updatedAt: new Date().toISOString(),
      };

      // saveUser 사용 프로젝트라면 여기서 저장 함수 호출
      const res = await import('../utils/storage');
      const success = await res.saveUser(updatedUser);

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
          <Text style={styles.headerTitle}>회원정보 수정</Text>
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

          {/* 2. 기본 정보 (ResidentSignUpScreen 기준으로 수정) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. 기본 정보</Text>

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
                placeholder="현재 거주 지역 (예: 경기도 수원시 팔달구)"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* 3. 나의 성향 및 기대 (유지) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. 나의 성향 및 기대</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.personality}
              onChangeText={(text) => handleInputChange('personality', text)}
              placeholder="관심사, 성향, 기대 등을 자유롭게 작성해주세요"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#6956E5', marginBottom: 15 },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  textInput: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10,
    paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, backgroundColor: '#FAFAFA',
  },
  disabledInput: { backgroundColor: '#F0F0F0', color: '#666' },
  textArea: { height: 100, textAlignVertical: 'top' },
  saveButton: {
    backgroundColor: '#6956E5', paddingVertical: 18, borderRadius: 10, alignItems: 'center',
    marginVertical: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 3,
  },
  disabledButton: { backgroundColor: '#CCC' },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default ResEditProfileScreen;
