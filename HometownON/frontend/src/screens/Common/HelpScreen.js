import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';

const HelpScreen = ({ navigation }) => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const helpData = [
    {
      id: 'getting-started',
      title: '🚀 시작하기',
      content: `고향으로 ON에 오신 것을 환영합니다!

1. 회원가입 및 로그인
   - 귀향자, 지역주민, 멘토 중 선택하여 가입
   - 이메일과 비밀번호로 로그인

2. 프로필 설정
   - 개인정보 입력 및 프로필 사진 설정
   - 관심 분야 및 전문 분야 선택`,
    },
    {
      id: 'missions',
      title: '🎯 미션 시스템',
      content: `미션을 통해 고향에서의 새로운 경험을 만들어보세요!

1. 미션 종류
   • 탐색형 미션: 새로운 장소 탐방, 지역 명소 방문
   • 유대형 미션: 지역 주민과의 소통, 관계 형성
   • 커리어형 미션: 새로운 기술 습득, 경험 쌓기

2. 미션 진행 방법
   • 미션 카드에서 원하는 미션 선택
   • 미션 상세 정보 확인 및 시작
   • 미션 완료 후 인증 및 경험치 획득

3. 경험치 및 레벨
   • 미션 완료 시 경험치 획득
   • 레벨업 시 새로운 미션 해금
   • 배지 시스템으로 성취감 증대`,
    },
    {
      id: 'chatbot',
      title: '🤖 AI 챗봇',
      content: `고향이 AI 챗봇과 대화해보세요!

1. 챗봇 기능
   • 지역 정보 문의 (주민센터, 병원, 약국 등)
   • 미션 관련 도움말
   • 날씨 정보 제공
   • 일반적인 질문 답변

2. 사용 방법
   • 텍스트 입력으로 질문
   • 음성 입력 기능 (추후 구현)
   • 채팅 히스토리 저장

3. 대화 팁
   • 구체적인 질문을 하면 더 정확한 답변
   • "도움"이라고 입력하면 사용 가능한 기능 안내`,
    },
    {
      id: 'dashboard',
      title: '📊 대시보드',
      content: `나의 활동 현황을 한눈에 확인하세요!

1. 미션 대시보드
   • 완료한 미션 통계
   • 획득한 배지 현황
   • 능력치 분석 (오각형 그래프)
   • 최근 활동 내역

2. 업적 시스템
   • 의뢰 완료 건수 및 수익 현황
   • 획득한 배지 및 업적
   • 목표 달성률

3. 목표 설정
   • 개인 목표 설정 및 관리
   • 진행률 실시간 확인
   • 목표 수정 및 삭제`,
    },
    {
      id: 'community',
      title: '👥 커뮤니티',
      content: `지역 주민들과 소통하고 정보를 공유하세요!

1. 게시판 활용
   • 지역 소식 및 이벤트 정보
   • 의뢰 및 도움 요청
   • 경험담 및 후기 공유

2. 멘토링 시스템
   • 전문가 멘토와 연결
   • 1:1 상담 및 지도
   • 기술 전수 및 경험 공유

3. 지역 네트워킹
   • 같은 관심사를 가진 사람들과 연결
   • 지역 활동 참여
   • 새로운 인맥 형성`,
    },
    {
      id: 'settings',
      title: '⚙️ 설정 및 관리',
      content: `앱을 더 편리하게 사용하기 위한 설정들입니다!

1. 계정 관리
   • 회원정보 수정
   • 비밀번호 변경
   • 개인정보 설정

2. 앱 설정
   • 글씨 크기 조정
   • 알림 설정
   • 다크 모드
   • 자동 저장

3. 지원 및 문의
   • 앱 사용 문의
   • 버그 리포트
   • 기능 제안`,
    },
    {
      id: 'tips',
      title: '💡 사용 팁',
      content: `앱을 더 효과적으로 사용하는 팁들입니다!

1. 미션 완료 팁
   • 정기적으로 미션을 확인하세요
   • 다양한 종류의 미션에 도전해보세요
   • 완료한 미션의 후기를 남겨보세요

2. 커뮤니티 활용 팁
   • 게시판에 적극적으로 참여하세요
   • 다른 사용자들의 경험을 공유받으세요
   • 멘토와의 연결을 활용하세요

3. 챗봇 활용 팁
   • 자주 묻는 질문은 챗봇을 활용하세요
   • 구체적인 질문을 하면 더 정확한 답변을 받을 수 있어요
   • 챗봇과의 대화를 통해 새로운 정보를 발견해보세요`,
    },
  ];

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
          <Text style={styles.headerTitle}>도움말</Text>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Message */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>고향으로 ON 사용법</Text>
          <Text style={styles.welcomeText}>
            고향에서의 새로운 경험을 만들어가는 고향으로 ON 앱의 사용법을 안내해드립니다.
          </Text>
        </View>

        {/* Help Sections */}
        {helpData.map((section) => (
          <View key={section.id} style={styles.helpSection}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleSection(section.id)}
            >
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.expandIcon}>
                {expandedSections[section.id] ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>
            {expandedSections[section.id] && (
              <View style={styles.sectionContent}>
                <Text style={styles.sectionText}>{section.content}</Text>
              </View>
            )}
          </View>
        ))}

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>📞 추가 문의</Text>
          <Text style={styles.contactText}>
            더 자세한 도움이 필요하시면 언제든 문의해주세요!
          </Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactItem}>📧 이메일: support@hometownon.com</Text>
            <Text style={styles.contactItem}>📱 전화: 1588-1234</Text>
            <Text style={styles.contactItem}>🕒 운영시간: 평일 09:00-18:00</Text>
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
  welcomeSection: {
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
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
  helpSection: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  expandIcon: {
    fontSize: 16,
    color: '#6956E5',
    fontWeight: 'bold',
  },
  sectionContent: {
    padding: 20,
    paddingTop: 0,
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  contactSection: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  contactInfo: {
    gap: 8,
  },
  contactItem: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default HelpScreen;
