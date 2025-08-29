import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import { getCurrentUser } from '../utils/storage';

const BoardScreen = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState(null);

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

  const boardCategories = [
    {
      key: 'request',
      title: '의뢰게시판',
      subtitle: '일과 도움을 구하는 공간',
      icon: '🔧',
      description: '집 수리, 농작물 수확, 컴퓨터 수리 등 다양한 의뢰를 올리고 찾는 공간입니다.',
      color: '#FF6B6B',
      recentPosts: 5,
    },
    {
      key: 'mentor',
      title: '멘토게시판',
      subtitle: '지식과 경험을 나누는 공간',
      icon: '🎓',
      description: '기술 멘토링, 사업 조언, 라이프스타일 가이드 등 멘토를 찾고 제공하는 공간입니다.',
      color: '#4ECDC4',
      recentPosts: 8,
    },
    {
      key: 'free',
      title: '자유게시판',
      subtitle: '자유롭게 이야기하는 공간',
      icon: '🕊️',
      description: '고향 일상, 맛집 추천, 추억 나누기 등 자유롭게 소통하는 공간입니다.',
      color: '#45B7D1',
      recentPosts: 12,
    },
  ];

  const handleBoardSelect = (boardType) => {
    switch (boardType) {
      case 'request':
        navigation.navigate('RequestBoard');
        break;
      case 'mentor':
        navigation.navigate('MentorBoard');
        break;
      case 'free':
        navigation.navigate('FreeBoard');
        break;
      default:
        break;
    }
  };

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
          <Text style={styles.headerTitle}>게시판</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>어떤 게시판을 이용하시겠어요?</Text>
          <Text style={styles.welcomeSubtitle}>
            귀향자 여러분의 필요에 맞는 게시판을 선택해주세요
          </Text>
        </View>

        {/* Board Categories */}
        <View style={styles.boardContainer}>
          {boardCategories.map((board) => (
            <TouchableOpacity
              key={board.key}
              style={[styles.boardCard, { borderLeftColor: board.color }]}
              onPress={() => handleBoardSelect(board.key)}
            >
              <View style={styles.boardHeader}>
                <View style={styles.boardIconContainer}>
                  <Text style={styles.boardIcon}>{board.icon}</Text>
                </View>
                <View style={styles.boardInfo}>
                  <Text style={styles.boardTitle}>{board.title}</Text>
                  <Text style={styles.boardSubtitle}>{board.subtitle}</Text>
                </View>
                <View style={styles.boardStats}>
                  <Text style={styles.recentPostsText}>최근 {board.recentPosts}개</Text>
                  <Text style={styles.arrowText}>›</Text>
                </View>
              </View>
              
              <Text style={styles.boardDescription}>{board.description}</Text>
              
              <View style={styles.boardFooter}>
                <View style={styles.categoryTags}>
                  {board.key === 'request' && (
                    <>
                      <Text style={styles.categoryTag}>🔧 수리</Text>
                      <Text style={styles.categoryTag}>🌾 농업</Text>
                      <Text style={styles.categoryTag}>💻 IT</Text>
                    </>
                  )}
                  {board.key === 'mentor' && (
                    <>
                      <Text style={styles.categoryTag}>🔧 기술</Text>
                      <Text style={styles.categoryTag}>💼 사업</Text>
                      <Text style={styles.categoryTag}>🏠 라이프</Text>
                    </>
                  )}
                  {board.key === 'free' && (
                    <>
                      <Text style={styles.categoryTag}>☀️ 일상</Text>
                      <Text style={styles.categoryTag}>🍽️ 맛집</Text>
                      <Text style={styles.categoryTag}>💭 추억</Text>
                    </>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 게시판 이용 팁</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• 의뢰게시판: 구체적인 예산과 위치를 명시해주세요</Text>
            <Text style={styles.tipItem}>• 멘토게시판: 경험과 시간당 요금을 명확히 해주세요</Text>
            <Text style={styles.tipItem}>• 자유게시판: 상호 존중하는 마음으로 소통해주세요</Text>
          </View>
        </View>
      </ScrollView>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  welcomeSection: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 10,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  boardContainer: {
    paddingHorizontal: 20,
  },
  boardCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  boardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  boardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  boardIcon: {
    fontSize: 24,
  },
  boardInfo: {
    flex: 1,
  },
  boardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  boardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  boardStats: {
    alignItems: 'flex-end',
  },
  recentPostsText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  arrowText: {
    fontSize: 18,
    color: '#6956E5',
    fontWeight: 'bold',
  },
  boardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  boardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
  },
  categoryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    fontSize: 12,
    color: '#6956E5',
    backgroundColor: '#F0F0FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tipsSection: {
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
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default BoardScreen;
