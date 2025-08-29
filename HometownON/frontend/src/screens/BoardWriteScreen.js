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
import { getCurrentUser } from '../utils/storage';

const BoardWriteScreen = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
  });

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
    }
  };

  const categories = [
    { key: 'community', title: '커뮤니티', icon: '👥', description: '지역 소식, 모임, 이벤트' },
    { key: 'career', title: '커리어', icon: '💼', description: '직업, 기술, 멘토링' },
    { key: 'lifestyle', title: '라이프스타일', icon: '🏠', description: '일상, 취미, 맛집' },
    { key: 'question', title: '질문', icon: '❓', description: '궁금한 점, 도움 요청' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCategorySelect = (category) => {
    setFormData(prev => ({
      ...prev,
      category,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return false;
    }
    if (!formData.content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return false;
    }
    if (!formData.category) {
      Alert.alert('알림', '카테고리를 선택해주세요.');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    Alert.alert(
      '게시글 등록',
      '게시글을 등록하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '등록',
          onPress: () => {
            // 실제로는 서버에 게시글을 저장하는 로직이 들어갑니다
            Alert.alert('성공', '게시글이 등록되었습니다!', [
              {
                text: '확인',
                onPress: () => navigation.goBack(),
              },
            ]);
          },
        },
      ]
    );
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'community': return '👥';
      case 'career': return '💼';
      case 'lifestyle': return '🏠';
      case 'question': return '❓';
      default: return '📋';
    }
  };

  const getCategoryTitle = (category) => {
    switch (category) {
      case 'community': return '커뮤니티';
      case 'career': return '커리어';
      case 'lifestyle': return '라이프스타일';
      case 'question': return '질문';
      default: return '기타';
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
          <Text style={styles.headerTitle}>게시글 작성</Text>
          <TouchableOpacity 
            style={[styles.submitButton, (!formData.title || !formData.content || !formData.category) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!formData.title || !formData.content || !formData.category}
          >
            <Text style={styles.submitButtonText}>등록</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>카테고리 선택 *</Text>
            <View style={styles.categoryGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categoryCard,
                    formData.category === category.key && styles.categoryCardActive
                  ]}
                  onPress={() => handleCategorySelect(category.key)}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={[
                    styles.categoryTitle,
                    formData.category === category.key && styles.categoryTitleActive
                  ]}>
                    {category.title}
                  </Text>
                  <Text style={[
                    styles.categoryDescription,
                    formData.category === category.key && styles.categoryDescriptionActive
                  ]}>
                    {category.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Title Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>제목 *</Text>
            <TextInput
              style={styles.titleInput}
              value={formData.title}
              onChangeText={(text) => handleInputChange('title', text)}
              placeholder="제목을 입력하세요"
              placeholderTextColor="#999"
              maxLength={100}
            />
            <Text style={styles.characterCount}>
              {formData.title.length}/100
            </Text>
          </View>

          {/* Content Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>내용 *</Text>
            <TextInput
              style={styles.contentInput}
              value={formData.content}
              onChangeText={(text) => handleInputChange('content', text)}
              placeholder="내용을 입력하세요"
              placeholderTextColor="#999"
              multiline
              textAlignVertical="top"
              maxLength={2000}
            />
            <Text style={styles.characterCount}>
              {formData.content.length}/2000
            </Text>
          </View>

          {/* Writing Tips */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>💡 작성 팁</Text>
            <View style={styles.tipsList}>
              <Text style={styles.tipItem}>• 구체적이고 명확한 제목을 사용해주세요</Text>
              <Text style={styles.tipItem}>• 다른 사용자들이 도움을 받을 수 있도록 상세히 작성해주세요</Text>
              <Text style={styles.tipItem}>• 개인정보나 민감한 정보는 포함하지 마세요</Text>
              <Text style={styles.tipItem}>• 상호 존중하는 마음으로 작성해주세요</Text>
            </View>
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
    backgroundColor: '#F88742',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  categoryCardActive: {
    backgroundColor: '#F0F0FF',
    borderColor: '#6956E5',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryTitleActive: {
    color: '#6956E5',
  },
  categoryDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    lineHeight: 14,
  },
  categoryDescriptionActive: {
    color: '#6956E5',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    height: 200,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  tipsSection: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default BoardWriteScreen;
