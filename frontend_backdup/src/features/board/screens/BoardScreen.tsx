import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { styles } from './BoardScreen.styles';

/**
 * @typedef {object} RootStackParamList
 * @property {undefined} BoardScreen - 게시판 메인 화면.
 * @property {{ categoryId: number; categoryName: string }} PostListScreen - 게시글 목록 화면.
 */
type RootStackParamList = {
  BoardScreen: undefined;
  PostListScreen: { categoryId: number; categoryName: string };
};

/**
 * @typedef {StackNavigationProp<RootStackParamList, 'BoardScreen'>} BoardScreenNavigationProp
 * @description BoardScreen의 내비게이션 속성 타입 정의.
 */
type BoardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BoardScreen'>;

/**
 * @interface CategoryCardProps
 * @description CategoryCard 컴포넌트의 props 타입을 정의합니다.
 * @property {string} title - 카테고리 제목.
 * @property {() => void} onPress - 카드 클릭 시 실행될 함수.
 */
interface CategoryCardProps {
  title: string;
  onPress: () => void;
}

/**
 * @function CategoryCard
 * @description 게시판 카테고리를 나타내는 카드 컴포넌트.
 * @param {CategoryCardProps} props - 컴포넌트 props.
 */
const CategoryCard: React.FC<CategoryCardProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
  );
};

const BoardScreen: React.FC = () => {
  const navigation = useNavigation<BoardScreenNavigationProp>();

  const handleCategoryPress = (categoryId: number, categoryName: string) => {
    navigation.navigate('PostListScreen', { categoryId, categoryName });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>게시판 카테고리</Text>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <CategoryCard title="자유 게시판" onPress={() => handleCategoryPress(1, '자유 게시판')} />
        <CategoryCard title="의뢰 게시판" onPress={() => handleCategoryPress(2, '의뢰 게시판')} />
        <CategoryCard title="정보 공유 게시판" onPress={() => handleCategoryPress(3, '정보 공유 게시판')} />
        <CategoryCard title="질문 답변 게시판" onPress={() => handleCategoryPress(4, '질문 답변 게시판')} />
        <CategoryCard title="건의사항 / 버그 제보" onPress={() => handleCategoryPress(5, '건의사항 / 버그 제보')} />
      </ScrollView>
    </View>
  );
};

export default BoardScreen;
