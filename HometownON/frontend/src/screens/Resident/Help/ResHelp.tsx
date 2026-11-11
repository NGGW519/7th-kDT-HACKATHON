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

const ResHelp = ({ navigation }) => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // 지역주민 흐름에 맞춘 콘텐츠
  const helpData = [
    {
      id: 'getting-started',
      title: '🚀 시작하기',
      content: `고향으로 ON에 오신 것을 환영합니다!

1) 회원가입 및 로그인
   - 역할에서 '지역주민' 선택 후 가입
   - 이메일/비밀번호 또는 Google 로그인

2) 프로필 설정
   - 이름, 거주 지역 입력
   - 관심 있는 의뢰 유형 선택(마이페이지에서 수정 가능)`,
    },
    {
      id: 'requests',
      title: '📝 의뢰 등록/관리',
      content: `지역의 도움 필요 사항을 의뢰로 올리고 진행 상황을 확인하세요.

1) 의뢰 등록
   • '의뢰자 게시판'에서 글 작성(의뢰 내용/예상 일정/요청 조건 등)
   • 사진/세부 정보를 추가하면 매칭에 도움이 됩니다

2) 진행 상황 확인
   • 하단 탭 '의뢰 현황'에서 상태 확인
   • 의뢰자가 달린 댓글/문의는 게시판 상세에서 확인

3) 수정/마감
   • 의뢰 내용 변경, 완료/마감 처리(필요 시)`,
    },
    {
      id: 'board',
      title: '📢 의뢰자 게시판 & 커뮤니티',
      content: `지역 이슈와 요청을 공유하세요.

1) 의뢰자 게시판(RequestBoard)
   • 새로운 의뢰 등록/수정
   • 의뢰별 댓글/피드백 확인

2) 자유 게시판(FreeBoard)
   • 지역 소식/후기 공유
   • 정보 교류 및 팁 공유`,
    },
    {
      id: 'messenger',
      title: '💬 메신저',
      content: `귀향자/멘토와 1:1로 빠르게 소통하세요.

1) 접근 방법
   • 하단 탭 '메신저' 선택 → 대화방 리스트

2) 활용 팁
   • 일정/비용/준비물 등 구체적으로 협의
   • 중요한 약속은 메시지로 남겨 기록 유지`,
    },
    {
      id: 'mypage',
      title: '👤 마이페이지',
      content: `내 정보를 확인/수정하고 앱을 내 스타일로 설정하세요.

1) 회원정보 수정
   • 이름, 거주 지역, 관심 의뢰 유형 등 변경

2) 설정
   • 알림/개인정보/비밀번호 변경
   • 앱 사용 도움말 확인`,
    },
    {
      id: 'settings',
      title: '⚙️ 설정 & 지원',
      content: `앱을 더 편리하게 사용하는 방법입니다.

1) 계정 관리
   • 회원정보 수정, 비밀번호 변경, 개인정보 설정

2) 앱 설정
   • 알림/글씨 크기/다크 모드(지원 시)

3) 문의
   • 사용 중 불편사항이나 버그는 문의로 전달`,
    },
    {
      id: 'tips',
      title: '💡 사용 팁',
      content: `더 효율적으로 의뢰/소통하는 방법입니다.

1) 의뢰 성공 팁
   • 제목과 상세 설명을 구체적으로 작성
   • 위치/일정/예산/요청 조건을 명확히 기재

2) 커뮤니티 활용
   • 비슷한 사례를 검색/참고
   • 후기/완료 보고를 남겨 신뢰 쌓기

3) 소통 팁
   • 메신저에서 빠르게 피드백
   • 중요한 내용은 게시글/메시지로 남겨 기록`,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#9C27B0" />

      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>도움말(지역주민)</Text>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>지역주민 사용 가이드</Text>
          <Text style={styles.welcomeText}>
            의뢰 등록부터 메신저 소통까지, 지역주민을 위한 사용법을 안내해 드립니다.
          </Text>
        </View>

        {/* Sections */}
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
  container: { flex: 1, backgroundColor: '#9C27B0' },
  headerSafeArea: { backgroundColor: '#9C27B0' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#9C27B0',
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
  expandIcon: { fontSize: 16, color: '#9C27B0', fontWeight: 'bold' },
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

export default ResHelp;
