import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getCurrentUser } from '../utils/storage';

const ResidentMainScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('지역주민님');

  // 화면이 포커스될 때마다 사용자 정보 새로고침
  useFocusEffect(
    React.useCallback(() => {
      const loadUser = async () => {
        try {
          const currentUser = await getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            const userName = currentUser.name || '지역주민님';
            setUserName(userName);
          }
        } catch (error) {
          console.error('사용자 정보 로드 오류:', error);
        }
      };

      loadUser();
    }, [])
  );

  // 임시 데이터
  const recentRequests = [
    {
      id: 1,
      title: '집 수리 도움 요청',
      date: '2024.01.15',
      status: '진행중',
    },
    {
      id: 2,
      title: '농작물 수확 도움',
      date: '2024.01.10',
      status: '완료',
    },
    {
      id: 3,
      title: '컴퓨터 수리',
      date: '2024.01.05',
      status: '완료',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>고향으로 ON</Text>
            <Text style={styles.headerSubtitle}>{userName}님 환영합니다</Text>
          </View>
          <TouchableOpacity
            style={styles.myPageButton}
            onPress={() => navigation.navigate('ResidentMyPage')}
          >
            <Text style={styles.myPageIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Quick Access Button */}
        <TouchableOpacity
          style={styles.quickAccessButton}
          onPress={() => navigation.navigate('RequestBoard')}
        >
          <Text style={styles.quickAccessButtonText}>의뢰자 게시판 바로가기</Text>
        </TouchableOpacity>

        {/* Recent Requests Section */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>최근 의뢰내역</Text>
          
          {recentRequests.map((request) => (
            <View key={request.id} style={styles.requestItem}>
              <View style={styles.requestInfo}>
                <Text style={styles.requestTitle}>{request.title}</Text>
                <Text style={styles.requestDate}>{request.date}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                request.status === '완료' ? styles.statusCompleted : styles.statusInProgress,
              ]}>
                <Text style={styles.statusText}>{request.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('NewRequest')}
          >
            <Text style={styles.actionButtonText}>새 의뢰 등록</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('MyRequests')}
          >
            <Text style={styles.actionButtonText}>내 의뢰 관리</Text>
          </TouchableOpacity>
        </View>

        {/* MyPage Button */}
        <TouchableOpacity
          style={styles.myPageButtonLarge}
          onPress={() => navigation.navigate('ResidentMyPage')}
        >
          <Text style={styles.myPageButtonText}>마이페이지</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  myPageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1BEE7',
  },
  myPageIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9C27B0',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  quickAccessButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickAccessButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recentSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  requestInfo: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  requestDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusInProgress: {
    backgroundColor: '#FFF3E0',
  },
  statusCompleted: {
    backgroundColor: '#E8F5E8',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F3E5F5',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1BEE7',
  },
  actionButtonText: {
    color: '#9C27B0',
    fontSize: 16,
    fontWeight: '600',
  },
  myPageButtonLarge: {
    backgroundColor: '#9C27B0',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  myPageButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ResidentMainScreen;
