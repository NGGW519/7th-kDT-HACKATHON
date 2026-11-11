import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const MentorHelp = ({ navigation }) => {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const helpData = [
    {
      id: 'getting-started',
      title: '🚀 시작하기',
      content: `멘토님, 환영합니다!

1) 회원가입 및 로그인
   - 역할에서 '멘토' 선택 후 가입
   - 이메일/비밀번호 또는 Google 로그인

2) 프로필 설정
   - 멘토 이름, 멘토 유형(개인/교육기관)
   - 전문 분야, 경력, 자격 입력(마이페이지에서 수정 가능)`,
    },
    {
      id: 'education',
      title: '🎓 교육/멘토링 시작',
      content: `멘토링 활동을 시작하고 관리하세요.

1) 교육 현황
   • 하단 탭 '교육 현황'에서 진행 중/예정 활동 확인(앱 버전에 따라 홈과 통합될 수 있음)

2) 과정/세션 소개
   • 멘토 게시판에 커리큘럼, 모집 안내, 수업 계획을 게시
   • 대상, 일정, 준비물, 비용/조건을 명확히 기재

3) 참여자 관리
   • 문의는 게시글 댓글 또는 메신저로 응대
   • 일정/세부사항 확정은 메신저 기록으로 남기기`,
    },
    {
      id: 'board',
      title: '📢 멘토 게시판 & 커뮤니티',
      content: `전문 지식과 소식을 공유해요.

1) 멘토 게시판(MentorBoard)
   • 강의/멘토링 모집 공고, 후기/성과 공유
   • 참여 문의 대응

2) 자유/지역 게시판
   • 지역 소식, 행사, 팁 공유로 신뢰 형성`,
    },
    {
      id: 'messenger',
      title: '💬 메신저',
      content: `의뢰자/귀향자와 1:1로 조율하세요.

1) 접근 방법
   • 하단 탭 '메신저' → 대화방 리스트

2) 활용 팁
   • 일정, 장소(오프/온), 준비물, 과제, 비용 등을 구체적으로
   • 중요한 약속은 메시지로 남겨 기록 확보`,
    },
    {
      id: 'mypage',
      title: '👤 마이페이지',
      content: `멘토 정보를 관리하고 신뢰도를 높이세요.

1) 멘토 정보 수정
   • 멘토 이름/유형(개인·기관)
   • 전문 분야, 경력/자격, 추가 이력 기재

2) 설정/알림
   • 알림, 보안(비밀번호 변경), 개인정보 설정`,
    },
    {
      id: 'settings',
      title: '⚙️ 설정 & 지원',
      content: `앱을 더 편리하게 사용하는 방법입니다.

1) 계정 관리
   • 회원정보 수정, 비밀번호 변경, 개인정보 설정

2) 앱 설정
   • 알림/글씨 크기/다크 모드(지원 시)

3) 문의/지원
   • 버그/개선 제안/운영 문의`,
    },
    {
      id: 'tips',
      title: '💡 멘토 활동 팁',
      content: `더 많은 참여와 좋은 후기를 얻는 방법입니다.

1) 프로필 강화
   • 전문 분야/경력을 구체적으로, 성과/포트폴리오 첨부
   • 교육 방식(온라인/오프라인), 난이도/대상 명시

2) 게시글 작성
   • 커리큘럼/일정/준비물/비용 투명하게 안내
   • FAQ 형식으로 자주 묻는 질문 미리 답변

3) 소통/운영
   • 문의에 빠른 응대, 일정 변경 시 즉시 공지
   • 세션 종료 후 간단한 회고/자료 공유로 신뢰 형성`,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />

      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>도움말(멘토)</Text>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>멘토 사용 가이드</Text>
          <Text style={styles.welcomeText}>
            멘토링 모집부터 커뮤니케이션까지, 멘토를 위한 사용법을 안내해 드립니다.
          </Text>
        </View>

        {/* Sections */}
        {helpData.map((section) => (
          <View key={section.id} style={styles.helpSection}>
            <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection(section.id)}>
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

        {/* Contact */}
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
  container: { flex: 1, backgroundColor: '#4CAF50' },
  headerSafeArea: { backgroundColor: '#4CAF50' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#4CAF50',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 24, color: '#FFF', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', flex: 1, textAlign: 'center' },
  headerRight: { width: 40 },
  content: { flex: 1, backgroundColor: '#F8F9FA', padding: 20 },
  welcomeSection: {
    backgroundColor: '#FFF', borderRadius: 15, padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
    shadowRadius: 4, elevation: 3,
  },
  welcomeTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
  welcomeText: { fontSize: 14, color: '#666', lineHeight: 20, textAlign: 'center' },
  helpSection: {
    backgroundColor: '#FFF', borderRadius: 15, marginBottom: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
    shadowRadius: 4, elevation: 3, overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, backgroundColor: '#F8F9FA',
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1 },
  expandIcon: { fontSize: 16, color: '#4CAF50', fontWeight: 'bold' },
  sectionContent: { padding: 20, paddingTop: 0 },
  sectionText: { fontSize: 14, color: '#666', lineHeight: 22 },
  contactSection: {
    backgroundColor: '#FFF', borderRadius: 15, padding: 20, marginTop: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
    shadowRadius: 4, elevation: 3,
  },
  contactTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  contactText: { fontSize: 14, color: '#666', marginBottom: 15, lineHeight: 20 },
  contactInfo: { gap: 8 },
  contactItem: { fontSize: 14, color: '#333', lineHeight: 20 },
});

export default MentorHelp;
