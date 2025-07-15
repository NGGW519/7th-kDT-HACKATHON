import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface Mission {
  id: string;
  title: string;
  description: string;
  status: 'new' | 'in-progress' | 'completed';
}

const MissionScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'new' | 'in-progress' | 'completed'>('new');
  const [missions, setMissions] = useState<Mission[]>([
    { id: '1', title: '새로운 미션 1', description: '이것은 새로운 미션 1입니다.', status: 'new' },
    { id: '2', title: '새로운 미션 2', description: '이것은 새로운 미션 2입니다.', status: 'new' },
    { id: '3', title: '새로운 미션 3', description: '이것은 새로운 미션 3입니다.', status: 'new' },
    { id: '4', title: '진행 중 미션 A', description: '이것은 진행 중인 미션 A입니다.', status: 'in-progress' },
    { id: '5', title: '완료된 미션 X', description: '이것은 완료된 미션 X입니다.', status: 'completed' },
  ]);

  const handleAcceptMission = (id: string) => {
    setMissions(prevMissions =>
      prevMissions.map(mission =>
        mission.id === id ? { ...mission, status: 'in-progress' } : mission
      )
    );
    setActiveTab('in-progress'); // 미션 수락 후 진행 중 미션 탭으로 이동
  };

  const handleCompleteMission = (id: string) => {
    setMissions(prevMissions =>
      prevMissions.map(mission =>
        mission.id === id ? { ...mission, status: 'completed' } : mission
      )
    );
    setActiveTab('completed'); // 미션 완료 후 완료된 미션 탭으로 이동
  };

  const renderMissionCard = (mission: Mission) => {
    const cardStyle = [styles.missionCard];
    let buttonText = '';
    let buttonAction = () => {};

    if (mission.status === 'new') {
      cardStyle.push(styles.newMissionCard);
      buttonText = '미션 수락';
      buttonAction = () => handleAcceptMission(mission.id);
    } else if (mission.status === 'in-progress') {
      cardStyle.push(styles.inProgressMissionCard);
      buttonText = '미션 완료';
      buttonAction = () => handleCompleteMission(mission.id);
    } else { // completed
      cardStyle.push(styles.completedMissionCard);
      buttonText = '완료됨';
      buttonAction = () => {}; // 완료된 미션은 버튼 비활성화
    }

    return (
      <View key={mission.id} style={cardStyle}>
        <Text style={styles.missionTitle}>{mission.title}</Text>
        <Text style={styles.missionDescription}>{mission.description}</Text>
        {mission.status !== 'completed' && (
          <TouchableOpacity style={styles.missionButton} onPress={buttonAction}>
            <Text style={styles.missionButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        )}
        {mission.status === 'completed' && (
          <Text style={styles.completedText}>미션 완료!</Text>
        )}
      </View>
    );
  };

  const filteredMissions = missions.filter(mission => mission.status === activeTab);

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'new' && styles.activeTab]}
          onPress={() => setActiveTab('new')}
        >
          <Text style={[styles.tabText, activeTab === 'new' && styles.activeTabText]}>신규 미션</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'in-progress' && styles.activeTab]}
          onPress={() => setActiveTab('in-progress')}
        >
          <Text style={[styles.tabText, activeTab === 'in-progress' && styles.activeTabText]}>진행 중인 미션</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>완료한 미션</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.missionList}>
        {filteredMissions.length > 0 ? (
          filteredMissions.map(renderMissionCard)
        ) : (
          <Text style={styles.noMissionText}>해당하는 미션이 없습니다.</Text>
        )}
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
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  activeTab: {
    backgroundColor: '#e0e0e0',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  activeTabText: {
    color: '#333',
  },
  missionList: {
    flex: 1,
    padding: 10,
  },
  missionCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newMissionCard: {
    backgroundColor: '#e6ffe6', // 새로운 미션: 밝은 녹색 계열
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  inProgressMissionCard: {
    backgroundColor: '#fff8e1', // 진행 중 미션: 밝은 노란색 계열
    borderColor: '#FFC107',
    borderWidth: 1,
  },
  completedMissionCard: {
    backgroundColor: '#f5f5f5', // 완료된 미션: 회색 계열
    borderColor: '#9E9E9E',
    borderWidth: 1,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  missionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  missionButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  missionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  completedText: {
    fontSize: 14,
    color: '#9E9E9E',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  noMissionText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
});

export default MissionScreen;
