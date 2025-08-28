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
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const MissionCardGameScreen = ({ navigation, route }) => {
  const { type } = route.params;
  const [completedMissions, setCompletedMissions] = useState([]);
    const [cards, setCards] = useState([
    {
      id: 5,
      title: '공원 산책하기',
      description: '지역 공원을 산책하며 자연을 느껴보세요',
      type: 'exploration',
      status: 'completed',
      image: require('../assets/images/mission2.png'),
      todayImage: require('../assets/images/mission1.png'),
      completedImage: require('../assets/images/mission_complete.png'),
    },
    {
      id: 1,
      title: '모교 방문하기',
      description: '초등학교를 방문하여 추억을 되새겨보세요',
      type: 'exploration',
      status: 'today', // locked, today, completed
      image: require('../assets/images/mission2.png'),
      todayImage: require('../assets/images/mission1.png'),
      completedImage: require('../assets/images/mission_complete.png'),
    },
    {
      id: 2,
      title: '시장 탐방하기',
      description: '지역 시장을 둘러보고 특산품을 찾아보세요',
      type: 'exploration',
      status: 'locked',
      image: require('../assets/images/mission2.png'),
      todayImage: require('../assets/images/mission1.png'),
      completedImage: require('../assets/images/mission_complete.png'),
    },
    {
      id: 3,
      title: '주민과 대화하기',
      description: '이웃과 인사를 나누고 대화를 시작해보세요',
      type: 'bonding',
      status: 'locked',
      image: require('../assets/images/mission2.png'),
      todayImage: require('../assets/images/mission1.png'),
      completedImage: require('../assets/images/mission_complete.png'),
    },
    {
      id: 4,
      title: '도서관 방문하기',
      description: '지역 도서관에서 책을 읽어보세요',
      type: 'career',
      status: 'locked',
      image: require('../assets/images/mission2.png'),
      todayImage: require('../assets/images/mission1.png'),
      completedImage: require('../assets/images/mission_complete.png'),
    },
    {
      id: 6,
      title: '전통시장 구경하기',
      description: '전통시장의 분위기를 느껴보세요',
      type: 'bonding',
      status: 'locked',
      image: require('../assets/images/mission2.png'),
      todayImage: require('../assets/images/mission1.png'),
      completedImage: require('../assets/images/mission_complete.png'),
    },
  ]);



  const getCardImage = (card) => {
    if (card.status === 'completed') {
      return card.completedImage;
    } else if (card.status === 'today') {
      return card.todayImage;
    } else {
      return card.image;
    }
  };

  const handleCardPress = (card) => {
    if (card.status === 'locked') {
      // 잠긴 카드는 선택할 수 없음
      return;
    }
    
    if (card.status === 'today') {
      // 오늘의 미션을 클릭하면 MissionDetailScreen으로 이동
      navigation.navigate('MissionDetail', { 
        type: card.type,
        cardId: card.id,
        isTodayMission: true 
      });
    } else if (card.status === 'completed') {
      // 완료된 미션은 아무런 반응 없음
      return;
    }
  };



  const renderCard = (card) => {
    const isLocked = card.status === 'locked';
    const isToday = card.status === 'today';
    const isCompleted = card.status === 'completed';

    return (
      <TouchableOpacity
        key={card.id}
        style={[
          styles.card,
          isLocked && styles.lockedCard,
        ]}
        onPress={() => handleCardPress(card)}
        disabled={isLocked || isCompleted}
      >
        <Image 
          source={getCardImage(card)} 
          style={styles.cardImage}
          resizeMode="cover"
        />
        
        {/* 카드 오버레이 */}
        <View style={styles.cardOverlay}>
          {isLocked && (
            <View style={styles.lockOverlay}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          )}
          
          {isCompleted && (
            <View style={styles.completedOverlay}>
              <Text style={styles.completedIcon}>✅</Text>
              <Text style={styles.completedText}>완료</Text>
            </View>
          )}
          
          {isToday && (
            <View style={styles.todayOverlay}>
              <Text style={styles.todayBadge}>오늘의 미션</Text>
            </View>
          )}
        </View>

        {/* 카드 정보 */}
        <View style={styles.cardInfo}>
          <Text style={[
            styles.cardTitle,
            isLocked && styles.lockedText
          ]}>
            {card.title}
          </Text>
          <Text style={[
            styles.cardDescription,
            isLocked && styles.lockedText
          ]}>
            {card.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
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
        <Text style={styles.headerTitle}>미션 카드</Text>
        <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 카드 그리드 */}
        <View style={styles.cardGrid}>
          {cards.map(renderCard)}
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',
  },

  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: (width - 60) / 2,
    height: 200,
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },

  lockedCard: {
    opacity: 0.6,
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 30,
  },
  completedOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  completedIcon: {
    fontSize: 14,
    color: '#FFF',
    marginRight: 4,
  },
  completedText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
  },
  todayOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  todayBadge: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
  },
  cardInfo: {
    padding: 15,
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  lockedText: {
    color: '#999',
  },

});

export default MissionCardGameScreen;
