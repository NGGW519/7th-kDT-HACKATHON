import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';

const AchievementScreen = ({ navigation }) => {
  const achievementData = {
    totalRequests: 8,
    totalEarnings: 240000,
    hourlyRate: 30000,
    totalHours: 8,
    profession: '전기공',
    name: '함필규',
    completedRequests: [
      { id: 1, title: '가야읍 김씨댁 전기 수리', date: '2024.01.15', earnings: 30000 },
      { id: 2, title: '함안군 이씨댁 조명 설치', date: '2024.01.20', earnings: 30000 },
      { id: 3, title: '가야읍 박씨댁 콘센트 교체', date: '2024.01.25', earnings: 30000 },
      { id: 4, title: '함안군 최씨댁 전기 패널 점검', date: '2024.02.01', earnings: 30000 },
      { id: 5, title: '가야읍 정씨댁 전기 설비 설치', date: '2024.02.05', earnings: 30000 },
      { id: 6, title: '함안군 한씨댁 전기 고장 수리', date: '2024.02.10', earnings: 30000 },
      { id: 7, title: '가야읍 조씨댁 전기 안전 점검', date: '2024.02.15', earnings: 30000 },
      { id: 8, title: '함안군 윤씨댁 전기 설비 교체', date: '2024.02.20', earnings: 30000 },
    ],
    badges: [
      { id: 1, name: '첫 의뢰 완료', description: '첫 번째 의뢰를 성공적으로 완료', earned: true },
      { id: 2, name: '신뢰받는 기술자', description: '5건의 의뢰를 완료', earned: true },
      { id: 3, name: '전문가', description: '10건의 의뢰를 완료', earned: false },
      { id: 4, name: '마스터', description: '20건의 의뢰를 완료', earned: false },
    ]
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
          <Text style={styles.headerTitle}>업적</Text>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <Image 
              source={require('../assets/images/회원가입_귀향자.png')} 
              style={styles.profileImage}
              resizeMode="contain"
            />
            <View style={styles.profileText}>
              <Text style={styles.profileName}>{achievementData.name}님</Text>
              <Text style={styles.profession}>{achievementData.profession}</Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 의뢰 현황</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{achievementData.totalRequests}</Text>
              <Text style={styles.statLabel}>총 의뢰 건수</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{achievementData.totalHours}</Text>
              <Text style={styles.statLabel}>총 작업 시간</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{achievementData.hourlyRate.toLocaleString()}</Text>
              <Text style={styles.statLabel}>시간당 요금</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{achievementData.totalEarnings.toLocaleString()}</Text>
              <Text style={styles.statLabel}>총 수익</Text>
            </View>
          </View>
        </View>

        {/* Recent Requests */}
        <View style={styles.requestsSection}>
          <Text style={styles.sectionTitle}>📋 최근 의뢰 내역</Text>
          {achievementData.completedRequests.slice(-5).map((request) => (
            <View key={request.id} style={styles.requestItem}>
              <View style={styles.requestInfo}>
                <Text style={styles.requestTitle}>{request.title}</Text>
                <Text style={styles.requestDate}>{request.date}</Text>
              </View>
              <Text style={styles.requestEarnings}>+{request.earnings.toLocaleString()}원</Text>
            </View>
          ))}
        </View>

        {/* Badges Section */}
        <View style={styles.badgesSection}>
          <Text style={styles.sectionTitle}>🏆 획득 배지</Text>
          <View style={styles.badgesGrid}>
            {achievementData.badges.map((badge) => (
              <View key={badge.id} style={[styles.badgeCard, !badge.earned && styles.badgeLocked]}>
                <Text style={[styles.badgeIcon, !badge.earned && styles.badgeIconLocked]}>
                  {badge.earned ? '🏆' : '🔒'}
                </Text>
                <Text style={[styles.badgeName, !badge.earned && styles.badgeNameLocked]}>
                  {badge.name}
                </Text>
                <Text style={[styles.badgeDescription, !badge.earned && styles.badgeDescriptionLocked]}>
                  {badge.description}
                </Text>
              </View>
            ))}
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
    fontWeight: 'bold',
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
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  profileSection: {
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
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profession: {
    fontSize: 16,
    color: '#6956E5',
    fontWeight: '600',
  },
  statsSection: {
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6956E5',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  requestsSection: {
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
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  requestInfo: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: '#666',
  },
  requestEarnings: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  badgesSection: {
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
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6956E5',
  },
  badgeLocked: {
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  badgeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  badgeIconLocked: {
    opacity: 0.5,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: '#999',
  },
  badgeDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  badgeDescriptionLocked: {
    color: '#CCC',
  },
});

export default AchievementScreen;
