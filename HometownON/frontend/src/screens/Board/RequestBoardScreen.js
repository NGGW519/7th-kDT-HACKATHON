import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  FlatList,
  Image,
} from 'react-native';
import { getCurrentUser } from '../../utils/storage';

const RequestBoardScreen = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userSpecialty, setUserSpecialty] = useState('수리'); // 사용자의 전문 분야
  
  // 분야 매칭 시스템
  const specialtyMapping = {
    '수리': ['repair', 'installation'],
    '농업': ['agriculture'],
    'IT': ['it'],
    '청소': ['cleaning'],
  };
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: '집 수리 의뢰합니다',
      content: '오래된 집을 수리하고 싶습니다. 전기공, 목수, 도배공 등 필요한 분들 연락 부탁드려요.',
      author: '김기준',
      category: 'repair',
      likes: 8,
      comments: 5,
      views: 32,
      createdAt: '2024-01-15',
      isNew: true,
      budget: '50-100만원',
      location: '강원도 춘천시',
      status: 'pending', // pending, completed
      acceptedBy: null,
    },
    {
      id: 2,
      title: '농작물 수확 도움 요청',
      content: '사과 농장에서 수확을 도와주실 분을 찾습니다. 경험자 우대하고, 일당 협의 가능합니다.',
      author: '박농부',
      category: 'agriculture',
      likes: 12,
      comments: 8,
      views: 45,
      createdAt: '2024-01-14',
      isNew: false,
      budget: '일당 협의',
      location: '강원도 원주시',
      status: 'completed',
      acceptedBy: '함필규',
    },
    {
      id: 3,
      title: '컴퓨터 수리 의뢰',
      content: '노트북이 갑자기 켜지지 않아요. 컴퓨터 수리에 능숙하신 분 도움 부탁드립니다.',
      author: '이도시',
      category: 'it',
      likes: 6,
      comments: 3,
      views: 28,
      createdAt: '2024-01-13',
      isNew: false,
      budget: '10-30만원',
      location: '강원도 강릉시',
      status: 'pending',
      acceptedBy: null,
    },
    {
      id: 4,
      title: '집 청소 도움 요청',
      content: '이사 후 집 정리가 필요합니다. 청소 도와주실 분 찾아요.',
      author: '최이사',
      category: 'cleaning',
      likes: 4,
      comments: 2,
      views: 18,
      createdAt: '2024-01-12',
      isNew: false,
      budget: '5-10만원',
      location: '강원도 속초시',
      status: 'pending',
      acceptedBy: null,
    },
    {
      id: 5,
      title: '가전제품 설치 의뢰',
      content: '새로 산 에어컨 설치를 도와주실 분을 찾습니다. 전문가 분 연락 부탁드려요.',
      author: '함필규',
      category: 'installation',
      likes: 9,
      comments: 6,
      views: 35,
      createdAt: '2024-01-11',
      isNew: false,
      budget: '20-40만원',
      location: '강원도 태백시',
      status: 'pending',
      acceptedBy: null,
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
    { key: 'repair', title: '수리', icon: '🔧' },
    { key: 'agriculture', title: '농업', icon: '🌾' },
    { key: 'it', title: 'IT', icon: '💻' },
    { key: 'cleaning', title: '청소', icon: '🧹' },
    { key: 'installation', title: '설치', icon: '🔨' },
  ];

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'repair': return '🔧';
      case 'agriculture': return '🌾';
      case 'it': return '💻';
      case 'cleaning': return '🧹';
      case 'installation': return '🔨';
      default: return '📋';
    }
  };

  const getCategoryTitle = (category) => {
    switch (category) {
      case 'repair': return '수리';
      case 'agriculture': return '농업';
      case 'it': return 'IT';
      case 'cleaning': return '청소';
      case 'installation': return '설치';
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

  const handleAcceptRequest = (postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, status: 'completed', acceptedBy: currentUser?.returnName || currentUser?.name || '익명' }
        : post
    ));
  };

  const handleContactAuthor = (post) => {
    // 메시지 화면으로 이동
    navigation.navigate('Messenger', { 
      recipient: post.author,
      requestTitle: post.title,
      requestId: post.id
    });
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
    <TouchableOpacity 
      style={styles.postItem}
      onPress={() => navigation.navigate('BoardDetail', { post: item })}
    >
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
          <Text style={styles.detailLabel}>예산:</Text>
          <Text style={styles.detailValue}>{item.budget}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>위치:</Text>
          <Text style={styles.detailValue}>{item.location}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>상태:</Text>
          <View style={styles.statusContainer}>
            {item.status === 'completed' ? (
              <Text style={styles.statusCompleted}>✅ 완료됨</Text>
            ) : (
              <Text style={styles.statusPending}>⏳ 대기중</Text>
            )}
          </View>
        </View>
        {item.status === 'completed' && item.acceptedBy && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>수락자:</Text>
            <Text style={styles.detailValue}>{item.acceptedBy}</Text>
          </View>
        )}
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>매칭:</Text>
          <View style={styles.matchContainer}>
            {isSpecialtyMatch(item.category) ? (
              <Text style={styles.matchSuccess}>🎯 완벽 매칭!</Text>
            ) : (
              <Text style={styles.matchFail}>❌ 분야 불일치</Text>
            )}
          </View>
        </View>
      </View>
      
              <View style={styles.postFooter}>
          <View style={styles.authorInfo}>
            <Image 
              source={require('../../assets/images/회원가입_지역주민.png')}
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
      {item.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[
              styles.acceptButton,
              !isSpecialtyMatch(item.category) && styles.acceptButtonDisabled
            ]}
            onPress={() => handleAcceptRequest(item.id)}
            disabled={!isSpecialtyMatch(item.category)}
          >
            <Text style={[
              styles.acceptButtonText,
              !isSpecialtyMatch(item.category) && styles.acceptButtonTextDisabled
            ]}>
              {isSpecialtyMatch(item.category) ? '의뢰 수락' : '분야 불일치'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => handleContactAuthor(item)}
          >
            <Text style={styles.contactButtonText}>연락하기</Text>
          </TouchableOpacity>
        </View>
      )}
      
            {item.status === 'completed' && (
        <View style={styles.completedInfo}>
          <Text style={styles.completedText}>✅ 의뢰가 완료되었습니다</Text>
        </View>
      )}
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>의뢰게시판</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      {/* User Specialty Info */}
      <View style={styles.specialtyContainer}>
        <Text style={styles.specialtyText}>
          나의 분야: <Text style={styles.specialtyHighlight}>{userSpecialty}</Text>
        </Text>
        <Text style={styles.matchStatsText}>
          매칭 가능한 의뢰: {posts.filter(post => isSpecialtyMatch(post.category) && post.status === 'pending').length}개
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
    width: 40,
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
  statusContainer: {
    flex: 1,
  },
  statusCompleted: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
  },
  statusPending: {
    fontSize: 12,
    color: '#ffc107',
    fontWeight: '600',
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
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  acceptButtonTextDisabled: {
    color: '#adb5bd',
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#6956E5',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  completedInfo: {
    backgroundColor: '#d4edda',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  completedText: {
    color: '#155724',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RequestBoardScreen;
