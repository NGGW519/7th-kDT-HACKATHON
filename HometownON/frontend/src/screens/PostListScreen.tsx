import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';

// Define types for navigation
type RootStackParamList = {
  BoardScreen: undefined;
  PostListScreen: { categoryId: number; categoryName: string };
  PostDetailScreen: { postId: number };
  PostWriteScreen: { categoryId: number; categoryName: string };
};

type PostListScreenRouteProp = RouteProp<RootStackParamList, 'PostListScreen'>;
type PostListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PostListScreen'>;

interface PostListScreenProps {
  route: PostListScreenRouteProp;
  navigation: PostListScreenNavigationProp;
}

interface Post {
  id: number;
  category: number;
  session_id: string;
  is_anonymous: boolean;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  likes: number;
  comments: any[]; // Adjust this type based on your CommentSerializer
}

const API_BASE_URL = 'http://10.0.2.2:8000/api'; // Replace with your Django backend URL

const PostListScreen: React.FC<PostListScreenProps> = ({ route, navigation }) => {
  const { categoryId, categoryName } = route.params;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/posts/?category=${categoryId}`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [categoryId]);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [fetchPosts])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, [fetchPosts]);

  const renderPostItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postItem}
      onPress={() => navigation.navigate('게시판', { screen: 'PostDetailScreen', params: { postId: item.id } })}
    >
      <Text style={styles.postTitle}>{item.title}</Text>
      <View style={styles.postMeta}>
        <Text style={styles.postAuthor}>{item.is_anonymous ? '익명' : item.user ? item.user.name : '알 수 없음'}</Text>
        <Text style={styles.postDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      <View style={styles.postStats}>
        <Text>좋아요: {item.likes}</Text>
        <Text>댓글: {item.comments.length}</Text>
        <Text>조회수: {item.view_count}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>게시글을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{categoryName} 게시판</Text>
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.postList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>게시글이 없습니다. 첫 게시글을 작성해보세요!</Text>
        }
      />
      <TouchableOpacity
        style={styles.writeButton}
        onPress={() => navigation.navigate('PostWriteScreen', { categoryId, categoryName })}
      >
        <Text style={styles.writeButtonText}>글 작성</Text>
      </TouchableOpacity>

      {/* Paging UI Placeholder */}
      <View style={styles.pagingContainer}>
        <TouchableOpacity style={styles.pagingButton}>
          <Text>이전</Text>
        </TouchableOpacity>
        <Text style={styles.pagingText}>1</Text>
        <TouchableOpacity style={styles.pagingButton}>
          <Text>다음</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  postList: {
    paddingHorizontal: 10,
  },
  postItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  postAuthor: {
    fontSize: 14,
    color: '#666',
  },
  postDate: {
    fontSize: 14,
    color: '#666',
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  writeButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 20,
  },
  writeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pagingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  pagingButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  pagingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});

export default PostListScreen;
