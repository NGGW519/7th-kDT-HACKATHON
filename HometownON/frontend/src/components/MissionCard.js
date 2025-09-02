import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const MissionCard = ({ mission, onViewCompleted, onStartMission, onViewAll }) => {
  return (
    <View style={styles.container}>
              <View style={styles.header}>
          <Text style={styles.title}>오늘의 미션 현황</Text>
          <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
            <Text style={styles.viewAllText}>전체보기</Text>
          </TouchableOpacity>
        </View>
      
      <View style={styles.missionCard}>
        {/* Top Section - Character and Mission Text */}
        <View style={styles.topSection}>
          <View style={styles.characterContainer}>
            <Image 
              source={require('../assets/images/mission_assistant.png')}
              style={styles.character}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.missionTextContainer}>
            <Text style={styles.missionText}>
              {mission.userName}님,
              <Text style={styles.boldMission}>{mission.todayMission}</Text>
            </Text>
          </View>
        </View>

        {/* Divider Line */}
        <View style={styles.divider} />

        {/* Middle Section - Mission Stats */}
        <View style={styles.middleSection}>
          <View style={styles.statSection}>
            <Text style={styles.statTitle}>남은 미션 건수</Text>
            <View style={styles.statItems}>
              <Text style={styles.statItem}>탐색형: {mission.remaining.exploration}건</Text>
              <Text style={styles.statItem}>유대형: {mission.remaining.bonding}건</Text>
              <Text style={styles.statItem}>커리어형: {mission.remaining.career}건</Text>
            </View>
          </View>
          
          <View style={styles.statSection}>
            <Text style={styles.statTitle}>미션 완료한 건수</Text>
            <View style={styles.statItems}>
              <Text style={styles.statItem}>탐색형: {mission.completed.exploration}건</Text>
              <Text style={styles.statItem}>유대형: {mission.completed.bonding}건</Text>
              <Text style={styles.statItem}>커리어형: {mission.completed.career}건</Text>
            </View>
          </View>
        </View>

        {/* Divider Line */}
        <View style={styles.divider} />

        {/* Bottom Section - Action Buttons */}
        <View style={styles.bottomSection}>
          <TouchableOpacity 
            style={styles.completedButton}
            onPress={onViewCompleted}
          >
            <Text style={styles.completedButtonText}>완료한 미션 조회</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.startButton}
            onPress={onStartMission}
          >
            <Text style={styles.startButtonText}>미션 시작</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewAllText: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '600',
  },
  missionCard: {
    backgroundColor: '#FF9800',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 15,
  },
  characterContainer: {
    marginRight: 15,
  },
  character: {
    width: 100,
    height: 100,
  },
  missionTextContainer: {
    flex: 1,
  },
  missionText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
    marginBottom: 15,
    lineHeight: 22,
  },
  boldMission: {
    fontWeight: 'bold',
  },
  middleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  statSection: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    marginBottom: 5,
  },
  statItems: {
    marginLeft: 10,
  },
  statItem: {
    fontSize: 12,
    color: '#FFF',
    marginBottom: 2,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
  },
  completedButton: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  completedButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 5,
  },
  startButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MissionCard;
