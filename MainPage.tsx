import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MainDashboard() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
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

        {/* 인증 배지 */}
        <View style={styles.badgeBox}>
          <Text style={styles.sectionTitle}>현재 인증배지 현황</Text>
          <Text style={styles.smallText}>xx회까지 xx개 중 4개 남았습니다.</Text>
          <View style={styles.badgeRow}>
            {[...Array(10)].map((_, i) => (
              <Image key={i} source={{ uri: 'https://example.com/badge.png' }} style={styles.badge} />
            ))}
          </View>
        </View>

        {/* 활동현황 그래프 placeholder */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>활동현황 (오각형 그래프로 더 추가할 거 생각해보기)</Text>
          <Text style={styles.chartDate}>Aug 25–Sept 25</Text>
          <View style={styles.chartInfo}>
            <Text>나의 지역적응도: 62%</Text>
            <Text>미션 진행도: 27%</Text>
            <Text>나의 온도: ?%</Text>
          </View>
          <View style={styles.chartPlaceholder} />
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
    gap: 10,
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
  chartDate: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 8,
  },
  chartInfo: {
    gap: 4,
    marginBottom: 12,
  },
  chartPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#EEE',
    borderRadius: 100,
    alignSelf: 'center',
  },
});
