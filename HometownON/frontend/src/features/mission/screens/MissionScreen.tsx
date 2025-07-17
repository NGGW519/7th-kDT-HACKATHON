import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from './MissionScreen.styles';

/**
 * @interface Mission
 * @description 미션 데이터 구조를 정의합니다.
 * @property {string} id - 미션 ID.
 * @property {string} title - 미션 제목.
 * @property {string} description - 미션 설명.
 * @property {'new' | 'in-progress' | 'completed'} status - 미션 상태 (새로운 미션, 진행 중, 완료됨).
 */
interface Mission {
  id: string;
  title: string;
  description: string;
  status: 'new' | 'in-progress' | 'completed';
}

/**
 * @function MissionScreen
 * @description 미션 목록을 표시하고 미션 상태를 관리하는 화면 컴포넌트.
 * 신규, 진행 중, 완료된 미션을 탭으로 구분하여 보여줍니다.
 */
const MissionScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'new' | 'in-progress' | 'completed'>('new');
  const [missions, setMissions] = useState<Mission[]>([
    { id: '1', title: '새로운 미션 1', description: '이것은 새로운 미션 1입니다.', status: 'new' },
    { id: '2', title: '새로운 미션 2', description: '이것은 새로운 미션 2입니다.', status: 'new' },
    { id: '3', title: '새로운 미션 3', description: '이것은 새로운 미션 3입니다.', status: 'new' },
    { id: '4', title: '진행 중 미션 A', description: '이것은 진행 중인 미션 A입니다.', status: 'in-progress' },
    { id: '5', title: '완료된 미션 X', description: '이것은 완료된 미션 X입니다.', status: 'completed' },
  ]);

  /**
   * @function handleAcceptMission
   * @description 미션을 수락하고 상태를 'in-progress'로 변경합니다.
   * @param {string} id - 수락할 미션의 ID.
   */
  const handleAcceptMission = (id: string) => {
    setMissions(prevMissions =>
      prevMissions.map(mission =>
        mission.id === id ? { ...mission, status: 'in-progress' } : mission
      )
    );
    setActiveTab('in-progress'); // 미션 수락 후 진행 중 미션 탭으로 이동
  };

  /**
   * @function handleCompleteMission
   * @description 미션을 완료하고 상태를 'completed'로 변경합니다.
   * @param {string} id - 완료할 미션의 ID.
   */
  const handleCompleteMission = (id: string) => {
    setMissions(prevMissions =>
      prevMissions.map(mission =>
        mission.id === id ? { ...mission, status: 'completed' } : mission
      )
    );
    setActiveTab('completed'); // 미션 완료 후 완료된 미션 탭으로 이동
  };

  /**
   * @function renderMissionCard
   * @description 단일 미션 카드를 렌더링하는 함수.
   * 미션 상태에 따라 다른 스타일과 버튼을 표시합니다.
   * @param {Mission} mission - 렌더링할 미션 객체.
   * @returns {JSX.Element}
   */
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


export default MissionScreen;
