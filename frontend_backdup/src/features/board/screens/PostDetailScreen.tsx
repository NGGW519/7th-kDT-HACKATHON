import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { styles } from './PostDetailScreen.styles';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage 추가
import Ionicons from 'react-native-vector-icons/Ionicons';

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
 * @typedef {RouteProp<RootStackParamList, 'PostDetailScreen'>} PostDetailScreenRouteProp
 * @description PostDetailScreen의 라우트 속성 타입 정의.
 */
type PostDetailScreenRouteProp = RouteProp<RootStackParamList, 'PostDetailScreen'>;
/**
 * @typedef {StackNavigationProp<RootStackParamList, 'PostDetailScreen'>} PostDetailScreenNavigationProp
 * @description PostDetailScreen의 내비게이션 속성 타입 정의.
 */
type PostDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PostDetailScreen'>;

/**
 * @interface PostDetailScreenProps
 * @description PostDetailScreen 컴포넌트의 props 타입을 정의합니다.
 * @property {PostDetailScreenRouteProp} route - 라우트 객체.
 * @property {PostDetailScreenNavigationProp} navigation - 내비게이션 객체.
 */
interface PostDetailScreenProps {
  route: PostDetailScreenRouteProp;
  navigation: PostDetailScreenNavigationProp;
}

/**
 * @interface Comment
 * @description 댓글 데이터 구조를 정의합니다.
 * @property {number} id - 댓글 ID.
 * @property {number} post - 댓글이 속한 게시글 ID.
 * @property {number | null} parent - 부모 댓글 ID (대댓글인 경우).
 * @property {{ id: number; name: string; email: string; }} user - 댓글 작성자 정보.
 * @property {boolean} is_anonymous - 익명 여부.
 * @property {string} content - 댓글 내용.
 * @property {string} created_at - 댓글 생성 시간.
 * @property {string} updated_at - 댓글 마지막 업데이트 시간.
 * @property {number} likes - 댓글 좋아요 수.
 * @property {Comment[]} [replies] - 대댓글 목록 (선택 사항).
 */
interface Comment {
  id: number;
  post: number;
  parent: number | null;
  user: { id: number; name: string; email: string; };
  is_anonymous: boolean;
  content: string;
  created_at: string;
  updated_at: string;
  likes: number;
  replies?: Comment[];
}

/**
 * @interface Post
 * @description 게시글 데이터 구조를 정의합니다.
 * @property {number} id - 게시글 ID.
 * @property {number} category - 게시글 카테고리 ID.
 * @property {{ id: number; name: string; email: string; }} user - 게시글 작성자 정보.
 * @property {boolean} is_anonymous - 익명 여부.
 * @property {string} title - 게시글 제목.
 * @property {string} content - 게시글 내용.
 * @property {string} created_at - 게시글 생성 시간.
 * @property {string} updated_at - 게시글 마지막 업데이트 시간.
 * @property {number} view_count - 조회수.
 * @property {number} likes - 좋아요 수.
 * @property {Comment[]} comments - 댓글 목록.
 */
interface Post {
  id: number;
  category: number;
  user: { id: number; name: string; email: string; }; // user 정보 추가
  is_anonymous: boolean;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  likes: number;
  comments: Comment[];
}

const API_BASE_URL = 'http://10.0.2.2:8000/api'; // Django 백엔드 API 기본 URL

/**
 * @function PostDetailScreen
 * @description 게시글의 상세 내용을 표시하고, 댓글 작성 및 좋아요 기능을 제공하는 화면 컴포넌트.
 * @param {PostDetailScreenProps} props - 컴포넌트 props.
 */
const PostDetailScreen: React.FC<PostDetailScreenProps> = ({ route, navigation }) => {
  const { postId } = route.params;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  /**
   * @function fetchPostDetail
   * @description 게시글 상세 정보를 불러오는 비동기 함수.
   * @returns {Promise<void>}
   */
  const fetchPostDetail = useCallback(async () => {
    try {
      setLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      const headers = userToken ? { Authorization: `Token ${userToken}` } : {};

      const response = await axios.get(`${API_BASE_URL}/posts/${postId}/`, {
        headers: headers,
      });
      setPost(response.data);
    } catch (error) {
      // console.error('Error fetching post detail:', error);
      Alert.alert('오류', '게시글을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useFocusEffect(
    useCallback(() => {
      fetchPostDetail();
    }, [fetchPostDetail])
  );

  /**
   * @function handleLikePost
   * @description 게시글에 좋아요를 처리하는 비동기 함수.
   * @returns {Promise<void>}
   */
  const handleLikePost = async () => {
    if (!post) return;
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const headers = userToken ? { Authorization: `Token ${userToken}` } : {};

      const response = await axios.post(`${API_BASE_URL}/posts/${post.id}/like/`, {}, {
        headers: headers,
      });

      // 백엔드에서 받은 likes_count로 상태 업데이트
      if (response.status === 201 || response.status === 200) {
        const { likes_count } = response.data;
        setPost(prevPost => prevPost ? { ...prevPost, likes: likes_count } : null);
        Alert.alert('성공', `좋아요 처리 완료. 현재 좋아요 수: ${likes_count}`);
      } else {
        Alert.alert('작성 실패', '좋아요 처리 실패했습니다.');
      }
    } catch (error) {
      // console.error('Error liking post:', error);
      Alert.alert('오류', '좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  /**
   * @function handleAddComment
   * @description 댓글 또는 대댓글을 추가하는 비동기 함수.
   * @param {number | null} [parentId=null] - 대댓글인 경우 부모 댓글 ID.
   * @returns {Promise<void>}
   */
  const handleAddComment = async (parentId: number | null = null) => {
    if (newCommentContent.trim() === '') {
      Alert.alert('입력 오류', '댓글 내용을 입력해주세요.');
      return;
    }
    if (!post) return;

    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const headers = userToken ? { Authorization: `Token ${userToken}` } : {};

      const response = await axios.post(`${API_BASE_URL}/comments/`, {
        post: post.id,
        parent: parentId,
        content: newCommentContent,
        is_anonymous: false, // 익명 댓글 여부는 UI에서 설정 가능하도록 확장 가능
      }, {
        headers: headers,
      });

      if (response.status === 201) {
        setNewCommentContent('');
        setReplyToCommentId(null);
        fetchPostDetail(); // 댓글 작성 후 게시글 상세 정보 새로고침
      } else {
        Alert.alert('작성 실패', '댓글 작성에 실패했습니다.');
      }
    } catch (error) {
      // console.error('Error adding comment:', error);
      Alert.alert('오류', '댓글 작성 중 오류가 발생했습니다.');
    }
  };

  /**
   * @function handleLikeComment
   * @description 댓글에 좋아요를 처리하는 비동기 함수.
   * @param {number} commentId - 좋아요를 누를 댓글 ID.
   * @returns {Promise<void>}
   */
  const handleLikeComment = async (commentId: number) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const headers = userToken ? { Authorization: `Token ${userToken}` } : {};

      const response = await axios.post(`${API_BASE_URL}/comments/${commentId}/like/`, {}, {
        headers: headers,
      });
      if (response.status === 201 || response.status === 204) {
        fetchPostDetail(); // 댓글 좋아요 후 게시글 상세 정보 새로고침
      }
    } catch (error) {
      // console.error('Error liking comment:', error);
      Alert.alert('오류', '댓글 좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  /**
   * @function renderComment
   * @description 단일 댓글을 렌더링하는 함수.
   * @param {Comment} comment - 렌더링할 댓글 객체.
   * @returns {JSX.Element}
   */
  const renderComment = (comment: Comment) => (
    <View key={comment.id} style={[styles.commentItem, comment.parent && styles.replyCommentItem]}>
      <Text style={styles.commentAuthor}>{comment.is_anonymous ? '익명' : comment.user ? comment.user.name : '알 수 없음'}</Text>
      <Text style={styles.commentDate}>{new Date(comment.created_at).toLocaleDateString()}</Text>
      <Text style={styles.commentContent}>{comment.content}</Text>
      <View style={styles.commentActions}>
        <TouchableOpacity onPress={() => handleLikeComment(comment.id)}>
          <Text style={styles.commentLikeButton}>좋아요: {comment.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setReplyToCommentId(comment.id)}>
          <Text style={styles.commentReplyButton}>답글</Text>
        </TouchableOpacity>
      </View>
      {replyToCommentId === comment.id && (
        <View style={styles.replyInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="답글을 입력하세요"
            value={newCommentContent}
            onChangeText={setNewCommentContent}
          />
          <TouchableOpacity style={styles.commentSubmitButton} onPress={() => handleAddComment(comment.id)}>
            <Text style={styles.commentSubmitButtonText}>작성</Text>
          </TouchableOpacity>
        </View>
      )}
      {comment.replies && comment.replies.map(reply => renderComment(reply))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>게시글을 불러오는 중...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <Text>게시글을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const topLevelComments = post.comments.filter(comment => comment.parent === null);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.postTitle}>{post.title}</Text>
        <View style={styles.postMeta}>
          <Text style={styles.postAuthor}>{post.is_anonymous ? '익명' : post.user ? post.user.name : '알 수 없음'}</Text>
          <Text style={styles.postDate}>{new Date(post.created_at).toLocaleDateString()}</Text>
          <Text>조회수: {post.view_count}</Text>
          <TouchableOpacity onPress={handleLikePost}>
            <Text style={styles.postLikeButton}>좋아요: {post.likes}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.postContent}>{post.content}</Text>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsHeader}>댓글</Text>
          <FlatList
            data={topLevelComments}
            renderItem={({ item }) => renderComment(item)}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            ListEmptyComponent={<Text style={styles.emptyCommentText}>아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</Text>}
          />

          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="댓글을 입력하세요"
              value={newCommentContent}
              onChangeText={setNewCommentContent}
            />
            <TouchableOpacity style={styles.commentSubmitButton} onPress={() => handleAddComment()}>
              <Text style={styles.commentSubmitButtonText}>작성</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};


export default PostDetailScreen;
