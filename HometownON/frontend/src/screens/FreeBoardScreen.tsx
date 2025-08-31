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

const FreeBoardScreen = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: '고향에서의 첫 번째 봄',
      content: '도시에서 고향으로 돌아온 지 3개월이 되었는데, 이번 봄이 정말 특별하게 느껴져요. 고향의 봄은 정말 아름다워요.',
      author: '김귀향',
      category: 'daily',
      likes: 15,
      comments: 12,
      views: 78,
      createdAt: '2024-01-15',
      isNew: true,
    },
    {
      id: 2,
      title: '고향 맛집 추천해주세요!',
      content: '오랜만에 고향에 왔는데, 추억의 맛집들이 많이 변했네요. 추천할 만한 맛집 있으시면 알려주세요.',
      author: '박맛집',
      category: 'food',
      likes: 22,
      comments: 18,
      views: 95,
      createdAt: '2024-01-14',
      isNew: false,
    },
    {
      id: 3,
      title: '고향 친구들과의 재회',
      content: '20년 만에 고향 친구들과 만났는데, 시간이 멈춘 것 같았어요. 여러분도 그런 경험 있으신가요?',
      author: '이친구',
      category: 'memory',
      likes: 18,
      comments: 14,
      views: 67,
      createdAt: '2024-01-13',
      isNew: false,
    },
    {
      id: 4,
      title: '고향의 계절 변화',
      content: '고향의 사계절 중 가장 아름다운 계절은 무엇인가요? 저는 가을의 단풍이 가장 좋아요.',
      author: '최계절',
      category: 'nature',
      likes: 11,
      comments: 8,
      views: 45,
      createdAt: '2024-01-12',
      isNew: false,
    },
    {
      id: 5,
      title: '고향에서 새로운 취미',
      content: '고향에 돌아와서 새로운 취미를 시작했어요. 여러분은 고향에서 어떤 취미를 가지고 계신가요?',
      author: '함취미',
      category: 'hobby',
      likes: 9,
      comments: 6,
      views: 38,
      createdAt: '2024-01-11',
      isNew: false,
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
    { key: 'daily', title: '일상', icon: '☀️' },
    { key: 'food', title: '맛집', icon: '🍽️' },
    { key: 'memory', title: '추억', icon: '💭' },
    { key: 'nature', title: '자연', icon: '🌿' },
    { key: 'hobby', title: '취미', icon: '🎨' },
  ];

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'daily': return '☀️';
      case 'food': return '🍽️';
      case 'memory': return '💭';
      case 'nature': return '🌿';
      case 'hobby': return '🎨';
      default: return '📋';
    }
  };

  const getCategoryTitle = (category) => {
    switch (category) {
      case 'daily': return '일상';
      case 'food': return '맛집';
      case 'memory': return '추억';
      case 'nature': return '자연';
      case 'hobby': return '취미';
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

  const renderPost = ({ item }) => (
    <TouchableOpacity 
      style={styles.postItem}
      onPress={() => navigation.navigate('FreeBoardDetail', { post: item })}
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
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6956E5" />
      


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
