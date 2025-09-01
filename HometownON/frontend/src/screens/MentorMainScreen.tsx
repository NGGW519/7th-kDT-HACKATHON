// src/screens/ReturneeMainScreen.tsx
import { useFocusEffect } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
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

const BASE_WIDTH = 390;
const { width: SCREEN_W } = Dimensions.get('window');
const S = SCREEN_W / BASE_WIDTH;
const px = (n: number) => Math.round(n * S);

type Lesson = {
  id: number;
  dateISO: string;
  title: string; // 예: "김민지 – 오리엔테이션"
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const pad = (n: number) => String(n).padStart(2, '0');
const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const getDaysInMonth = (y: number, m1to12: number) => new Date(y, m1to12, 0).getDate();

const formatHHmm = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const extractName = (title: string) => title.split('–')[0]?.split('-')[0]?.trim() || '수강생';

/** ====== 고정 높이 파라미터 (원하는 값으로 조절) ====== */
const GREEN_HEIGHT = px(520);      // 초록 상자 전체 높이
const CALENDAR_HEIGHT = px(320);   // 달력 영역 높이(흐린 흰 배경 박스)
const GRID_ROWS = 6;               // 보통 6줄 (42칸)
const CELL_HEIGHT = Math.floor((CALENDAR_HEIGHT - px(10) /*wrap padding*/
  - px(6) /*calHeader marginBottom*/
  - px(18) /*week header 대략 높이*/
  - px(36) /*selectedBox 상단 여백(구분선 위쪽)*/ ) / GRID_ROWS);

const MentorMainScreen = ({ navigation, route }: any) => {
  const [userName, setUserName] = useState('고향에왓고님');

  // 달력 상태
  const now = new Date();
  const [displayYear, setDisplayYear] = useState(now.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(now.getMonth() + 1);
  const [selectedKey, setSelectedKey] = useState<string>(toKey(now));

  // 수업 데이터(외부 주입 가능)
  const lessons: Lesson[] = useMemo(() => {
    const paramLessons = route?.params?.lessons as Lesson[] | undefined;
    if (paramLessons && Array.isArray(paramLessons)) return paramLessons;

    const t1 = new Date(); t1.setHours(14, 0, 0, 0);
    const t2 = new Date(); t2.setDate(t2.getDate() + 2); t2.setHours(10, 0, 0, 0);
    const t3 = new Date(); t3.setDate(t3.getDate() + 6); t3.setHours(19, 0, 0, 0);
    return [
      { id: 1, dateISO: t1.toISOString(), title: '김민지 – 오리엔테이션' },
      { id: 2, dateISO: t2.toISOString(), title: '박성호 – 2강 진행' },
      { id: 3, dateISO: t3.toISOString(), title: '이지현 – OT 완료' },
    ];
  }, [route?.params?.lessons]);

  // 날짜별 그룹
  const lessonsByDate = useMemo(() => {
    const map: Record<string, Lesson[]> = {};
    lessons.forEach(l => {
      const k = toKey(new Date(l.dateISO));
      (map[k] = map[k] || []).push(l);
    });
    return map;
  }, [lessons]);

  // 오늘 요약
  const todaySummary = useMemo(() => {
    const todayKey = toKey(new Date());
    const todays = (lessonsByDate[todayKey] || []).slice().sort(
      (a, b) => +new Date(a.dateISO) - +new Date(b.dateISO)
    );
    if (todays.length === 0) return '오늘 강의 일정이 없습니다.';
    const nowMs = Date.now();
    const upcoming = todays.find(l => +new Date(l.dateISO) >= nowMs) || todays[0];
    return `오늘 강의 일정은 ${extractName(upcoming.title)}님의 ${formatHHmm(upcoming.dateISO)}입니다!`;
  }, [lessonsByDate]);

  const currentDate = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const loadUser = async () => {
        try {
          const currentUser = await getCurrentUser();
          if (currentUser && currentUser.name) {
            setUserName(currentUser.name);
          }
        } catch (e) {
          console.error('사용자 정보 로드 오류:', e);
        }
      };
      loadUser();
    }, [])
  );

  // 달력 셀 구성
  const firstDay = new Date(displayYear, displayMonth - 1, 1);
  const firstWeekday = firstDay.getDay();
  const daysInThisMonth = getDaysInMonth(displayYear, displayMonth);

  const cells: Array<Date | null> = useMemo(() => {
    const arr: Array<Date | null> = [];
    for (let i = 0; i < firstWeekday; i++) arr.push(null);
    for (let d = 1; d <= daysInThisMonth; d++) {
      arr.push(new Date(displayYear, displayMonth - 1, d));
    }
    while (arr.length % 7 !== 0) arr.push(null);
    while (arr.length < 42) arr.push(null);
    return arr;
  }, [displayYear, displayMonth, firstWeekday, daysInThisMonth]);

  const gotoPrevMonth = () => {
    let y = displayYear, m = displayMonth - 1;
    if (m < 1) { m = 12; y -= 1; }
    setDisplayYear(y); setDisplayMonth(m);
  };
  const gotoNextMonth = () => {
    let y = displayYear, m = displayMonth + 1;
    if (m > 12) { m = 1; y += 1; }
    setDisplayYear(y); setDisplayMonth(m);
  };

  // 선택한 날짜의 레슨 목록
  const selectedLessons = useMemo(() => {
    const list = lessonsByDate[selectedKey] || [];
    return list.slice().sort((a, b) => +new Date(a.dateISO) - +new Date(b.dateISO));
  }, [lessonsByDate, selectedKey]);

  const selectedDateLabel = useMemo(() => {
    const [y, m, d] = selectedKey.split('-').map(Number);
    const dt = new Date(y, (m || 1) - 1, d || 1);
    return `${m}/${d}(${WEEKDAYS[dt.getDay()]})`;
  }, [selectedKey]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#6956E5" />
      <View style={styles.root}>
        {/* 상단 우측 알림 아이콘 */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Notification')}
          style={{ position: 'absolute', left: px(331.71), top: px(43.97) }}
        >
          <Image
            source={require('../assets/images/notification.png')}
            style={{ width: px(35.57), height: px(35.57), resizeMode: 'contain' }}
          />
        </TouchableOpacity>

        {/* 날짜/헤드라인 */}
        <Text style={[styles.date, { left: px(23), top: px(36.45) }]}>{currentDate}</Text>
        <Text style={[styles.headline, { left: px(22), top: px(72.6) }]}>
          고향에서의 오늘은{'\n'}어떤 하루일까요?
        </Text>

        {/* 상단 흰 바 */}
        <View style={[styles.topCard, { left: px(24), top: px(167.63), width: px(343), height: px(47.51) }]}>
          <View style={styles.topCardDot} />
          <Text style={styles.topCardName}>{userName}</Text>
        </View>

        {/* 하단 화이트 패널 */}
        <View style={[styles.whitePanel, { left: 0, right: 0, top: px(244.06), bottom: 0, borderTopLeftRadius: px(23), borderTopRightRadius: px(23) }]}>
          <ScrollView contentContainerStyle={styles.whiteInner} showsVerticalScrollIndicator={false}>
            {/* 섹션 헤더 */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>오늘의 게시판 현황</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Board')}>
                <Text style={styles.linkAll}>전체보기</Text>
              </TouchableOpacity>
            </View>

            {/* 초록 카드 */}
            <View style={[styles.greenFrame, { height: GREEN_HEIGHT }]}>
              <View style={styles.greenInner}>
                {/* 상단: 이미지 + 요약 문구 */}
                <View style={styles.topRow}>
                  <Image source={require('../assets/images/회원가입_멘토.png')} style={styles.heroImage} />
                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryTitle}>{todaySummary}</Text>
                  </View>
                </View>

                {/* 달력 (고정 높이) */}
                <View style={[styles.calendarWrap, { height: CALENDAR_HEIGHT + px(75) }]}>
                  <View style={styles.calHeader}>
                    <TouchableOpacity onPress={gotoPrevMonth} style={styles.navBtn}>
                      <Text style={styles.navTxt}>〈</Text>
                    </TouchableOpacity>
                    <Text style={styles.calTitle}>{displayYear}년 {displayMonth}월</Text>
                    <TouchableOpacity onPress={gotoNextMonth} style={styles.navBtn}>
                      <Text style={styles.navTxt}>〉</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.weekHeaderRow}>
                    {WEEKDAYS.map(w => (
                      <Text key={w} style={styles.weekHeaderText}>{w}</Text>
                    ))}
                  </View>

                  <View style={styles.grid}>
                    {cells.map((d, idx) => {
                      if (!d) return <View key={`e-${idx}`} style={[styles.cell, { height: CELL_HEIGHT }]} />;
                      const k = toKey(d);
                      const isSelected = k === selectedKey;
                      const has = !!lessonsByDate[k];
                      const isToday = k === toKey(new Date());

                      return (
                        <TouchableOpacity
                          key={k}
                          style={[
                            styles.cell,
                            { height: CELL_HEIGHT },
                            isSelected && styles.cellOn,
                            isToday && !isSelected && styles.cellToday,
                          ]}
                          activeOpacity={0.8}
                          onPress={() => setSelectedKey(k)}
                        >
                          <Text style={[styles.cellTxt, isSelected && styles.cellTxtOn]}>
                            {d.getDate()}
                          </Text>
                          {has && <View style={styles.dot} />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* 선택 날짜 강의 */}
                  <View style={styles.selectedBox}>
                    <Text style={styles.selectedHeader}>{selectedDateLabel} 강의</Text>
                    {selectedLessons.length === 0 ? (
                      <Text style={styles.selectedEmpty}>등록된 강의가 없습니다.</Text>
                    ) : (
                      selectedLessons.map(l => (
                        <View key={l.id} style={styles.selectedItem}>
                          <Text style={styles.selectedTime}>{formatHHmm(l.dateISO)}</Text>
                          <Text style={styles.selectedTitle} numberOfLines={1}>{l.title}</Text>
                        </View>
                      ))
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* 마이메뉴 */}
            <Text style={styles.sectionTitle2}>마이메뉴</Text>
            <View style={styles.menuRow}>
              <TouchableOpacity onPress={() => navigation.navigate('NotificationScreen')} style={styles.menuCard}>
                  <Text style={styles.menuEmojiLg}>🔔</Text>
                <Text style={[styles.menuLabel, { marginTop: px(12) }]}>알림 확인하기</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('CourseEditorScreen')} style={styles.menuCard}>
                  <Text style={styles.menuEmojiMd}>📊</Text>
                <Text style={[styles.menuLabel, { marginTop: px(18) }]}>수업 목차 수정</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('MyStudentsScreen')} style={styles.menuCard}>
                  <Text style={styles.menuEmojiMd}>📋</Text>
                <Text style={[styles.menuLabel, { marginTop: px(16) }]}>수강생 리스트</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: px(120) }} />
          </ScrollView>
        </View>

        {/* 날씨 컴포넌트 */}
        <View style={{ position: 'absolute', left: px(240), top: px(132), width: px(120) }}>
          <WeatherInfo weather="맑음" temperature="20" airQuality="대기 최고" />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MentorMainScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#6956E5' },
  root: { flex: 1, backgroundColor: '#6956E5', borderRadius: px(32) },

  date: { position: 'absolute', color: '#FFFFFF', fontSize: px(14), fontWeight: '600' },
  headline: { position: 'absolute', color: '#FFFFFF', fontSize: px(24), fontWeight: '700', lineHeight: px(29) },

  topCard: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: px(15),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: px(12),
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 3, height: 4 } },
      android: { elevation: 6 },
    }),
  },
  topCardDot: { width: px(22), height: px(22), borderRadius: px(11), backgroundColor: '#EEE', marginRight: px(8) },
  topCardName: { fontSize: px(15), fontWeight: '600', color: '#000' },

  whitePanel: { position: 'absolute', backgroundColor: '#F6F6F6' },
  whiteInner: { paddingHorizontal: px(19), paddingTop: px(24) },

  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: px(10) },
  sectionTitle: { fontSize: px(17), fontWeight: '700', color: '#000' },
  linkAll: { fontSize: px(10), fontWeight: '800', color: '#000' },

  greenFrame: {
    backgroundColor: '#33A64A',
    borderRadius: px(26),
    overflow: 'hidden',
    padding: px(12),
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 4, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 4 },
    }),
  },

  greenInner: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: px(10), gap: px(10) },
  heroImage: { width: px(110), height: px(90), resizeMode: 'contain', borderRadius: px(10) },
  summaryBox: { flex: 1, borderRadius: px(12), paddingVertical: px(10), paddingHorizontal: px(12) },
  summaryTitle: { color: '#FFFFFF', fontSize: px(14), fontWeight: '800' },

  calendarWrap: {
    borderRadius: px(14),
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: px(10),
  },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: px(6) },
  calTitle: { color: '#fff', fontSize: px(14), fontWeight: '800' },
  navBtn: {
    width: px(32), height: px(32), borderRadius: px(8),
    backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center',
  },
  navTxt: { color: '#fff', fontSize: px(16), fontWeight: '800' },

  weekHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: px(4) },
  weekHeaderText: { width: `${100 / 7}%`, textAlign: 'center', color: '#E8F5E9', fontSize: px(10), fontWeight: '700' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 0 },
  cell: {
    width: `${100 / 7}%`,
    // aspectRatio 제거 → 고정 높이로 제어
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: px(10),
    marginVertical: px(1),
  },
  cellOn: { backgroundColor: 'rgba(255,255,255,0.22)' },
  cellToday: { borderWidth: 1.5, borderColor: '#FFF' },
  cellTxt: { color: '#fff', fontSize: px(12), fontWeight: '800' },
  cellTxtOn: { color: '#fff' },
  dot: { width: px(6), height: px(6), borderRadius: px(3), backgroundColor: '#FFD54F', marginTop: px(3) },

  selectedBox: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.18)', paddingTop: px(8) },
  selectedHeader: { color: '#FFFFFF', fontSize: px(13), fontWeight: '800', marginBottom: px(6) },
  selectedEmpty: { color: '#E8F5E9', fontSize: px(12) },
  selectedItem: { flexDirection: 'row', alignItems: 'center', gap: px(8), paddingVertical: px(4) },
  selectedTime: { color: '#FFF', fontSize: px(12), fontWeight: '800', width: px(48) },
  selectedTitle: { color: '#E0F2F1', fontSize: px(12), flexShrink: 1 },

  sectionTitle2: { marginTop: px(18), marginBottom: px(12), fontSize: px(17), fontWeight: '700', color: '#000' },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', gap: px(12) },
  menuCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: px(17),
    alignItems: 'center', justifyContent: 'flex-start', paddingTop: px(12), paddingBottom: px(12),
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 9, shadowOffset: { width: 3, height: 3 } },
      android: { elevation: 4 },
    }),
  },
  menuIconBox: { backgroundColor: '#EAEAF6', borderRadius: px(8), alignItems: 'center', justifyContent: 'center' },
  menuEmojiLg: { fontSize: px(30) },
  menuEmojiMd: { fontSize: px(30) },
  menuLabel: { fontSize: px(12), fontWeight: '600', color: '#000' },
});
