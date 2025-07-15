import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define types for navigation
type RootStackParamList = {
  Board: undefined;
  PostList: { category: string };
  PostDetail: { postId: string };
  PostWrite: { category: string };
};

type PostListScreenRouteProp = RouteProp<RootStackParamList, 'PostList'>;
type PostListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PostList'>;

interface PostListScreenProps {
  route: PostListScreenRouteProp;
  navigation: PostListScreenNavigationProp;
}

interface Post {
  id: string;
  title: string;
  author: string;
  date: string;
  likes: number;
  comments: number;
}

const PostListScreen: React.FC<PostListScreenProps> = ({ route, navigation }) => {
  const { category } = route.params;

  // Dummy data for posts
  const [posts, setPosts] = useState<Post[]>([
    { id: '1', title: '첫 번째 게시글입니다.', author: '익명1', date: '2024-07-15', likes: 10, comments: 5 },
    { id: '2', title: '두 번째 게시글 제목', author: '사용자A', date: '2024-07-14', likes: 2, comments: 1 },
    { id: '3', title: '세 번째 게시글입니다.', author: '익명2', date: '2024-07-13', likes: 7, comments: 3 },
    { id: '4', title: '네 번째 게시글 제목', author: '사용자B', date: '2024-07-12', likes: 1, comments: 0 },
    { id: '5', title: '다섯 번째 게시글입니다.', author: '익명3', date: '2024-07-11', likes: 15, comments: 8 },
  ]);

  const renderPostItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postItem}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
    >
      <Text style={styles.postTitle}>{item.title}</Text>
      <View style={styles.postMeta}>
        <Text style={styles.postAuthor}>{item.author}</Text>
        <Text style={styles.postDate}>{item.date}</Text>
      </View>
      <View style={styles.postStats}>
        <Text>좋아요: {item.likes}</Text>
        <Text>댓글: {item.comments}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{category} 게시판</Text>
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postList}
      />
      <TouchableOpacity
        style={styles.writeButton}
        onPress={() => navigation.navigate('PostWrite', { category: category })}
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
});

export default PostListScreen;
