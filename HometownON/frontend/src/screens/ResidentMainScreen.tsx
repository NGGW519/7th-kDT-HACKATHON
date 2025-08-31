// src/screens/ResidentMainScreen.tsx
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

type Visit = {
  id: number;
  dateISO: string;     // 귀향자 방문·작업 시간
  title: string;       // 예: "전등 교체 (김민지 귀향자)"
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const pad = (n: number) => String(n).padStart(2, '0');
const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const getDaysInMonth = (y: number, m1to12: number) => new Date(y, m1to12, 0).getDate();
const formatHHmm = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** ====== 고정 높이/색상 ====== */
const PURPLE = '#9721A4';
const GREEN_HEIGHT = px(520);
const CALENDAR_HEIGHT = px(320);
const GRID_ROWS = 6;
const CELL_HEIGHT = Math.floor(
  (CALENDAR_HEIGHT - px(10) - px(6) - px(18) - px(36)) / GRID_ROWS
);

const ResidentMainScreen = ({ navigation, route }: any) => {
  const [userName, setUserName] = useState('이웃님');

  // 달력 상태
  const now = new Date();
  const [displayYear, setDisplayYear] = useState(now.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(now.getMonth() + 1);
  const [selectedKey, setSelectedKey] = useState<string>(toKey(now));

  // 방문(수락된 의뢰) 데이터 — 귀향자 기준
  const visits: Visit[] = useMemo(() => {
    const param = route?.params?.visits as Visit[] | undefined;
    if (param && Array.isArray(param)) return param;

    const t1 = new Date(); t1.setHours(15, 0, 0, 0);
    const t2 = new Date(); t2.setDate(t2.getDate() + 1); t2.setHours(10, 0, 0, 0);
    const t3 = new Date(); t3.setDate(t3.getDate() + 4); t3.setHours(19, 0, 0, 0);
    return [
      { id: 1, dateISO: t1.toISOString(), title: '전등 교체 (김민지 귀향자)' },
      { id: 2, dateISO: t2.toISOString(), title: '싱크대 수리 (박성호 귀향자)' },
      { id: 3, dateISO: t3.toISOString(), title: '가구 조립 (이지현 귀향자)' },
    ];
  }, [route?.params?.visits]);

  // 날짜별 그룹
  const visitsByDate = useMemo(() => {
    const map: Record<string, Visit[]> = {};
    visits.forEach(v => {
      const k = toKey(new Date(v.dateISO));
      (map[k] = map[k] || []).push(v);
    });
    return map;
  }, [visits]);

  // 오늘 '다음 방문'만 따로 뽑기 (강조 렌더링용)
  const nextVisitToday = useMemo(() => {
    const todayKey = toKey(new Date());
    const todays = (visitsByDate[todayKey] || [])
      .slice()
      .sort((a, b) => +new Date(a.dateISO) - +new Date(b.dateISO));
    if (todays.length === 0) return null;
    const nowMs = Date.now();
    return todays.find(v => +new Date(v.dateISO) >= nowMs) || todays[0];
  }, [visitsByDate]);

  const noVisitMsg = '오늘 예정된 방문이 없습니다. 도움이 필요하시면 의뢰를 등록해보세요!';

  const currentDate = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const loadUser = async () => {
        try {
          const currentUser = await getCurrentUser();
          if (currentUser?.name) setUserName(currentUser.name);
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

  // 선택 날짜 방문 목록
  const selectedVisits = useMemo(() => {
    const list = visitsByDate[selectedKey] || [];
    return list.slice().sort((a, b) => +new Date(a.dateISO) - +new Date(b.dateISO));
  }, [visitsByDate, selectedKey]);

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
          onPress={() => navigation.navigate('NotificationScreen')}
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
          오늘 필요한 도움,{'\n'}귀향자 이웃이 도와드려요
        </Text>

        {/* 상단 흰 바: 사용자 인사 */}
        <View style={[styles.topCard, { left: px(24), top: px(167.63), width: px(343), height: px(47.51) }]}>
          <View style={styles.topCardDot} />
          <Text style={styles.topCardName}>{userName}</Text>
        </View>

        {/* 하단 화이트 패널 */}
        <View
          style={[
            styles.whitePanel,
            { left: 0, right: 0, top: px(244.06), bottom: 0, borderTopLeftRadius: px(23), borderTopRightRadius: px(23) },
          ]}
        >
          <ScrollView contentContainerStyle={styles.whiteInner} showsVerticalScrollIndicator={false}>
            {/* 섹션 헤더 */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>오늘의 의뢰/방문 현황</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Jobs')}>
                <Text style={styles.linkAll}>전체보기</Text>
              </TouchableOpacity>
            </View>

            {/* 보라색 카드: 방문 일정 + 요약 */}
            <View style={[styles.greenFrame, { height: GREEN_HEIGHT }]}>
              <View style={styles.greenInner}>
                {/* 상단: 이미지 + 요약 문구 */}
                <View style={styles.topRow}>
                  <Image
                    source={require('../assets/images/회원가입_멘토.png')}
                    style={styles.heroImage}
                  />
                  <View style={styles.summaryBox}>
                    {nextVisitToday ? (
                      <Text style={styles.summaryTitle}>
                        오늘 <Text style={styles.summaryEmph}>{formatHHmm(nextVisitToday.dateISO)}</Text>
                        에 <Text style={styles.summaryEmph}>{nextVisitToday.title}</Text> 방문이 예정되어 있어요.
                      </Text>
                    ) : (
                      <Text style={styles.summaryTitle}>{noVisitMsg}</Text>
                    )}
                  </View>
                </View>

                {/* 달력(수락된 방문 일정 표시) */}
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
                    {(() => {
                      const todayKey = toKey(new Date());
                      return cells.map((d, idx) => {
                        if (!d) return <View key={`e-${idx}`} style={[styles.cell, { height: CELL_HEIGHT }]} />;
                        const k = toKey(d);
                        const isSelected = k === selectedKey;
                        const has = !!visitsByDate[k];
                        const isToday = k === todayKey;

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
                      });
                    })()}
                  </View>

                  {/* 선택 날짜 방문 목록 */}
                  <View style={styles.selectedBox}>
                    <Text style={styles.selectedHeader}>{selectedDateLabel} 방문/작업</Text>
                    {selectedVisits.length === 0 ? (
                      <Text style={styles.selectedEmpty}>예약된 방문이 없습니다.</Text>
                    ) : (
                      selectedVisits.map(v => (
                        <View key={v.id} style={styles.selectedItem}>
                          <Text style={styles.selectedTime}>{formatHHmm(v.dateISO)}</Text>
                          <Text style={styles.selectedTitle} numberOfLines={1}>{v.title}</Text>
                        </View>
                      ))
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* 빠른 메뉴 — 의뢰인 관점 */}
            <Text style={styles.sectionTitle2}>빠른 메뉴</Text>
            <View style={styles.menuRow}>
              {/* 의뢰 등록: 의뢰 게시판 글쓰기 화면으로 직진 */}
              <TouchableOpacity
                onPress={() => navigation.navigate('Board', { screen: 'FreeBoardWrite' })}
                style={styles.menuCard}
              >
                <Text style={styles.menuEmojiLg}>📝</Text>
                <Text style={[styles.menuLabel, { marginTop: px(12) }]}>의뢰 등록하기</Text>
              </TouchableOpacity>

              {/* 내 의뢰·채팅 */}
              <TouchableOpacity
                onPress={() => navigation.navigate('MyActiveRequestsScreen', { screen: 'MyActiveRequestsScreen' })}
                style={styles.menuCard}
              >
                <Text style={styles.menuEmojiMd}>💬</Text>
                <Text style={[styles.menuLabel, { marginTop: px(18) }]}>내 의뢰·채팅</Text>
              </TouchableOpacity>

              {/* 의뢰 모아보기 */}
              <TouchableOpacity
                onPress={() => navigation.navigate('MyAllRequestsScreen', { screen: 'MyAllRequestsScreen' })}
                style={styles.menuCard}
              >
                <Text style={styles.menuEmojiMd}>📚</Text>
                <Text style={[styles.menuLabel, { marginTop: px(16) }]}>의뢰 모아보기</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: px(120) }} />
          </ScrollView>
        </View>

        {/* 날씨 */}
        <View style={{ position: 'absolute', left: px(240), top: px(132), width: px(120) }}>
          <WeatherInfo weather="맑음" temperature="20" airQuality="대기 최고" />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ResidentMainScreen;

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
    backgroundColor: PURPLE, // 보라색 카드
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
  summaryEmph:  { color: '#FFFFFF', fontSize: px(16), fontWeight: '900' }, // ⬅️ 강조 스타일

  calendarWrap: { borderRadius: px(14), backgroundColor: 'rgba(255,255,255,0.12)', padding: px(10) },
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
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: px(10),
    marginVertical: px(1),
  },
  cellOn: { backgroundColor: 'rgba(255,255,255,0.22)' },
  cellToday: { borderWidth: 1.5, borderColor: '#FFF' },
  cellTxt: { color: '#fff', fontSize: px(12), fontWeight: '800' },
  cellTxtOn: { color: '#fff' },

  dot: { width: px(6), height: px(6), borderRadius: px(3), backgroundColor: "#FFD54F", marginTop: px(3) },

  selectedBox: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.18)', paddingTop: px(8) },
  selectedHeader: { color: '#FFFFFF', fontSize: px(13), fontWeight: '800', marginBottom: px(6) },
  selectedEmpty: { color: '#E8F5E9', fontSize: px(12) },
  selectedItem: { flexDirection: 'row', alignItems: 'center', gap: px(8), paddingVertical: px(4) },
  selectedTime: { color: '#FFF', fontSize: px(12), fontWeight: '800', width: px(68) },
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
  menuEmojiLg: { fontSize: px(30) },
  menuEmojiMd: { fontSize: px(30) },
  menuLabel: { fontSize: px(12), fontWeight: '600', color: '#000' },
});
