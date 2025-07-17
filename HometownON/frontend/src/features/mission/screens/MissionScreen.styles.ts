import { StyleSheet } from 'react-native';

/**
 * @constant styles
 * @description MissionScreen 컴포넌트의 스타일 정의.
 */
export const styles = StyleSheet.create({
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