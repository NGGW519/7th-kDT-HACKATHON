// src/screens/MentorBoardWriteScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getCurrentUser } from '../../../utils/storage';

const MentorBoardWriteScreen = ({ navigation, route }) => { // Add route prop
  const { boardType } = route.params || {}; // Extract boardType from params
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // ✅ 카테고리 키 타입을 현재 카테고리에 맞게 수정
  const [selectedCategory, setSelectedCategory] = useState<
    'technical' | 'lifestyle' | 'business' | 'seeking' | 'offering'
  >('technical');

  // 멘토 게시판 카테고리
  const categories = [
    { key: 'technical',  title: '기술',        icon: '🔧' },
    { key: 'lifestyle',  title: '라이프스타일', icon: '🏠' },
    { key: 'business',   title: '사업',        icon: '💼' },
    { key: 'seeking',    title: '멘토 찾기',    icon: '🔍' },
    { key: 'offering',   title: '멘토 제공',    icon: '🎓' },
  ] as const;

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      if (user) setCurrentUser(user);
    } catch (error) {
      console.error('사용자 데이터 로드 오류:', error);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }

    const authorName = currentUser?.returnName || currentUser?.name || '익명';

    const post = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      category: selectedCategory,
      author: authorName,
      createdAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      isNew: true,
    };

    Alert.alert('멘토 게시글 등록', '게시글이 성공적으로 등록되었습니다!', [
      {
        text: '확인',
        onPress: () => navigation.navigate('BoardDetailScreen', { post }),
      },
    ]);
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
          <Text style={styles.headerTitle}>
            {boardType === "의뢰 게시판" ? "의뢰 게시글 작성" :
             boardType === "자유 게시판" ? "자유 게시글 작성" :
             "멘토 게시글 작성"}
          </Text>
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
          <Text style={styles.sectionTitle}>카테고리</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => {
              const active = selectedCategory === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.categoryButton, active && styles.categoryButtonActive]}
                  onPress={() => setSelectedCategory(cat.key as any)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={[styles.categoryTitle, active && styles.categoryTitleActive]}>
                    {cat.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제목</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="제목을 입력하세요"
            placeholderTextColor="#999"
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        {/* Content Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내용</Text>
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="내용을 자유롭게 작성해주세요"
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
            maxLength={2000}
          />
          <Text style={styles.charCount}>{content.length}/2000</Text>
        </View>

        {/* ✅ 멘토 게시판 전용 작성 팁 */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 멘토 게시판 작성 팁</Text>
          <Text style={styles.tipItem}>• <Text style={{fontWeight:'700'}}>기술</Text>: 사용 스택/경험 수준, 해결하고 싶은 문제, 원하는 피드백 형태(코드리뷰/페어 등)를 명확히 적어주세요.</Text>
          <Text style={styles.tipItem}>• <Text style={{fontWeight:'700'}}>라이프스타일</Text>: 지역 정착 경험, 생활 팁, 시간 관리/건강 루틴 등 실전 팁 위주로 공유해 주세요.</Text>
          <Text style={styles.tipItem}>• <Text style={{fontWeight:'700'}}>사업</Text>: 창업 단계(아이디어/실행/운영), 필요 조언(마케팅/세무/자금), 목표 기간을 적으면 좋아요.</Text>
          <Text style={styles.tipItem}>• <Text style={{fontWeight:'700'}}>멘토 찾기</Text>: 필요한 분야·레벨(초급/중급/고급), 세션 빈도/형식(온라인/오프라인), 예산/가능 시간대를 포함해 주세요.</Text>
          <Text style={styles.tipItem}>• <Text style={{fontWeight:'700'}}>멘토 제공</Text>: 가능 분야·경력, 제공 방식(1:1/그룹/자료), 가능 요일·시간, 유료/무료 여부를 명시해 주세요.</Text>
          <Text style={styles.tipItem}>• 서로를 존중하는 표현과 구체적인 기대치를 적을수록 매칭이 빨라집니다.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // 기존 양식/레이아웃 유지
  container: { flex: 1, backgroundColor: '#6956E5' },
  headerSafeArea: { backgroundColor: '#6956E5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 30, backgroundColor: '#6956E5',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 24, color: '#FFF', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', flex: 1, textAlign: 'center' },
  submitButton: { backgroundColor: '#45B7D1', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  submitButtonDisabled: { backgroundColor: '#CCC' },
  submitButtonText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },

  content: { flex: 1, backgroundColor: '#F8F9FA' },
  section: { backgroundColor: '#FFF', marginBottom: 10, padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },

  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryButton: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10,
    borderRadius: 20, backgroundColor: '#F0F0F0', borderWidth: 1, borderColor: '#E0E0E0',
  },
  categoryButtonActive: { backgroundColor: '#45B7D1', borderColor: '#45B7D1' },
  categoryIcon: { fontSize: 16, marginRight: 5 },
  categoryTitle: { fontSize: 14, color: '#666' },
  categoryTitleActive: { color: '#FFF', fontWeight: 'bold' },

  titleInput: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8,
    paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, backgroundColor: '#FFF',
  },
  contentInput: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8,
    paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, backgroundColor: '#FFF', minHeight: 200,
  },
  charCount: { fontSize: 12, color: '#999', textAlign: 'right', marginTop: 5 },

  tipsSection: { backgroundColor: '#FFF', margin: 20, padding: 20, borderRadius: 10 },
  tipsTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  tipItem: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 8 },
});

export default MentorBoardWriteScreen;
