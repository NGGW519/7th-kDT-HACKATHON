import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RadarChart from '../components/RadarChart';


const totalBadges = 10;   // 화면에 띄울 인증 배지 전체 개수 정의
const completedBadges = 6;  // 달성한 배지 개수 정의

export default function MainDashboard({ route, navigation }) {
  // 👉 다른 페이지에서 전달된 scores (없으면 undefined)
  const passedScores = route?.params?.scores;

  // 👉 없을 때는 0~5 난수 생성
  const randomScores = useMemo(
    () => Array.from({ length: 5 }, () => Math.floor(Math.random() * 6)),
    [passedScores]           // 넘어온 값이 바뀔 때만 재계산
  );

  // ✅ 최초값: 넘어온 scores가 있으면 그것, 없으면 난수
  const [scores, setScores] = useState(passedScores ?? randomScores);

  // ✅ 새 scores가 route로 들어오면 바로 갱신
  useEffect(() => {
    if (passedScores) setScores(passedScores);
  }, [passedScores]);

  // 📌 (테스트용) 랜덤 값으로 직접 갈아끼우는 버튼
  const regenerate = () => {
    setScores(Array.from({ length: 5 }, () => Math.floor(Math.random() * 6)));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <StatusBar hidden />
        {/* 상단 인사 */}
        <View style={styles.header}>
          <Image source={{ uri: 'https://example.com/profile.png' }} style={styles.profileImage} />
          <View>
            <Text style={styles.welcomeText}>귀향자님 안녕하세요.</Text>
            <Text style={styles.subText}>현재 <Text style={{ fontWeight: 'bold' }}>Advanced Level</Text>입니다
            </Text>
          </View>
          <Image source={require('../images/advanced_level.png')} style={styles.levelBadge} />
        </View>

        {/* 레벨 안내
        <View style={styles.levelRow}>
          <Text style={styles.levelText}>
          귀향자님은 현재 <Text style={{ fontWeight: 'bold' }}>Advanced Level</Text>입니다.
          </Text>
          <Image
            source={require('../images/advanced_level.png')} 
            style={styles.levelImage}
            />
            </View> */}


        {/* AI 목표 제시 */}
        <View style={styles.aiCard}>
          <View style={styles.aiTitleRow}>
            <Text style={styles.aiTitle}>AI 목표제시</Text>
            <Image
            source={require('../images/free-icon-ai-assistant-14355209.png')} 
            style={styles.AiImage}
            />
           </View>
  
          <Text style={styles.aiContent}>
            Expert level까지 한번의 미션을 수행하시면 됩니다!{"\n"}
            의지 관련 미션이 적합해요. 멘토와 매칭해볼까요?
          </Text>
        </View>

        {/* 미션 추천 */}
        <View style={styles.missionBox}>
          <Image source={require('../images/mission_assistant.png')} style={styles.dogImage} />
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
            : require('../images/badge_gray.png')   // ✅ 확장자 포함
              } 
              style={styles.badge}/>
          ))}
        </View>

        {/* ---------- 활동 현황 ---------- */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>활동현황</Text>

          <View style={styles.chartRow}>
            {/* 텍스트 설명 */}
            <View style={styles.chartInfo}>
              <Text>나의 지역적응도: 62%</Text>
              <Text>미션 진행도: 27%</Text>
              <Text>나의 온도: ?%</Text>
            </View>

            {/* 레이더 차트 */}
            <View style={styles.chartWrapper}>
              <RadarChart scores={scores} />
            </View>
          </View>

          {/* 점수 실시간 반영 확인을 위함 */}
          {/* (테스트) 무작위 값 버튼 */}
          <TouchableOpacity onPress={regenerate} style={styles.testBtn}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>임의 점수 생성</Text>
          </TouchableOpacity>
        </View>
        
    
      </ScrollView>
    </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    marginTop:-20
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: -10
  },
  subText: {
    fontSize: 12,
    color: 'gray',
  },
  levelBadge: {
    width: 60,
    height: 60,
    marginLeft: 'auto',
     resizeMode: 'contain',
  },
  
  levelRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8, // spacing between text and image (React Native 0.71+)
  marginVertical: 8,
  flexWrap: 'wrap', // 길어지면 줄바꿈
  marginTop: 0,
  marginLeft: 20,
},

levelText: {
  fontSize: 14,
  flex: 1,               // 👈 텍스트가 남는 공간 모두 차지
},

levelImage: {
  width: 70,
  height: 70,
  marginRight: 20,     
},

AiImage : {
  width:20,
  height:20,
   resizeMode: 'contain',
},

  aiCard: {
    backgroundColor: '#f3f3f3',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
aiTitleRow: {
  flexDirection: 'row',      // 👉 텍스트 + 이미지 나란히
  alignItems: 'center',      // 👉 세로 가운데 정렬
  marginBottom: 8,           // 아래 텍스트와 간격
},

aiTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  marginRight: 8,            // 👉 이미지와 간격 조절
},

  aiContent: {
    fontSize: 13,
  },

  missionBox: {
  backgroundColor: '#F6D094',
  borderRadius: 12,
  padding: 12,
  marginTop: 12,
  flexDirection: 'row',
  alignItems: 'center',
  overflow: 'visible',       // ✅ 박스 밖 이미지 허용!
  position: 'relative',      // ✅ (안전하게 배치 기준)
},

  dogImage: {
  width: 180,                // ✅ 크기 키우기
  height: 180,
  marginLeft: -40,           // ✅ 아래쪽 튀어나오게
  marginTop: -24,            
  marginBottom: -40,        
  resizeMode: 'contain',     
},

  missionText: {
    fontWeight: 'bold',
    marginBottom: 4,
    marginRight: 12,
  },
  missionButton: {
    marginTop: 8,
    backgroundColor: '#FF9900',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  badgeBox: {
    marginTop: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  smallText: {
    fontSize: 12,
    color: 'gray',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  badge: {
    width: 30,
    height: 30,
  },
  chartSection: {
    marginTop: 24,
  },

  chartInfo: {
    gap: 4,
    justifyContent: 'center',
  
  },

  chartRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12, 
  marginTop: 24,
},

chartWrapper: {
  marginTop: -12, 
},

    testBtn: {
    marginTop: 12,
    alignSelf: 'flex-end',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
});
