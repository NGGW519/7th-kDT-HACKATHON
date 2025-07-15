import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface CategoryCardProps {
  title: string;
  onPress: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
  );
};

const BoardScreen: React.FC = () => {
  const handleCategoryPress = (category: string) => {
    console.log(`Category pressed: ${category}`);
    // TODO: Navigate to the list of posts for this category
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>게시판 카테고리</Text>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <CategoryCard title="자유 게시판" onPress={() => handleCategoryPress('자유 게시판')} />
        <CategoryCard title="만남/매칭 게시판" onPress={() => handleCategoryPress('만남/매칭 게시판')} />
        <CategoryCard title="정보 공유 게시판" onPress={() => handleCategoryPress('정보 공유 게시판')} />
        <CategoryCard title="질문 답변 게시판" onPress={() => handleCategoryPress('질문 답변 게시판')} />
        <CategoryCard title="건의사항 / 버그 제보" onPress={() => handleCategoryPress('건의사항 / 버그 제보')} />
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
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    width: '90%',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#555',
  },
});

export default BoardScreen;
