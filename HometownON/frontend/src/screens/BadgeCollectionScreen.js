import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';

const BadgeCollectionScreen = ({ navigation }) => {
  const badges = [
    { id: '1', name: '첫 미션 완료', source: require('../assets/images/badge (1).png'), locked: false },
    { id: '2', name: '탐색의 시작', source: require('../assets/images/badge (2).png'), locked: false },
    { id: '3', name: '유대감 형성', source: require('../assets/images/badge (3).png'), locked: false },
    { id: '4', name: '커리어 성장', source: require('../assets/images/badge (4).png'), locked: false },
  ];

  // Add 20 dummy locked badges
  for (let i = 5; i <= 24; i++) {
    badges.push({
      id: String(i),
      name: '???',
      source: require('../assets/images/badge_gray.png'),
      locked: true,
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6956E5" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>배지 모아보기</Text>
        <View style={styles.headerRight} />
      </View>
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
          <View style={styles.badgeGrid}>
            {badges.map(badge => (
              <View key={badge.id} style={styles.badgeItem}>
                <Image 
                  source={badge.source} 
                  style={[styles.badgeImage, badge.locked && styles.lockedBadgeImage]} 
                  resizeMode="contain" 
                />
                <Text style={[styles.badgeName, badge.locked && styles.lockedBadgeName]}>{badge.name}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollViewContent: {
    flexGrow: 1,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeItem: {
    width: '48%', // Adjust for two per row with spacing
    marginBottom: 20, // Add vertical spacing
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  lockedBadgeImage: {
    opacity: 0.5,
    tintColor: 'gray', // Apply grayscale effect
  },
  lockedBadgeName: {
    color: '#999',
  },
});

export default BadgeCollectionScreen;
