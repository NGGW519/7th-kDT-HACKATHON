import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
  Image,
} from 'react-native';

const MissionListScreen = ({ navigation, route }) => {
  const [progressAnimation] = useState(new Animated.Value(0));
  const [userLevel, setUserLevel] = useState(5);
  const [totalExp, setTotalExp] = useState(1250);
  const [currentExp, setCurrentExp] = useState(750);
  
  // 레벨별 필요 경험치
  const expForNextLevel = 1000;
  const progressPercentage = (currentExp / expForNextLevel) * 100;
  const expNeeded = expForNextLevel - currentExp;

  const missionTypes = [
    {
      id: 1,
      title: '탐색형 미션',
      description: '새로운 장소를 탐험하고 발견하는 미션',
      icon: '🎲',
      level: 3,
      color: '#FF6B6B',
      completed: 8,
      total: 12,
      expReward: 150,
      progress: 67,
    },
    {
      id: 2,
      title: '유대형 미션',
      description: '지역 주민과의 관계를 돈독히 하는 미션',
      icon: '🤝',
      level: 2,
      color: '#4ECDC4',
      completed: 5,
      total: 10,
      expReward: 120,
      progress: 50,
    },
    {
      id: 3,
      title: '커리어형 미션',
      description: '새로운 기술과 경험을 쌓는 미션',
      icon: '💼',
      level: 1,
      color: '#45B7D1',
      completed: 2,
      total: 8,
      expReward: 100,
      progress: 25,
    },
  ];

  useEffect(() => {
    // 진행률 애니메이션
    Animated.timing(progressAnimation, {
      toValue: progressPercentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progressPercentage]);

  const renderStars = (level) => {
    const stars = [];
    for (let i = 0; i < level; i++) {
      stars.push('⭐');
    }
    return stars.join('');
  };

  const getLevelTitle = (level) => {
    if (level >= 10) return '마스터';
    if (level >= 7) return '전문가';
    if (level >= 4) return '중급자';
    if (level >= 2) return '초급자';
    return '새내기';
  };

  const handleMissionSelect = (mission) => {
    navigation.navigate('MissionCardGame', { type: mission.title.toLowerCase().replace('형 미션', '') });
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
        <Text style={styles.headerTitle}>미션 현황</Text>
        <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      {/* Game Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.levelInfo}>
          <View style={styles.levelBadge}>
            <Image 
              source={require('../assets/images/advanced_level.png')}
              style={styles.levelImage}
              resizeMode="contain"
            />
            <Text style={styles.levelNumber}>LV.{userLevel}</Text>
            <Text style={styles.levelTitle}>{getLevelTitle(userLevel)}</Text>
          </View>
          <View style={styles.expInfo}>
            <Text style={styles.expText}>경험치: {currentExp} / {expForNextLevel}</Text>
            <Text style={styles.nextLevelText}>다음 레벨까지 {expNeeded} EXP 필요</Text>
          </View>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                { width: progressAnimation.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                })}
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{progressPercentage.toFixed(1)}%</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>획득 배지</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>15</Text>
            <Text style={styles.statLabel}>완료 미션</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>30</Text>
            <Text style={styles.statLabel}>총 미션</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {missionTypes.map((mission) => (
          <TouchableOpacity
            key={mission.id}
            style={[styles.missionCard, { borderLeftColor: mission.color }]}
            onPress={() => handleMissionSelect(mission)}
          >
            <View style={styles.missionHeader}>
              <View style={styles.missionInfo}>
                <Text style={styles.missionIcon}>{mission.icon}</Text>
                <View style={styles.missionText}>
                  <Text style={styles.missionTitle}>{mission.title}</Text>
                  <Text style={styles.missionDescription}>{mission.description}</Text>
                  <View style={styles.missionProgress}>
                    <View style={styles.progressBarSmall}>
                      <View 
                        style={[
                          styles.progressFillSmall, 
                          { width: `${mission.progress}%`, backgroundColor: mission.color }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressTextSmall}>
                      {mission.completed}/{mission.total} 완료 ({mission.progress}%)
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.missionLevel}>
                <Text style={styles.levelText}>LV.{mission.level}</Text>
                <Text style={styles.starsText}>{renderStars(mission.level)}</Text>
                <View style={styles.expReward}>
                  <Text style={styles.expRewardText}>+{mission.expReward} EXP</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  progressSection: {
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  levelBadge: {
    alignItems: 'center',
  },
  levelImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  levelNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6956E5',
  },
  levelTitle: {
    fontSize: 12,
    color: '#6956E5',
    marginTop: 2,
  },
  expInfo: {
    flex: 1,
    marginLeft: 15,
  },
  expText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  nextLevelText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  progressBarContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6956E5',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  missionCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  missionIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  missionText: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  missionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  missionProgress: {
    marginTop: 5,
  },
  progressBarSmall: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFillSmall: {
    height: '100%',
    borderRadius: 3,
  },
  progressTextSmall: {
    fontSize: 12,
    color: '#666',
  },
  missionLevel: {
    alignItems: 'center',
  },
  levelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6956E5',
    marginBottom: 5,
  },
  starsText: {
    fontSize: 12,
    marginBottom: 5,
  },
  expReward: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  expRewardText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default MissionListScreen;


