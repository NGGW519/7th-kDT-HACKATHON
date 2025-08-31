import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getCurrentUser } from '../utils/storage';

const MentorBoardScreen = () => {
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userSpecialty, setUserSpecialty] = useState('수리'); // 사용자의 관심 분야
  
  // 분야 매칭 시스템
  const specialtyMapping = {
    '수리': ['technical'],
    '농업': ['agriculture'],
    'IT': ['technical'],
    '청소': ['lifestyle'],
  };
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: '전기공 기술 멘토링 제공합니다',
      content: '20년간 전기공으로 일한 경험을 바탕으로 전기 기술을 가르쳐드립니다. 초보자도 환영합니다.',
      author: '이철수 멘토',
      category: 'technical',
      likes: 15,
      comments: 8,
      views: 52,
      createdAt: '2024-01-15',
      isNew: true,
      experience: '20년',
      hourlyRate: '3만원',
      location: '경남 거제시 고현동',
    },
    {
      id: 2,
      title: '농업 기술 멘토 찾습니다',
      content: '도시에서 고향으로 돌아와서 농업을 시작하고 싶은데, 경험 있으신 분들의 멘토링을 받고 싶습니다.',
      author: '박귀향님',
      category: 'seeking',
      likes: 8,
      comments: 12,
      views: 38,
      createdAt: '2024-01-14',
      isNew: false,
      experience: '초보자',
      hourlyRate: '협의',
      location: '함안군 가야읍',
    },
    {
      id: 3,
      title: 'IT 기술 멘토링 서비스',
      content: '웹 개발, 앱 개발, 데이터 분석 등 IT 기술을 가르쳐드립니다. 온라인/오프라인 모두 가능합니다.',
      author: '이개발 멘토',
      category: 'technical',
      likes: 12,
      comments: 6,
      views: 45,
      createdAt: '2024-01-13',
      isNew: false,
      experience: '15년',
      hourlyRate: '5만원',
      location: '함안군 가야읍',
    },
    {
      id: 4,
      title: '요리 기술 멘토링',
      content: '전통 요리와 현대 요리를 모두 가르쳐드립니다. 개인 레슨, 그룹 레슨 모두 가능합니다.',
      author: '최요리 멘토',
      category: 'lifestyle',
      likes: 18,
      comments: 10,
      views: 67,
      createdAt: '2024-01-12',
      isNew: false,
      experience: '25년',
      hourlyRate: '4만원',
      location: '함안군 가야읍',
    },
    {
      id: 5,
      title: '사업 멘토링 받고 싶습니다',
      content: '고향에서 작은 사업을 시작하고 싶은데, 경험 있으신 분들의 조언을 받고 싶습니다.',
      author: '함사업님',
      category: 'seeking',
      likes: 6,
      comments: 9,
      views: 29,
      createdAt: '2024-01-11',
      isNew: false,
      experience: '초보자',
      hourlyRate: '협의',
      location: '강원도 태백시',
    },
  ]);

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
    { key: 'all', title: '전체', icon: '📋' },
    { key: 'technical', title: '기술', icon: '🔧' },
    { key: 'lifestyle', title: '라이프스타일', icon: '🏠' },
    { key: 'business', title: '사업', icon: '💼' },
    { key: 'seeking', title: '멘토 찾기', icon: '🔍' },
    { key: 'offering', title: '멘토 제공', icon: '🎓' },
  ];

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'technical': return '🔧';
      case 'lifestyle': return '🏠';
      case 'business': return '💼';
      case 'seeking': return '🔍';
      case 'offering': return '🎓';
      default: return '📋';
    }
  };

  const getCategoryTitle = (category) => {
    switch (category) {
      case 'technical': return '기술';
      case 'lifestyle': return '라이프스타일';
      case 'business': return '사업';
      case 'seeking': return '멘토 찾기';
      case 'offering': return '멘토 제공';
      default: return '기타';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  // 분야 매칭 확인 함수
  const isSpecialtyMatch = (postCategory) => {
    const userSpecialties = specialtyMapping[userSpecialty] || [];
    return userSpecialties.includes(postCategory);
  };

  // 매칭 점수 계산 함수
  const getMatchScore = (post) => {
    if (isSpecialtyMatch(post.category)) {
      return 100; // 완벽 매칭
    }
    return 0; // 매칭 안됨
  };

  const renderPost = ({ item }) => (
    <View style={styles.postItem}>
      <View style={styles.postHeader}>
        <View style={styles.postInfo}>
          <Text style={styles.categoryTag}>
            {getCategoryIcon(item.category)} {getCategoryTitle(item.category)}
          </Text>
          {item.isNew && <Text style={styles.newTag}>NEW</Text>}
        </View>
        <Text style={styles.postDate}>{formatDate(item.createdAt)}</Text>
      </View>
      
      <Text style={styles.postTitle} numberOfLines={2}>
        {item.title}
      </Text>
      
      <Text style={styles.postContent} numberOfLines={2}>
        {item.content}
      </Text>
      
      <View style={styles.postDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>경험:</Text>
          <Text style={styles.detailValue}>{item.experience}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>시간당:</Text>
          <Text style={styles.detailValue}>{item.hourlyRate}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>위치:</Text>
          <Text style={styles.detailValue}>{item.location}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>상태:</Text>
          <View style={styles.matchContainer}>
            {item.category === 'seeking' ? (
              <Text style={styles.seekingStatus}>📝 도움 요청</Text>
            ) : isSpecialtyMatch(item.category) ? (
              <Text style={styles.matchSuccess}>🎯 관심 분야!</Text>
            ) : (
              <Text style={styles.matchFail}>❌ 다른 분야</Text>
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.postFooter}>
        <View style={styles.authorInfo}>
          <Image 
            source={require('../assets/images/회원가입_귀향자.png')}
            style={styles.authorAvatar}
            resizeMode="contain"
          />
          <Text style={styles.authorName}>{item.author}</Text>
        </View>
        
        <View style={styles.postStats}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>👍</Text>
            <Text style={styles.statText}>{item.likes}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>💬</Text>
            <Text style={styles.statText}>{item.comments}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>👁️</Text>
            <Text style={styles.statText}>{item.views}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[
            styles.contactButton,
            isSpecialtyMatch(item.category) && styles.contactButtonHighlight
          ]}
          onPress={() => navigation.navigate('MentorDetailScreen', { post: item })}
        >
          <Text style={[
            styles.contactButtonText,
            isSpecialtyMatch(item.category) && styles.contactButtonTextHighlight
          ]}>
            {item.category === 'seeking' ? '멘토 찾기' : (isSpecialtyMatch(item.category) ? '멘토 상세보기' : '멘토 보기')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.messageButton}
          onPress={() => navigation.navigate('MessengerChatScreen', { 
            recipient: item.author,
            requestTitle: item.title,
            requestId: item.id
          })}
        >
          <Text style={styles.messageButtonText}>연락하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6956E5" />
      


      {/* User Specialty Info */}
      <View style={styles.specialtyContainer}>
        <Text style={styles.specialtyText}>
          관심 분야: <Text style={styles.specialtyHighlight}>{userSpecialty}</Text>
        </Text>
        <Text style={styles.matchStatsText}>
          관심 분야 멘토: {posts.filter(post => isSpecialtyMatch(post.category) && post.category !== 'seeking').length}명
        </Text>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
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
        </ScrollView>
      </View>

      {/* Posts List */}
      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        style={styles.postsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.postsContainer}
      />
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  writeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  writeButtonText: {
    fontSize: 18,
  },
  categoryContainer: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 15,
  },
  categoryScroll: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryButtonActive: {
    backgroundColor: '#6956E5',
    borderColor: '#6956E5',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryTitleActive: {
    color: '#FFF',
  },
  postsList: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  postsContainer: {
    padding: 20,
  },
  postItem: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTag: {
    fontSize: 12,
    color: '#6956E5',
    backgroundColor: '#F0F0FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  newTag: {
    fontSize: 10,
    color: '#FFF',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  postDate: {
    fontSize: 12,
    color: '#999',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  postContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  postDetails: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    width: 50,
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  authorName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  statIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  matchContainer: {
    flex: 1,
  },
  matchSuccess: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: 'bold',
  },
  matchFail: {
    fontSize: 12,
    color: '#dc3545',
    fontWeight: '600',
  },
  seekingStatus: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#6956E5',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonHighlight: {
    backgroundColor: '#28a745',
  },
  contactButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  contactButtonTextHighlight: {
    color: '#FFF',
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#F88742',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  messageButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  specialtyContainer: {
    backgroundColor: '#F0F0FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  specialtyText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  specialtyHighlight: {
    color: '#6956E5',
    fontWeight: 'bold',
  },
  matchStatsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default MentorBoardScreen;
