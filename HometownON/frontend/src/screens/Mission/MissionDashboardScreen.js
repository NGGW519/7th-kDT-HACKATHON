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
import Svg, { Polygon, Circle, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

const MissionDashboardScreen = ({ navigation }) => {
  const [userStats, setUserStats] = useState({
    totalBadges: 12,
    totalMissions: 25,
    completedMissions: 18,
    currentStreak: 7,
    totalExp: 2450,
  });

  const [radarData, setRadarData] = useState({
    exploration: {
      지역적응도: 85,
      지식습득: 70,
      탐험정신: 90,
      호기심: 80,
      적극성: 75,
    },
    bonding: {
      관계친밀도: 88,
      소통능력: 82,
      신뢰도: 85,
      협력성: 78,
      공감능력: 90,
    },
    career: {
      전문성: 72,
      학습능력: 85,
      창의성: 78,
      문제해결: 80,
      성장의지: 88,
    },
  });

  const [selectedType, setSelectedType] = useState('exploration');

  const getTypeName = (type) => {
    switch (type) {
      case 'exploration': return '탐색형';
      case 'bonding': return '유대형';
      case 'career': return '커리어형';
      default: return '탐색형';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'exploration': return '#FF6B6B';
      case 'bonding': return '#4ECDC4';
      case 'career': return '#45B7D1';
      default: return '#FF6B6B';
    }
  };

  const renderRadarChart = (data, color) => {
    const centerX = width / 2 - 40;
    const centerY = 150;
    const radius = 100;
    
    const categories = Object.keys(data);
    const values = Object.values(data);
    
    const points = categories.map((category, index) => {
      const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
      const value = values[index] / 100;
      const x = centerX + radius * value * Math.cos(angle);
      const y = centerY + radius * value * Math.sin(angle);
      return { x, y, category, value: values[index] };
    });

    const polygonPoints = points.map(point => `${point.x},${point.y}`).join(' ');

    return (
      <View style={styles.radarContainer}>
        <Svg width={width - 80} height={300}>
          {/* 배경 원들 */}
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, index) => (
            <Circle
              key={index}
              cx={centerX}
              cy={centerY}
              r={radius * scale}
              stroke="#E0E0E0"
              strokeWidth="1"
              fill="none"
            />
          ))}
          
          {/* 중심점에서 각 카테고리로 선 그리기 */}
          {categories.map((category, index) => {
            const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            return (
              <Svg key={index}>
                <SvgText
                  x={centerX + (radius + 20) * Math.cos(angle)}
                  y={centerY + (radius + 20) * Math.sin(angle)}
                  fontSize="12"
                  fill="#666"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {category}
                </SvgText>
              </Svg>
            );
          })}
          
          {/* 데이터 폴리곤 */}
          <Polygon
            points={polygonPoints}
            fill={`${color}40`}
            stroke={color}
            strokeWidth="2"
          />
          
          {/* 데이터 포인트 */}
          {points.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={color}
            />
          ))}
        </Svg>
      </View>
    );
  };

  const renderBadgeSection = () => (
    <View style={styles.badgeSection}>
      <Text style={styles.sectionTitle}>🏆 배지 현황</Text>
      <View style={styles.badgeStats}>
        <View style={styles.badgeStat}>
          <Text style={styles.badgeNumber}>{userStats.totalBadges}</Text>
          <Text style={styles.badgeLabel}>획득 배지</Text>
        </View>
        <View style={styles.badgeStat}>
          <Text style={styles.badgeNumber}>{userStats.completedMissions}</Text>
          <Text style={styles.badgeLabel}>완료 미션</Text>
        </View>
        <View style={styles.badgeStat}>
          <Text style={styles.badgeNumber}>{userStats.currentStreak}</Text>
          <Text style={styles.badgeLabel}>연속 달성</Text>
        </View>
      </View>
    </View>
  );

  const renderMissionProgress = () => (
    <View style={styles.progressSection}>
      <Text style={styles.sectionTitle}>📊 미션 진행률</Text>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${(userStats.completedMissions / userStats.totalMissions) * 100}%` }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>
        {userStats.completedMissions} / {userStats.totalMissions} 완료
      </Text>
    </View>
  );

  const renderTypeSelector = () => (
    <View style={styles.typeSelector}>
      <Text style={styles.sectionTitle}>📈 능력치 분석</Text>
      <View style={styles.typeButtons}>
        {['exploration', 'bonding', 'career'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              selectedType === type && { backgroundColor: getTypeColor(type) }
            ]}
            onPress={() => setSelectedType(type)}
          >
            <Text style={[
              styles.typeButtonText,
              selectedType === type && { color: '#FFF' }
            ]}>
              {getTypeName(type)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderRecentActivity = () => (
    <View style={styles.activitySection}>
      <Text style={styles.sectionTitle}>🕒 최근 활동</Text>
      <View style={styles.activityList}>
        <View style={styles.activityItem}>
          <Text style={styles.activityIcon}>🎯</Text>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>모교 방문하기 완료</Text>
            <Text style={styles.activityTime}>2시간 전</Text>
          </View>
          <Text style={styles.activityExp}>+150 EXP</Text>
        </View>
        <View style={styles.activityItem}>
          <Text style={styles.activityIcon}>🤝</Text>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>주민과 대화하기 완료</Text>
            <Text style={styles.activityTime}>1일 전</Text>
          </View>
          <Text style={styles.activityExp}>+120 EXP</Text>
        </View>
        <View style={styles.activityItem}>
          <Text style={styles.activityIcon}>💼</Text>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>도서관 방문하기 완료</Text>
            <Text style={styles.activityTime}>2일 전</Text>
          </View>
          <Text style={styles.activityExp}>+100 EXP</Text>
        </View>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>미션 대시보드</Text>
        <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 배지 현황 */}
        {renderBadgeSection()}

        {/* 미션 진행률 */}
        {renderMissionProgress()}

        {/* 능력치 분석 */}
        {renderTypeSelector()}

        {/* 오각형 그래프 */}
        <View style={styles.radarSection}>
          <Text style={styles.radarTitle}>
            {getTypeName(selectedType)} 능력치
          </Text>
          {renderRadarChart(radarData[selectedType], getTypeColor(selectedType))}
        </View>

        {/* 최근 활동 */}
        {renderRecentActivity()}

        {/* 통계 요약 */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>📈 통계 요약</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{userStats.totalExp}</Text>
              <Text style={styles.summaryLabel}>총 경험치</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>85%</Text>
              <Text style={styles.summaryLabel}>평균 달성률</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>12</Text>
              <Text style={styles.summaryLabel}>이번 주 미션</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>3</Text>
              <Text style={styles.summaryLabel}>연속 달성일</Text>
            </View>
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
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  badgeSection: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  badgeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  badgeStat: {
    alignItems: 'center',
  },
  badgeNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6956E5',
    marginBottom: 5,
  },
  badgeLabel: {
    fontSize: 14,
    color: '#666',
  },
  progressSection: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6956E5',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  typeSelector: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  typeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  radarSection: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  radarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  radarContainer: {
    alignItems: 'center',
  },
  activitySection: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityList: {
    gap: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  activityExp: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6956E5',
  },
  summarySection: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 10,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6956E5',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
});

export default MissionDashboardScreen;
