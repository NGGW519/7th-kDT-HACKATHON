import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getCurrentUser } from '../../utils/storage';
import API_URL from '../../config/apiConfig';
import AuthService from '../../services/AuthService';

const FreeBoardScreen = ({ navigation, route }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
    fetchPosts();
  }, []);

  // 새로고침 파라미터 감지
  useEffect(() => {
    if (route?.params?.refresh) {
      fetchPosts();
    }
  }, [route?.params?.refresh]);

  const fetchPosts = async () => {
    try {
      const token = await AuthService.getToken();
      console.log('Fetching board posts...');
      const response = await fetch(`${API_URL}/api/board/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Board API Response:', data);
        setPosts(data);
      } else {
        console.log('Board API not available, using sample data');
        // 샘플 데이터 사용
        setPosts([
          {
            id: 1,
            title: '함안 맛집 추천해주세요!',
            content: '이번 주말에 함안에 놀러가는데 맛있는 식당 추천 부탁드려요.',
            category: '자유',
            author: { profile: { display_name: '맛집탐험가' } },
            likes_count: 5,
            comments_count: 3,
            created_at: new Date().toISOString(),
          },
          {
            id: 2,
            title: '함안 아라가야 테마파크 후기',
            content: '어제 다녀왔는데 정말 좋았어요! 가족들과 함께 가기 좋은 곳이네요.',
            category: '자유',
            author: { profile: { display_name: '여행러버' } },
            likes_count: 8,
            comments_count: 2,
            created_at: new Date(Date.now() - 86400000).toISOString(),
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      // 에러 시 샘플 데이터 사용
      setPosts([]);
    }
  };

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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  // 자유게시판은 모든 글을 표시 (카테고리 필터링 제거)
  const filteredPosts = posts;

  const getCategoryIcon = (category) => {
    return '💬'; // 자유게시판은 모두 동일한 아이콘
  };

  const getCategoryTitle = (category) => {
    return '자유'; // 자유게시판은 모두 '자유' 카테고리
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
        </View>
        <Text style={styles.postDate}>{formatDate(item.created_at)}</Text>
      </View>

      <Text style={styles.postTitle} numberOfLines={2}>
        {item.title}
      </Text>

      <Text style={styles.postContent} numberOfLines={2}>
        {item.content}
      </Text>

      <View style={styles.postFooter}>
        <View style={styles.authorInfo}>
          <Image
            source={require('../../assets/images/회원가입_귀향자.png')}
            style={styles.authorAvatar}
            resizeMode="contain"
          />
          <Text style={styles.authorName}>{item.author?.profile?.display_name || '익명'}</Text>
        </View>

        <View style={styles.postStats}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>👍</Text>
            <Text style={styles.statText}>{item.likes_count}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>💬</Text>
            <Text style={styles.statText}>{item.comments_count}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6956E5" />



      {/* 자유게시판은 카테고리 필터 없이 모든 글 표시 */}

      {/* Posts List */}
      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        style={styles.postsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.postsContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6956E5']}
            tintColor="#6956E5"
          />
        }
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
    marginTop: -10,
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
    marginBottom: 15,
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
});

export default FreeBoardScreen;
