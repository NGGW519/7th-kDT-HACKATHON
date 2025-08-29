import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { styles } from './PostListScreen.styles';

/**
 * @typedef {object} RootStackParamList
 * @property {undefined} BoardScreen - 게시판 메인 화면.
 * @property {{ categoryId: number; categoryName: string }} PostListScreen - 게시글 목록 화면.
 * @property {{ postId: number }} PostDetailScreen - 게시글 상세 화면.
 * @property {{ categoryId: number; categoryName: string }} PostWriteScreen - 게시글 작성 화면.
 */
type RootStackParamList = {
  BoardScreen: undefined;
  PostListScreen: { categoryId: number; categoryName: string };
  PostDetailScreen: { postId: number };
  PostWriteScreen: { categoryId: number; categoryName: string };
};

/**
 * @typedef {RouteProp<RootStackParamList, 'PostListScreen'>} PostListScreenRouteProp
 * @description PostListScreen의 라우트 속성 타입 정의.
 */
type PostListScreenRouteProp = RouteProp<RootStackParamList, 'PostListScreen'>;
/**
 * @typedef {StackNavigationProp<RootStackParamList, 'PostListScreen'>} PostListScreenNavigationProp
 * @description PostListScreen의 내비게이션 속성 타입 정의.
 */
type PostListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PostListScreen'>;

/**
 * @interface PostListScreenProps
 * @description PostListScreen 컴포넌트의 props 타입을 정의합니다.
 * @property {PostListScreenRouteProp} route - 라우트 객체.
 * @property {PostListScreenNavigationProp} navigation - 내비게이션 객체.
 */
interface PostListScreenProps {
  route: PostListScreenRouteProp;
  navigation: PostListScreenNavigationProp;
}

/**
 * @interface Post
 * @description 게시글 데이터 구조를 정의합니다.
 * @property {number} id - 게시글 ID.
 * @property {number} category - 게시글 카테고리 ID.
 * @property {string} session_id - 세션 ID (사용자 식별용).
 * @property {boolean} is_anonymous - 익명 여부.
 * @property {string} title - 게시글 제목.
 * @property {string} content - 게시글 내용.
 * @property {string} created_at - 게시글 생성 시간.
 * @property {string} updated_at - 게시글 마지막 업데이트 시간.
 * @property {number} view_count - 조회수.
 * @property {number} likes - 좋아요 수.
 * @property {any[]} comments - 댓글 목록 (CommentSerializer에 따라 타입 조정 필요).
 */
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
const API_BASE_URL = 'http://10.0.2.2:8000/api'; // Django 백엔드 API 기본 URL

/**
 * @function PostListScreen
 * @description 특정 카테고리의 게시글 목록을 표시하는 화면 컴포넌트.
 * 게시글 상세 보기, 글 작성, 새로고침 기능을 제공합니다.
 * @param {PostListScreenProps} props - 컴포넌트 props.
 */
const PostListScreen: React.FC<PostListScreenProps> = ({ route, navigation }) => {
  const { categoryId, categoryName } = route.params;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  /**
   * @function fetchPosts
   * @description 게시글 목록을 불러오는 비동기 함수.
   * @returns {Promise<void>}
   */
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/posts/?category=${categoryId}`);
      setPosts(response.data);
    } catch (error) {
      // console.error('Error fetching posts:', error);
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

  /**
   * @function onRefresh
   * @description FlatList 새로고침 시 호출되는 함수.
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, [fetchPosts]);

  /**
   * @function renderPostItem
   * @description FlatList의 각 게시글 항목을 렌더링하는 함수.
   * @param {{ item: Post }} - 렌더링할 게시글 객체.
   * @returns {JSX.Element}
   */
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

export default PostListScreen;
