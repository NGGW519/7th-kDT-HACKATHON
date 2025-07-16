import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage 추가

// Define types for navigation
type RootStackParamList = {
  BoardScreen: undefined;
  PostListScreen: { categoryId: number; categoryName: string };
  PostDetailScreen: { postId: number };
  PostWriteScreen: { categoryId: number; categoryName: string };
};

type PostWriteScreenRouteProp = RouteProp<RootStackParamList, 'PostWriteScreen'>;
type PostWriteScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PostWriteScreen'>;

interface PostWriteScreenProps {
  route: PostWriteScreenRouteProp;
  navigation: PostWriteScreenNavigationProp;
}

const API_BASE_URL = 'http://10.0.2.2:8000/api'; // Replace with your Django backend URL

const PostWriteScreen: React.FC<PostWriteScreenProps> = ({ route, navigation }) => {
  const { categoryId, categoryName } = route.params;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = async () => {
    if (title.trim() === '' || content.trim() === '') {
      Alert.alert('입력 오류', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      const userToken = await AsyncStorage.getItem('userToken'); // 토큰 가져오기

      const response = await axios.post(`${API_BASE_URL}/posts/`, {
        category: categoryId,
        title,
        content,
        is_anonymous: isAnonymous,
      }, {
        headers: {
          Authorization: `Token ${userToken}` // Authorization 헤더 추가
        },
        // withCredentials: true, // 토큰 인증 시 필요 없음
      });

      if (response.status === 201) {
        Alert.alert('게시글 작성 완료', '게시글이 성공적으로 작성되었습니다.', [
          { text: '확인', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('작성 실패', '게시글 작성에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      // 백엔드에서 보낸 상세 오류 메시지 확인
      if (error.response && error.response.data) {
        console.error('Backend Error Details:', error.response.data);
        Alert.alert('오류 발생', `게시글 작성 중 오류가 발생했습니다: ${JSON.stringify(error.response.data)}`);
      } else {
        Alert.alert('오류 발생', '게시글 작성 중 알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{categoryName} 게시판 글 작성</Text>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <TextInput
          style={styles.input}
          placeholder="제목을 입력하세요"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.contentInput]}
          placeholder="내용을 입력하세요"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
        <View style={styles.anonymousContainer}>
          <Text style={styles.anonymousText}>익명으로 작성</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isAnonymous ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={setIsAnonymous}
            value={isAnonymous}
          />
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>작성 완료</Text>
        </TouchableOpacity>
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  scrollViewContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contentInput: {
    minHeight: 150,
  },
  anonymousContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  anonymousText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PostWriteScreen;

