// src/screens/MentorMainScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import WeatherInfo from '../components/WeatherInfo';
import { getCurrentUser } from '../utils/storage';

/** ===== 멘토 전용 카드 (이 파일 안에 인라인 구현) ===== */
function MentorWorkCard({
  summaryText,
  counts,
  onViewAllRequests,
  onOpenTodaySchedule,
}: {
  summaryText: string;
  counts: {
    newRequests: number;
    todaySchedule: number;
    docRequests: number;
    followUps: number;
    reviews: number;
    payouts: number;
    todayRemain: number;
    doneTotal: number;
  };
  onViewAllRequests: () => void;
  onOpenTodaySchedule: () => void;
}) {
  return (
    <View style={styles.workCardWrap}>
      {/* 초록 배경 카드 */}
      <View style={styles.workCardBg} />

      {/* 본문 요약 */}
      <Text style={styles.workCardSummary}>{summaryText}</Text>

      {/* 좌/우 카테고리 라벨 */}
      <Text style={styles.workCatLeft1}>신규 신청</Text>
      <Text style={styles.workCatLeft2}>오늘 일정</Text>
      <Text style={styles.workCatLeft3}>자료 요청</Text>

      <Text style={styles.workCatRight1}>후속 연락</Text>
      <Text style={styles.workCatRight2}>평가서</Text>
      <Text style={styles.workCatRight3}>정산</Text>

      {/* 소제목 */}
      <Text style={styles.workSmallTitleLeft}>오늘 남은 일정</Text>
      <Text style={styles.workSmallTitleRight}>누적 멘토링</Text>

      {/* 수치들 (디자인 좌표 유지) */}
      <Text style={styles.workCountL1}>{`${counts.newRequests}건`}</Text>
      <Text style={styles.workCountL1Dup}>{`${counts.todaySchedule}건`}</Text>
      <Text style={styles.workCountL2}>{`${counts.docRequests}건`}</Text>
      <Text style={styles.workCountC}>{`${counts.followUps}건`}</Text>
      <Text style={styles.workCountR1}>{`${counts.reviews}건`}</Text>
      <Text style={styles.workCountR2}>{`${counts.payouts}건`}</Text>
      <Text style={styles.workCountRightTop}>{`${counts.doneTotal}건`}</Text>

      {/* 구분선 */}
      <View style={styles.workLineTop} />
      <View style={styles.workLineBottom} />

      {/* 버튼들 */}
      <TouchableOpacity style={styles.workBtnGhost} onPress={onViewAllRequests}>
        <Text style={styles.workBtnGhostText}>전체 신청 보기</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.workBtnPrimary} onPress={onOpenTodaySchedule}>
        <Text style={styles.workBtnPrimaryText}>오늘 일정 열기</Text>
      </TouchableOpacity>
    </View>
  );
}

/** ===== 멘토 전용 메뉴 (이 파일 안에 인라인 구현) ===== */
function MentorMenu({
  onInbox,
  onSchedule,
  onResources,
}: {
  onInbox: () => void;
  onSchedule: () => void;
  onResources: () => void;
}) {
  return (
    <View style={{ marginTop: 16, marginBottom: 28 }}>
      <Text style={styles.menuTitle}>멘토 메뉴</Text>

      {/* 3개의 메뉴 카드(좌표 유지) */}
      <TouchableOpacity style={styles.menuCard1} onPress={onInbox} />
      <TouchableOpacity style={styles.menuCard2} onPress={onSchedule} />
      <TouchableOpacity style={styles.menuCard3} onPress={onResources} />

      {/* 이미지 플레이스홀더 */}
      <View style={styles.menuImg1} />
      <View style={styles.menuImg2} />
      <View style={styles.menuImg3} />

      {/* 라벨 */}
      <Text style={styles.menuLabel1}>문의함/답장</Text>
      <Text style={styles.menuLabel2}>일정 관리</Text>
      <Text style={styles.menuLabel3}>멘토 자료실</Text>
    </View>
  );
}

const MentorMainScreen = ({ navigation }: any) => {
  const [currentDate, setCurrentDate] = useState('');
  const [userName, setUserName] = useState('멘토님');
  const dateText = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  }, []);

  // 멘토 업무 데이터 (실제에선 API 연동)
  const [workCounts, setWorkCounts] = useState({
    newRequests: 3,
    todaySchedule: 2,
    docRequests: 1,
    followUps: 5,
    reviews: 2,
    payouts: 0,
    todayRemain: 4,
    doneTotal: 23,
  });

  useEffect(() => {
    // 현재 날짜 업데이트(1분 주기)
    const updateDate = () => setCurrentDate(dateText);
    updateDate();
    const t = setInterval(updateDate, 60000);

    // 사용자 정보 로드
    const loadUser = async () => {
      try {
        const cu = await getCurrentUser();
        const name = cu?.name || '멘토님';
        setUserName(name);
      } catch (e) {
        console.error('사용자 정보 로드 오류:', e);
      }
    };
    loadUser();

    return () => clearInterval(t);
  }, [dateText]);

  // 네비게이션 핸들러들
  const handleViewAllRequests = () => navigation.navigate('MentorRequests'); // 전체 신청 보기
  const handleOpenTodaySchedule = () => navigation.navigate('MentorSchedule'); // 오늘 일정 열기
  const handleInbox = () => navigation.navigate('MentorInbox'); // 문의함/답장
  const handleResources = () => navigation.navigate('MentorResources'); // 자료실

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6956E5" />

      {/* ===== Header ===== */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.dateRow}>
            <Text style={styles.date}>{currentDate}</Text>
            <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Notifications')}>
              <Image
                source={require('../images/notification.png')}
                style={styles.notificationIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.greeting}>
            오늘의 멘토 일정과{'\n'}업무를 확인하세요
          </Text>

          <View style={styles.locationContainer}>
            <Text style={styles.location}>함안군 가야읍</Text>
            <WeatherInfo weather="맑음" temperature="20" airQuality="대기 최고" />
          </View>
        </View>
      </View>

      {/* ===== 사용자 플레이트 (상단 흰 박스) ===== */}
      <View style={styles.userInputSection}>
        <View style={styles.inputContainer}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>🛠️</Text>
          </View>
          <Text style={styles.userNameText}>{userName}</Text>
          <TouchableOpacity
            style={styles.accountSwitchButton}
            onPress={() => navigation.navigate('AccountSwitch')}
          >
            <Text style={styles.accountSwitchIcon}>👥</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ===== Scrollable Content (White Panel) ===== */}
      <View style={styles.scrollContainer}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 멘토 업무 카드 */}
          <View style={{ position: 'relative', minHeight: 320 }}>
            {/* 섹션 타이틀 / 전체보기 (디자인 동일 위치) */}
            <Text style={styles.sectionTitle}>멘토 업무 현황</Text>
            <TouchableOpacity onPress={handleViewAllRequests}>
              <Text style={styles.sectionAll}>전체보기</Text>
            </TouchableOpacity>

            <MentorWorkCard
              summaryText={`${userName}님, 오늘 처리할 주요 업무는\n신규 신청 검토 · 일정 확인 · 미응답 답장입니다.`}
              counts={workCounts}
              onViewAllRequests={handleViewAllRequests}
              onOpenTodaySchedule={handleOpenTodaySchedule}
            />
          </View>

          {/* 멘토 메뉴 */}
          <MentorMenu
            onInbox={handleInbox}
            onSchedule={handleOpenTodaySchedule}
            onResources={handleResources}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default MentorMainScreen;

/* ===== 스타일 (ReturneeMainScreen 구조를 최대한 유지) ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6956E5',
  },
  header: {
    backgroundColor: '#6956E5',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  date: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  greeting: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 15,
    lineHeight: 30,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  location: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
  notificationButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    width: 20,
    height: 20,
  },

  /* 상단 사용자 플레이트 (흰색 카드) */
  userInputSection: {
    paddingHorizontal: 20,
    paddingBottom: 5,
    marginTop: -15,
  },
  inputContainer: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: { marginRight: 12 },
  avatar: { fontSize: 24 },
  userNameText: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    paddingVertical: 0,
  },
  accountSwitchButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountSwitchIcon: { fontSize: 18 },

  /* 하단 스크롤 패널 */
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  /* 섹션 타이틀 & 전체보기 (원래 좌표감 유지) */
  sectionTitle: {
    position: 'absolute',
    left: 4, // padding 보정
    top: 0,
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  sectionAll: {
    position: 'absolute',
    right: 0,
    top: 2,
    fontSize: 12,
    fontWeight: '800',
    color: '#000',
  },

  /* ===== 멘토 업무 카드 좌표/스타일 (Figma 좌표 반영) ===== */
  workCardWrap: {
    marginTop: 28, // 섹션 타이틀 아래 여백
    height: 320,
  },
  workCardBg: {
    position: 'absolute',
    left: -1, // 살짝 보정
    top: 28,
    width: '102%',
    height: 303.67,
    backgroundColor: '#33A64A',
    borderRadius: 26,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  workCardSummary: {
    position: 'absolute',
    right: 0,
    top: 50,
    width: 176,
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 24,
  },

  // 라벨들 (좌측)
  workCatLeft1: { position: 'absolute', left: 16, top: 195, color: '#F3F3F3', fontSize: 10, fontWeight: '800', lineHeight: 24 },
  workCatLeft2: { position: 'absolute', left: 64, top: 195, color: '#F3F3F3', fontSize: 10, fontWeight: '800', lineHeight: 24 },
  workCatLeft3: { position: 'absolute', left: 114, top: 195, color: '#F3F3F3', fontSize: 10, fontWeight: '800', lineHeight: 24 },

  // 라벨들 (우측)
  workCatRight1: { position: 'absolute', left: 182, top: 195, color: '#F3F3F3', fontSize: 10, fontWeight: '800', lineHeight: 24 },
  workCatRight2: { position: 'absolute', left: 233, top: 195, color: '#F3F3F3', fontSize: 10, fontWeight: '800', lineHeight: 24 },
  workCatRight3: { position: 'absolute', left: 283, top: 195, color: '#F3F3F3', fontSize: 10, fontWeight: '800', lineHeight: 24 },

  // 소제목
  workSmallTitleLeft: { position: 'absolute', left: 60, top: 173, color: '#FFF', fontSize: 10, fontWeight: '800', lineHeight: 24 },
  workSmallTitleRight: { position: 'absolute', right: 24, top: 170, color: '#FFF', fontSize: 10, fontWeight: '800', lineHeight: 24 },

  // 수치
  workCountL1: { position: 'absolute', left: 20, top: 218, color: '#FFF', fontSize: 10, fontWeight: '500', lineHeight: 24, width: 24 },
  workCountL1Dup: { position: 'absolute', left: 70, top: 218, color: '#FFF', fontSize: 10, fontWeight: '500', lineHeight: 24, width: 24 },
  workCountL2: { position: 'absolute', left: 128, top: 220, color: '#FFF', fontSize: 10, fontWeight: '500', lineHeight: 24, width: 24 },
  workCountC: { position: 'absolute', left: 193, top: 220, color: '#FFF', fontSize: 10, fontWeight: '500', lineHeight: 24, width: 24 },
  workCountR1: { position: 'absolute', left: 246, top: 220, color: '#FFF', fontSize: 10, fontWeight: '500', lineHeight: 24, width: 24 },
  workCountR2: { position: 'absolute', left: 298, top: 220, color: '#FFF', fontSize: 10, fontWeight: '500', lineHeight: 24, width: 24 },
  workCountRightTop: { position: 'absolute', right: 24, top: 206, color: '#FFF', fontSize: 10, fontWeight: '500', lineHeight: 24, width: 32 },

  // 구분선
  workLineTop: { position: 'absolute', left: 16, top: 192, width: 324, borderTopWidth: 1, borderColor: '#CECECE' },
  workLineBottom: { position: 'absolute', left: 16, top: 236, width: 324, borderTopWidth: 1, borderColor: '#CECECE' },

  // 버튼
  workBtnGhost: {
    position: 'absolute',
    left: 36,
    top: 258,
    width: 122,
    height: 38.22,
    backgroundColor: 'rgba(255,255,255,0.52)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workBtnGhostText: { color: '#000', fontSize: 14, fontWeight: '800', lineHeight: 20 },
  workBtnPrimary: {
    position: 'absolute',
    right: 36,
    top: 258,
    width: 122,
    height: 38.22,
    backgroundColor: '#FFF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workBtnPrimaryText: { color: '#000', fontSize: 14, fontWeight: '800', lineHeight: 20 },

  /* ===== 멘토 메뉴 ===== */
  menuTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
    marginTop: 24,
    marginBottom: 10,
  },
  menuCard1: {
    position: 'absolute',
    left: 7,
    top: 36,
    width: 102,
    height: 110.52,
    backgroundColor: '#FFF',
    borderRadius: 17,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 9,
    elevation: 4,
  },
  menuCard2: {
    position: 'absolute',
    left: 126,
    top: 36,
    width: 102,
    height: 110.52,
    backgroundColor: '#FFF',
    borderRadius: 17,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 9,
    elevation: 4,
  },
  menuCard3: {
    position: 'absolute',
    left: 247,
    top: 36,
    width: 102,
    height: 110.52,
    backgroundColor: '#FFF',
    borderRadius: 17,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 9,
    elevation: 4,
  },
  menuImg1: { position: 'absolute', left: 27, top: 46, width: 66.06, height: 66.06, backgroundColor: '#EEE', borderRadius: 12 },
  menuImg2: { position: 'absolute', left: 153, top: 58, width: 41.67, height: 41.67, backgroundColor: '#EAEAF6', borderRadius: 8 },
  menuImg3: { position: 'absolute', left: 274, top: 58, width: 45.73, height: 45.73, backgroundColor: '#EAEAF6', borderRadius: 8 },
  menuLabel1: { position: 'absolute', left: 20, top: 124, fontSize: 12, fontWeight: '600', color: '#000' },
  menuLabel2: { position: 'absolute', left: 141, top: 126, width: 70, textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#000' },
  menuLabel3: { position: 'absolute', left: 257, top: 125, width: 81, textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#000' },
});
