import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage 추가
import { styles } from './PostWriteScreen.styles';

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
 * @typedef {RouteProp<RootStackParamList, 'PostWriteScreen'>} PostWriteScreenRouteProp
 * @description PostWriteScreen의 라우트 속성 타입 정의.
 */
type PostWriteScreenRouteProp = RouteProp<RootStackParamList, 'PostWriteScreen'>;
/**
 * @typedef {StackNavigationProp<RootStackParamList, 'PostWriteScreen'>} PostWriteScreenNavigationProp
 * @description PostWriteScreen의 내비게이션 속성 타입 정의.
 */
type PostWriteScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PostWriteScreen'>;

/**
 * @interface PostWriteScreenProps
 * @description PostWriteScreen 컴포넌트의 props 타입을 정의합니다.
 * @property {PostWriteScreenRouteProp} route - 라우트 객체.
 * @property {PostWriteScreenNavigationProp} navigation - 내비게이션 객체.
 */
interface PostWriteScreenProps {
  route: PostWriteScreenRouteProp;
  navigation: PostWriteScreenNavigationProp;
}

const API_BASE_URL = 'http://10.0.2.2:8000/api'; // Django 백엔드 API 기본 URL

/**
 * @function PostWriteScreen
 * @description 게시글을 작성하는 화면 컴포넌트.
 * 제목, 내용, 익명 여부를 입력받아 게시글을 생성합니다.
 * @param {PostWriteScreenProps} props - 컴포넌트 props.
 */
const PostWriteScreen: React.FC<PostWriteScreenProps> = ({ route, navigation }) => {
  const { categoryId, categoryName } = route.params;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  /**
   * @function handleSubmit
   * @description 게시글 작성 폼 제출 핸들러.
   * 입력된 제목과 내용을 바탕으로 새 게시글을 생성하고 백엔드에 전송합니다.
   * @returns {Promise<void>}
   */
  const handleSubmit = async () => {
    if (title.trim() === '' || content.trim() === '') {
      Alert.alert('입력 오류', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      const userToken = await AsyncStorage.getItem('userToken');

      const response = await axios.post(`${API_BASE_URL}/posts/`, {
        category: Number(categoryId),
        title,
        content,
        is_anonymous: isAnonymous,
      }, {
        headers: {
          Authorization: `Token ${userToken}`
        },
      });

      if (response.status === 201) {
        Alert.alert('게시글 작성 완료', '게시글이 성공적으로 작성되었습니다.', [
          { text: '확인', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('작성 실패', '게시글 작성에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      // console.error('Error creating post:', error);
      // 백엔드에서 보낸 상세 오류 메시지 확인
      if (error.response && error.response.data) {
        // console.error('Backend Error Details:', error.response.data);
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


export default PostWriteScreen;

