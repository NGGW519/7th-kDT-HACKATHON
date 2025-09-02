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
} from 'react-native';
import { getCurrentUser } from '../../../utils/storage';

const MentorSeekingWriteScreen = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('technical');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [preferredMethod, setPreferredMethod] = useState('face');

  const categories = [
    { key: 'technical', title: '기술', icon: '🔧' },
    { key: 'agriculture', title: '농업', icon: '🌾' },
    { key: 'lifestyle', title: '라이프스타일', icon: '🏠' },
    { key: 'business', title: '사업', icon: '💼' },
    { key: 'education', title: '교육', icon: '📚' },
    { key: 'other', title: '기타', icon: '📋' },
  ];

  const preferredMethods = [
    { key: 'face', title: '대면', icon: '👥' },
    { key: 'online', title: '온라인', icon: '💻' },
    { key: 'both', title: '혼합', icon: '🔄' },
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setLocation(user.location || '');
      }
    } catch (error) {
      console.error('사용자 데이터 로드 오류:', error);
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }
    if (!location.trim()) {
      Alert.alert('알림', '위치를 입력해주세요.');
      return;
    }

    // 실제로는 서버에 저장하는 로직이 들어가야 함
    Alert.alert(
      '멘토 찾기 등록',
      '멘토 찾기 게시글이 성공적으로 등록되었습니다!',
      [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const getCategoryTitle = (key) => {
    const category = categories.find(cat => cat.key === key);
    return category ? category.title : '기타';
  };

  const getMethodTitle = (key) => {
    const method = preferredMethods.find(m => m.key === key);
    return method ? method.title : '대면';
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
          <Text style={styles.headerTitle}>멘토 찾기</Text>
          <TouchableOpacity 
            style={[styles.submitButton, (!title.trim() || !content.trim()) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!title.trim() || !content.trim()}
          >
            <Text style={styles.submitButtonText}>등록</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>찾고 있는 분야</Text>
          <View style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.key && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category.key)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryTitle,
                  selectedCategory === category.key && styles.categoryTitleActive
                ]}>
                  {category.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제목</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="멘토 찾기 제목을 입력하세요"
            placeholderTextColor="#999"
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        {/* Content Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>상세 내용</Text>
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="어떤 멘토링을 받고 싶은지 자세히 설명해주세요"
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
            maxLength={1000}
          />
          <Text style={styles.charCount}>{content.length}/1000</Text>
        </View>

        {/* Budget Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>예산 (선택사항)</Text>
          <TextInput
            style={styles.budgetInput}
            value={budget}
            onChangeText={setBudget}
            placeholder="예산을 입력하세요 (예: 시간당 3만원)"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        {/* Location Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>희망 지역</Text>
          <TextInput
            style={styles.locationInput}
            value={location}
            onChangeText={setLocation}
            placeholder="멘토링을 받고 싶은 지역을 입력하세요"
            placeholderTextColor="#999"
          />
        </View>

        {/* Preferred Method Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>선호하는 방식</Text>
          <View style={styles.methodContainer}>
            {preferredMethods.map((method) => (
              <TouchableOpacity
                key={method.key}
                style={[
                  styles.methodButton,
                  preferredMethod === method.key && styles.methodButtonActive
                ]}
                onPress={() => setPreferredMethod(method.key)}
              >
                <Text style={styles.methodIcon}>{method.icon}</Text>
                <Text style={[
                  styles.methodTitle,
                  preferredMethod === method.key && styles.methodTitleActive
                ]}>
                  {method.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Writing Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 멘토 찾기 팁</Text>
          <Text style={styles.tipItem}>• 구체적으로 어떤 도움이 필요한지 명시해주세요</Text>
          <Text style={styles.tipItem}>• 예산 범위를 알려주면 더 정확한 매칭이 가능해요</Text>
          <Text style={styles.tipItem}>• 희망하는 멘토링 방식과 시간을 명확히 해주세요</Text>
          <Text style={styles.tipItem}>• 현재 상황과 목표를 설명하면 더 좋은 멘토를 찾을 수 있어요</Text>
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
  submitButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  section: {
    backgroundColor: '#FFF',
    marginBottom: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  categoryTitle: {
    fontSize: 14,
    color: '#666',
  },
  categoryTitleActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
    minHeight: 120,
  },
  budgetInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  locationInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  methodContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  methodButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  methodIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  methodTitle: {
    fontSize: 14,
    color: '#666',
  },
  methodTitleActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
  tipsSection: {
    backgroundColor: '#FFF',
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  tipItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default MentorSeekingWriteScreen;
