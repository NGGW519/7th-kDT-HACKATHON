import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Alert } from 'react-native';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage 추가
import Ionicons from 'react-native-vector-icons/Ionicons';

// Define types for navigation
type RootStackParamList = {
  BoardScreen: undefined;
  PostListScreen: { categoryId: number; categoryName: string };
  PostDetailScreen: { postId: number };
  PostWriteScreen: { categoryId: number; categoryName: string };
};

type PostDetailScreenRouteProp = RouteProp<RootStackParamList, 'PostDetailScreen'>;
type PostDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PostDetailScreen'>;

interface PostDetailScreenProps {
  route: PostDetailScreenRouteProp;
  navigation: PostDetailScreenNavigationProp;
}

interface Comment {
  id: number;
  post: number;
  parent: number | null;
  user: { id: number; name: string; email: string; }; // user 정보 추가
  is_anonymous: boolean;
  content: string;
  created_at: string;
  updated_at: string;
  likes: number;
  replies?: Comment[];
}

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

const API_BASE_URL = 'http://10.0.2.2:8000/api'; // Replace with your Django backend URL

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

  const fetchPostDetail = useCallback(async () => {
    try {
      setLoading(true);
      const userToken = await AsyncStorage.getItem('userToken'); // 토큰 가져오기
      const headers = userToken ? { Authorization: `Token ${userToken}` } : {}; // 헤더 설정

      const response = await axios.get(`${API_BASE_URL}/posts/${postId}/`, {
        headers: headers, // 헤더 적용
        // withCredentials: true, // 토큰 인증 시 필요 없음
      });
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post detail:', error);
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

  const handleLikePost = async () => {
    if (!post) return;
    try {
      const userToken = await AsyncStorage.getItem('userToken'); // 토큰 가져오기
      const headers = userToken ? { Authorization: `Token ${userToken}` } : {}; // 헤더 설정

      const response = await axios.post(`${API_BASE_URL}/posts/${post.id}/like/`, {}, {
        headers: headers, // 헤더 적용
        // withCredentials: true, // 토큰 인증 시 필요 없음
      });

      // 백엔드에서 받은 likes_count로 상태 업데이트
      if (response.status === 201 || response.status === 200) { // <-- 이 부분 수정
        const { likes_count } = response.data; // likes_count 가져오기
        setPost(prevPost => prevPost ? { ...prevPost, likes: likes_count } : null);
        Alert.alert('성공', `좋아요 처리 완료. 현재 좋아요 수: ${likes_count}`); // 확인용 알림
      } else {
        Alert.alert('작성 실패', '좋아요 처리 실패했습니다.');
      }
    } catch (error) {
      console.error('Error liking post:', error);
      Alert.alert('오류', '좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  const handleAddComment = async (parentId: number | null = null) => {
    if (newCommentContent.trim() === '') {
      Alert.alert('입력 오류', '댓글 내용을 입력해주세요.');
      return;
    }
    if (!post) return;

    try {
      const userToken = await AsyncStorage.getItem('userToken'); // 토큰 가져오기
      const headers = userToken ? { Authorization: `Token ${userToken}` } : {}; // 헤더 설정

      const response = await axios.post(`${API_BASE_URL}/comments/`, {
        post: post.id,
        parent: parentId,
        content: newCommentContent,
        is_anonymous: false, // You might want to add a switch for this
      }, {
        headers: headers, // 헤더 적용
        // withCredentials: true, // 토큰 인증 시 필요 없음
      });

      if (response.status === 201) {
        setNewCommentContent('');
        setReplyToCommentId(null);
        fetchPostDetail(); // Refresh post details to get new comments
      } else {
        Alert.alert('작성 실패', '댓글 작성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('오류', '댓글 작성 중 오류가 발생했습니다.');
    }
  };

  const handleLikeComment = async (commentId: number) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken'); // 토큰 가져오기
      const headers = userToken ? { Authorization: `Token ${userToken}` } : {}; // 헤더 설정

      const response = await axios.post(`${API_BASE_URL}/comments/${commentId}/like/`, {}, {
        headers: headers, // 헤더 적용
        // withCredentials: true, // 토큰 인증 시 필요 없음
      });
      if (response.status === 201) {
        fetchPostDetail(); // Refresh to update comment likes
      } else if (response.status === 204) {
        fetchPostDetail(); // Refresh to update comment likes
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      Alert.alert('오류', '댓글 좋아요 처리 중 오류가 발생했습니다.');
    }
  };

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
  scrollViewContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  postTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  postAuthor: {
    fontSize: 14,
    color: '#666',
  },
  postDate: {
    fontSize: 14,
    color: '#666',
  },
  postLikeButton: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: 'bold',
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 20,
  },
  commentsSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  commentsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  commentItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  replyCommentItem: {
    marginLeft: 20,
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 3,
    borderLeftColor: '#ddd',
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  commentContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 10,
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
  },
  commentLikeButton: {
    fontSize: 13,
    color: '#007bff',
  },
  commentReplyButton: {
    fontSize: 13,
    color: '#28a745',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  commentInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  commentSubmitButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  commentSubmitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    paddingRight: 5,
  },
  emptyCommentText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: '#666',
  },
});

export default PostDetailScreen;
