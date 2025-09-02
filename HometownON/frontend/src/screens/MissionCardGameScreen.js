import API_URL from '../config/apiConfig';
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
  const [cards, setCards] = useState([]); // Initialize as empty, will be populated by fetch
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch(`${API_URL}/api/missions`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Filter by type and map to frontend card structure
        const filteredAndMappedCards = data
          .filter(mission => {
            let backendMissionType = '';
            switch (type) {
              case '탐색': backendMissionType = 'exploration'; break;
              case '유대': backendMissionType = 'bonding'; break;
              case '커리어': backendMissionType = 'career'; break;
              default: backendMissionType = ''; // Should not happen if types are consistent
            }
            return mission.mission_type === backendMissionType;
          }) // Filter by mission_type
          .map((mission, index) => {
            // Simulate frontend statuses for now
            let status = 'locked'; // Default to locked
            if (index === 0) { // Make the first one 'today'
              status = 'today';
            } else if (mission.title === '공원 산책하기') { // Example: make a specific one 'completed'
              status = 'completed';
            }

            return {
              id: mission.id,
              title: mission.title,
              description: mission.description,
              type: mission.mission_type, // Use mission_type from backend
              status: status, // Use simulated status
              image: require('../assets/images/mission2.png'), // Placeholder
              todayImage: require('../assets/images/mission1.png'), // Placeholder
              completedImage: require('../assets/images/mission_complete.png'), // Placeholder
            };
          });
        setCards(filteredAndMappedCards);
      } catch (e) {
        setError(e);
        console.error("Failed to fetch cards:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [type]); // Re-fetch if type changes



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
        {loading && <Text style={styles.loadingText}>미션 로딩 중...</Text>}
        {error && <Text style={styles.errorText}>미션 로드 실패: {error.message}</Text>}
        {!loading && !error && cards.length === 0 && (
          <Text style={styles.noCardsText}>표시할 미션 카드가 없습니다.</Text>
        )}
        {!loading && !error && (
          <View style={styles.cardGrid}>
            {cards.map(renderCard)}
          </View>
        )}
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
