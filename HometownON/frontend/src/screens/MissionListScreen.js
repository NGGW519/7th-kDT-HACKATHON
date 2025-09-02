import React, { useState, useEffect, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import API_URL from '../config/apiConfig'; // API_URL import 추가
import { getCurrentUser } from '../utils/storage'; // getCurrentUser import 추가

const MissionListScreen = ({ navigation, route }) => {
  const [progressAnimation] = useState(new Animated.Value(0));
  const [userLevel, setUserLevel] = useState(5);
  const [totalExp, setTotalExp] = useState(1250);
  const [currentExp, setCurrentExp] = useState(750);
  
  // 레벨별 필요 경험치
  const expForNextLevel = 1000;
  const progressPercentage = (currentExp / expForNextLevel) * 100;
  const expNeeded = expForNextLevel - currentExp;

  const [missions, setMissions] = useState([]); // State for raw fetched missions
  const [missionTypesForDisplay, setMissionTypesForDisplay] = useState([]); // State for processed mission types
  const [totalCompletedMissions, setTotalCompletedMissions] = useState(0); // State for total completed missions
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Helper to process raw missions into missionTypes structure
  const processMissionsForDisplay = (rawMissions) => {
    const typesMap = {};

    rawMissions.forEach(mission => {
      const typeKey = mission.mission_type;
      if (!typesMap[typeKey]) {
        typesMap[typeKey] = {
          id: typeKey, // Use type as ID
          title: '', // Will map later
          description: '', // Will map later
          icon: '', // Will map later
          level: 1, // Placeholder
          color: '', // Will map later
          completed: 0, // Initialize completed
          total: 0, // Initialize total
          expReward: 0, // Placeholder
          progress: 0, // Initialize progress
        };
      }
      typesMap[typeKey].total += 1; // Count total missions of this type

      // If the mission is completed, increment the completed count for its type
      if (mission.status === 'completed') { // Assuming 'status' field exists in mission object
        typesMap[typeKey].completed += 1;
      }
    });

    // Map backend types to frontend display titles, icons, colors, and calculate progress
    const frontendMissionTypes = Object.values(typesMap).map(typeData => {
      let title = '';
      let description = '';
      let icon = '';
      let color = '';

      switch (typeData.id) {
        case 'exploration':
          title = '탐색형 미션';
          description = '새로운 장소를 탐험하고 발견하는 미션';
          icon = '🎲';
          color = '#FF6B6B';
          break;
        case 'bonding':
          title = '유대형 미션';
          description = '지역 주민과의 관계를 돈독히 하는 미션';
          icon = '🤝';
          color = '#4ECDC4';
          break;
        case 'career':
          title = '커리어형 미션';
          description = '새로운 기술과 경험을 쌓는 미션';
          icon = '💼';
          color = '#45B7D1';
          break;
        default:
          title = typeData.id; // Fallback
          description = '미션 설명';
          icon = '🎯';
          color = '#6956E5';
      }

      const progress = typeData.total > 0 ? (typeData.completed / typeData.total) * 100 : 0;

      return {
        ...typeData,
        title,
        description,
        icon,
        color,
        progress, // Set calculated progress
      };
    });

    return frontendMissionTypes;
  };

  const fetchMissions = useCallback(async () => {
    console.log(`[DEBUG] Fetching missions from: ${API_URL}/api/missions`);
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/missions`);
      console.log(`[DEBUG] Response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setMissions(data); // 원본 데이터 저장
      const processedMissions = processMissionsForDisplay(data); // 데이터 가공
      setMissionTypesForDisplay(processedMissions); // 화면 표시용 상태 업데이트

      // Calculate total completed missions
      const sumCompleted = processedMissions.reduce((sum, type) => sum + type.completed, 0);
      setTotalCompletedMissions(sumCompleted);

    } catch (error) {
      console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
      console.error('!!! FETCH FAILED - ERROR !!!');
      console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
      console.error(error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]); // API_URL을 의존성 배열에 추가

  

  // 진행률 애니메이션은 progressPercentage가 변경될 때만 실행
  

  useFocusEffect(
    useCallback(() => {
      fetchMissions();
    }, [fetchMissions])
  );

  // 진행률 애니메이션은 progressPercentage가 변경될 때만 실행
  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: progressPercentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progressPercentage]);

  const getMissionIcon = (missionType) => {
    switch (missionType) {
      case 'exploration': return '🎲';
      case 'bonding': return '🤝';
      case 'career': return '💼';
      default: return '🎯'; // Default icon
    }
  };

  const getMissionColor = (missionType) => {
    switch (missionType) {
      case 'exploration': return '#FF6B6B';
      case 'bonding': return '#4ECDC4';
      case 'career': return '#45B7D1';
      default: return '#6956E5'; // Default color
    }
  };

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

  const handleMissionSelect = (missionTypeData) => { // Renamed parameter for clarity
    const selectedMissionType = missionTypeData.id; // e.g., 'exploration'
    const missionsOfType = missions.filter(m => m.mission_type === selectedMissionType);
    navigation.navigate('MissionCardGame', { type: selectedMissionType, missions: missionsOfType });
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
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>획득 배지</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalCompletedMissions}</Text>
            <Text style={styles.statLabel}>완료 미션</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{missions.length}</Text>
            <Text style={styles.statLabel}>총 미션</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && <Text style={styles.loadingText}>미션 로딩 중...</Text>}
        {error && <Text style={styles.errorText}>미션 로드 실패: {error.message}</Text>}
        {!loading && !error && missionTypesForDisplay.length === 0 && (
          <Text style={styles.noMissionsText}>표시할 미션이 없습니다.</Text>
        )}
        {!loading && !error && missionTypesForDisplay.map((missionType) => (
          <TouchableOpacity
            key={missionType.id}
            style={[styles.missionCard, { borderLeftColor: missionType.color }]}
            onPress={() => handleMissionSelect(missionType)}
          >
            <View style={styles.missionHeader}>
              <View style={styles.missionInfo}>
                <Text style={styles.missionIcon}>{missionType.icon}</Text>
                <View style={styles.missionText}>
                  <Text style={styles.missionTitle}>{missionType.title}</Text>
                  <Text style={styles.missionDescription}>{missionType.description}</Text>
                  <View style={styles.missionProgress}>
                    <View style={styles.progressBarSmall}>
                      <View
                        style={[
                          styles.progressFillSmall,
                          { width: `${missionType.progress}%`, backgroundColor: missionType.color }
                        ]}
                      />
                    </View>
                    <Text style={styles.progressTextSmall}>
                      {missionType.completed}/{missionType.total} 완료 ({missionType.progress.toFixed(1)}%)
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.missionLevel}>
                <Text style={styles.levelText}>LV.{missionType.level}</Text>
                <Text style={styles.starsText}>{renderStars(missionType.level)}</Text>
                <View style={styles.expReward}>
                  <Text style={styles.expRewardText}>+{missionType.expReward} EXP</Text>
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
