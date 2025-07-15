import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RadarChart from '../components/RadarChart';

interface MainDashboardProps {
  route?: {
    params?: {
      scores?: number[];
    };
  };
  navigation?: any;
}

const totalBadges = 10;
const completedBadges = 6;

export default function MainDashboard({ route, navigation }: MainDashboardProps) {
  console.log('🔥 MainDashboard loaded 🔥');

  const passedScores = route?.params?.scores;

  const randomScores = useMemo(
    () => Array.from({ length: 5 }, () => Math.floor(Math.random() * 6)),
    [passedScores],
  );

  const [scores, setScores] = useState<number[]>(passedScores ?? randomScores);

  useEffect(() => {
    if (passedScores) setScores(passedScores);
  }, [passedScores]);

  const regenerate = () => {
    setScores(Array.from({ length: 5 }, () => Math.floor(Math.random() * 6)));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <StatusBar hidden />
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://example.com/profile.png' }}
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.welcomeText}>귀향자님 안녕하세요.</Text>
            <Text style={styles.subText}>
              현재 <Text style={{ fontWeight: 'bold' }}>Advanced Level</Text>입니다
            </Text>
          </View>
          <Image
            source={require('../images/advanced_level.png')}
            style={styles.levelBadge}
          />
        </View>

        <View style={styles.aiCard}>
          <View style={styles.aiTitleRow}>
            <Text style={styles.aiTitle}>AI 목표제시</Text>
            <Image
              source={require('../images/free-icon-ai-assistant-14355209.png')}
              style={styles.AiImage}
            />
          </View>

          <Text style={styles.aiContent}>
            Expert level까지 한번의 미션을 수행하시면 됩니다!{'\n'}
            의지 관련 미션이 적합해요. 멘토와 매칭해볼까요?
          </Text>
        </View>

        <View style={styles.missionBox}>
          <Image
            source={require('../images/mission_assistant.png')}
            style={styles.dogImage}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.missionText}>금일의 미션추천</Text>
            <Text>오늘은 주민센터와 함께하는 운동데이입니다!</Text>
            <TouchableOpacity style={styles.missionButton}>
              <Text style={styles.buttonText}>바로가기</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.badgeBox}>
          <Text style={styles.sectionTitle}>현재 인증배지 현황</Text>
          <Text style={styles.smallText}>xx회까지 xx개 중 4개 남았습니다.</Text>
        </View>
        <View style={styles.badgeRow}>
          {[...Array(totalBadges)].map((_, i) => (
            <Image
              key={i}
              source={
                i < completedBadges
                  ? require('../images/badge.png')
                  : require('../images/badge_gray.png')
              }
              style={styles.badge}
            />
          ))}
        </View>

        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>활동현황</Text>
          <View style={styles.chartRow}>
            <View style={styles.chartInfo}>
              <Text>나의 지역적응도: 62%</Text>
              <Text>미션 진행도: 27%</Text>
              <Text>나의 온도: ?%</Text>
            </View>

            <View style={styles.chartWrapper}>
              <RadarChart scores={scores} />
            </View>
          </View>

          <TouchableOpacity onPress={regenerate} style={styles.testBtn}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>임의 점수 생성</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -20,
  },
  profileImage: { width: 50, height: 50, borderRadius: 25 },
  welcomeText: { fontSize: 16, fontWeight: 'bold', marginTop: -10 },
  subText: { fontSize: 12, color: 'gray' },
  levelBadge: { width: 60, height: 60, marginLeft: 'auto', resizeMode: 'contain' },

  aiCard: {
    backgroundColor: '#f3f3f3',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiTitle: { fontSize: 16, fontWeight: 'bold', marginRight: 8 },
  AiImage: { width: 20, height: 20, resizeMode: 'contain' },
  aiContent: { fontSize: 13 },

  missionBox: {
    backgroundColor: '#F6D094',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'visible',
    position: 'relative',
  },
  dogImage: {
    width: 180,
    height: 180,
    marginLeft: -40,
    marginTop: -24,
    marginBottom: -40,
    resizeMode: 'contain',
  },
  missionText: { fontWeight: 'bold', marginBottom: 4, marginRight: 12 },
  missionButton: {
    marginTop: 8,
    backgroundColor: '#FF9900',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },

  badgeBox: { marginTop: 20 },
  sectionTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  smallText: { fontSize: 12, color: 'gray' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  badge: { width: 30, height: 30 },

  chartSection: { marginTop: 24 },
  chartInfo: { gap: 4, justifyContent: 'center' },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  chartWrapper: { marginTop: -12 },
  testBtn: {
    marginTop: 12,
    alignSelf: 'flex-end',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
});
