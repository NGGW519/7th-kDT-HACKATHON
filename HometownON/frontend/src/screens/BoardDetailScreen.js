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
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { getCurrentUser } from '../utils/storage';

const BoardDetailScreen = ({ navigation, route }) => {
  const { post } = route.params;
  const [currentUser, setCurrentUser] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      author: '김멘토',
      content: '저도 비슷한 경험이 있어요. 처음에는 어려웠지만 지역 주민분들과 소통하면서 점점 적응하게 되었습니다. 천천히 해보세요!',
      createdAt: '2024-01-15 14:30',
      isAuthor: false,
    },
    {
      id: 2,
      author: '박지역',
      content: '우리 동네에 귀향자 모임이 있어요. 함께 참여해보시는 건 어떨까요?',
      createdAt: '2024-01-15 15:20',
      isAuthor: false,
    },
    {
      id: 3,
      author: '이도시',
      content: '정말 공감됩니다. 저도 도시에서 고향으로 돌아온 지 1년이 되었는데, 아직도 적응 중이에요.',
      createdAt: '2024-01-15 16:15',
      isAuthor: false,
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

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleComment = () => {
    if (!commentText.trim()) {
      Alert.alert('알림', '댓글을 입력해주세요.');
      return;
    }

    const newComment = {
      id: comments.length + 1,
      author: currentUser?.returnName || currentUser?.name || '익명',
      content: commentText.trim(),
      createdAt: new Date().toLocaleString('ko-KR'),
      isAuthor: true,
    };

    setComments(prev => [newComment, ...prev]);
    setCommentText('');
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <View style={styles.commentAuthor}>
          <Image 
            source={require('../assets/images/회원가입_귀향자.png')}
            style={styles.commentAvatar}
            resizeMode="contain"
          />
          <Text style={styles.commentAuthorName}>{item.author}</Text>
          {item.isAuthor && <Text style={styles.authorBadge}>작성자</Text>}
        </View>
        <Text style={styles.commentDate}>{item.createdAt}</Text>
      </View>
      <Text style={styles.commentContent}>{item.content}</Text>
    </View>
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
          <Text style={styles.headerTitle}>게시글</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareIcon}>📤</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Post Content */}
        <View style={styles.postSection}>
          <View style={styles.postHeader}>
            <View style={styles.postInfo}>
              <Text style={styles.categoryTag}>
                {getCategoryIcon(post.category)} {getCategoryTitle(post.category)}
              </Text>
              {post.isNew && <Text style={styles.newTag}>NEW</Text>}
            </View>
            <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
          </View>
          
          <Text style={styles.postTitle}>{post.title}</Text>
          
          <View style={styles.authorInfo}>
            <Image 
              source={require('../assets/images/회원가입_귀향자.png')}
              style={styles.authorAvatar}
              resizeMode="contain"
            />
            <View style={styles.authorDetails}>
              <Text style={styles.authorName}>{post.author}</Text>
              <Text style={styles.authorType}>귀향자</Text>
            </View>
          </View>
          
          <Text style={styles.postContent}>{post.content}</Text>
          
          <View style={styles.postStats}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>👁️</Text>
              <Text style={styles.statText}>조회 {post.views}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>💬</Text>
              <Text style={styles.statText}>댓글 {comments.length}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={[styles.actionButton, isLiked && styles.actionButtonActive]}
            onPress={handleLike}
          >
            <Text style={styles.actionIcon}>👍</Text>
            <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
              좋아요 {likeCount}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>댓글</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionText}>공유</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>댓글 ({comments.length})</Text>
          
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <View style={styles.commentAuthor}>
                  <Image 
                    source={require('../assets/images/회원가입_귀향자.png')}
                    style={styles.commentAvatar}
                    resizeMode="contain"
                  />
                  <Text style={styles.commentAuthorName}>{comment.author}</Text>
                  {comment.isAuthor && <Text style={styles.authorBadge}>작성자</Text>}
                </View>
                <Text style={styles.commentDate}>{comment.createdAt}</Text>
              </View>
              <Text style={styles.commentContent}>{comment.content}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Comment Input */}
      <View style={styles.commentInputSection}>
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="댓글을 입력하세요..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.commentButton, !commentText.trim() && styles.commentButtonDisabled]}
            onPress={handleComment}
            disabled={!commentText.trim()}
          >
            <Text style={styles.commentButtonText}>등록</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  postSection: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 15,
    padding: 20,
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
    marginBottom: 15,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    lineHeight: 28,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  authorType: {
    fontSize: 12,
    color: '#6956E5',
    backgroundColor: '#F0F0FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  actionSection: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionButtonActive: {
    backgroundColor: '#F0F0FF',
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  actionTextActive: {
    color: '#6956E5',
  },
  commentsSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  commentItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAvatar: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  commentAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  authorBadge: {
    fontSize: 10,
    color: '#FFF',
    backgroundColor: '#6956E5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  commentInputSection: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 10,
  },
  commentButton: {
    backgroundColor: '#6956E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  commentButtonDisabled: {
    backgroundColor: '#CCC',
  },
  commentButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BoardDetailScreen;
