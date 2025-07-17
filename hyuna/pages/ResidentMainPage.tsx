import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MainScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 상단 인사말 */}
      <View style={styles.header}>
        {/* <Image source={require('./assets/profile.png')} style={styles.profileImg} /> */}
        <View>
          <Text style={styles.greeting}>지역주민님 안녕하세요.</Text>
          <Text style={styles.subGreeting}>Welcome to Buddy</Text>
        </View>
        <Text style={styles.menuIcon}>☰</Text>
      </View>

      <View style={styles.banner}>
      {/* 왼쪽: 텍스트 + 버튼 */}
        <View style={styles.bannerTextArea}>
          <Text style={styles.bannerTitle}>의뢰자 게시판</Text>
          <Text style={styles.bannerDesc}>의뢰하신 일에 대해 많은 전문가들이 관심을 가지고 있습니다!</Text>
          <TouchableOpacity style={styles.bannerButton}>
            <Text style={styles.buttonText}>바로가기</Text>
          </TouchableOpacity>
        </View>

      {/* 오른쪽: 강아지 이미지 */}
      <Image source={require('../images/미션추천_안내자.png')} style={styles.dogImg} /></View>


      {/* 과거 의뢰내역 */}
      <Text style={styles.historyTitle}>과거의뢰내역</Text>

      <View style={styles.card}>
        {/* <Image source={require('./assets/user1.png')} style={styles.avatar} /> */}
        <View style={styles.info}>
          <Text style={styles.name}>귀도 판 로썸</Text>
          <Text style={styles.detail}>Python 전문가</Text>
        </View>
        <Image source={require('../images/매칭성공_체크표시.png')} style={styles.statusIcon} />
        <Text style={styles.statusText}>매칭 완료</Text>
      </View>

      <View style={styles.card}>
        {/* <Image source={require('./assets/user2.png')} style={styles.avatar} /> */}
        <View style={styles.info}>
          <Text style={styles.name}>귀뚜라미</Text>
          <Text style={styles.detail}>보일러 수리공</Text>
        </View>
        <Image source={require('../images/매칭성공_체크표시.png')} style={styles.statusIcon} />
        <Text style={styles.statusText}>매칭 완료</Text>
      </View>

      <View style={styles.card}>
        {/* <Image source={require('./assets/user3.png')} style={styles.avatar} /> */}
        <View style={styles.info}>
          <Text style={styles.name}>우삐삐</Text>
          <Text style={styles.detail}>여행 가이드</Text>
        </View>
        <Image source={require('../images/매칭실패_x표시.png')} style={styles.statusIcon} />
        <Text style={[styles.statusText, { color: 'red' }]}>매칭 실패</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  profileImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  greeting: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subGreeting: {
    color: 'gray',
    fontSize: 12,
  },
  menuIcon: {
    fontSize: 24,
    color: '#666',
  },

  bannerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bannerDesc: {
    color: '#fff',
    marginTop: 8,
    marginBottom: 12,
  },
  bannerButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#000',
  },
  dogImg: {
  width: 180,                // ✅ 크기 키우기
  height: 180,
  marginRight: -40,           
  marginTop: -20,            
  marginBottom: -150,        
  resizeMode: 'contain',     
},

banner: {
  backgroundColor: '#7D4EFF',
  padding: 16,
  borderRadius: 12,
  marginBottom: 24,
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  overflow: 'visible',       // ✅ 박스 밖 이미지 허용!
  position: 'relative',      // ✅ (안전하게 배치 기준)
},

bannerTextArea: {
  flex: 1,
  paddingRight: 12,
},


  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  detail: {
    fontSize: 12,
    color: 'gray',
  },
  statusIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  statusText: {
    fontWeight: 'bold',
  },
});
