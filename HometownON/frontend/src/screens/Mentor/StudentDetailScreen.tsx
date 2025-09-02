// src/screens/StudentDetailScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

const PRIMARY = "#6956E5";
const BG = "#F7F7FA";
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/* ===================== Types ===================== */
type StatusType = "수업 예약됨" | "오리엔테이션 완료" | "1강 완료" | "2강 진행 중";

type ClassItem = {
  classId: number;
  student: { name: string; age: number };
  interest: string;
  schedule: string; // ISO
  status: StatusType;
  note?: string;
};

type Module = { title: string; subtopics: string[] };

/* ===================== Utils ===================== */
function enableLayoutAnimation() {
  if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}
const pad = (n: number) => String(n).padStart(2, "0");
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function formatKoreanDate(iso: string) {
  const d = new Date(iso);
  const day = WEEKDAYS[d.getDay()];
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${mm}/${dd}(${day}) ${hh}:${min}`;
}
function formatYMDLabel(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  return `${m}/${d}(${WEEKDAYS[date.getDay()]})`;
}
function toDateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function isoToDateKey(iso: string) {
  const d = new Date(iso);
  return toDateKey(d);
}
function getDaysInMonth(year: number, month1to12: number) {
  return new Date(year, month1to12, 0).getDate();
}

/* ===================== 기본 커리큘럼 (fallback) ===================== */
const DEFAULT_MODULES: Module[] = [
  { title: "1강 – 오리엔테이션 & 준비", subtopics: ["텃밭 가꾸기 개요", "필수 도구 소개", "장소 선정 요령", "토양 종류 간단 이해"] },
  { title: "2강 – 흙과 토양 다루기", subtopics: ["잡초 제거/흙 고르기", "퇴비·거름 기초", "토양 pH/비료", "화분 텃밭 응용"] },
  { title: "3강 – 씨앗과 모종 심기", subtopics: ["작물 추천", "파종 vs 정식", "간격/깊이", "정식 주의사항"] },
  { title: "4강 – 물주기와 관리", subtopics: ["물 주는 시기/횟수", "배수 문제", "멀칭", "병충해 기초"] },
  { title: "5강 – 성장 관리", subtopics: ["솎아내기/지주", "웃거름", "잎따기/가지치기", "기록장 쓰기"] },
  { title: "6강 – 수확과 활용", subtopics: ["수확 시기/방법", "보관·저장", "간단 요리", "경험 공유 & QnA"] },
];

/* ===================== Screen ===================== */
const StudentDetailScreen: React.FC<any> = ({ navigation, route }) => {
  useEffect(() => enableLayoutAnimation(), []);

  // ✅ CoursesScreen에서 전달한 목차 사용 (없으면 기본값)
  const syllabus: Module[] = useMemo(() => {
    return (
      (route?.params?.syllabus as Module[] | undefined) ||
      (route?.params?.modules as Module[] | undefined) ||
      DEFAULT_MODULES
    );
  }, [route?.params?.syllabus, route?.params?.modules]);

  // 세션 초기값
  const initialSessions: ClassItem[] = useMemo(() => {
    const s = (route?.params?.sessions as ClassItem[] | undefined) ?? [];
    const one = route?.params?.item as ClassItem | undefined;
    const list = s.length ? s : one ? [one] : [];
    return list.slice().sort((a, b) => +new Date(a.schedule) - +new Date(b.schedule));
  }, [route?.params]);

  const studentParam = route?.params?.student as { name: string; age: number } | undefined;
  const student = studentParam ?? initialSessions[0]?.student ?? { name: "이름 미상", age: 0 };

  const [sessions, setSessions] = useState<ClassItem[]>(initialSessions);
  const [memoText, setMemoText] = useState<string>(initialSessions[0]?.note ?? "");

  // 진행률 체크맵: "m-i" => boolean
  const initialCourseProgress = (route?.params?.courseProgress ?? {}) as Record<string, boolean>;
  const [progressMap, setProgressMap] = useState<Record<string, boolean>>(initialCourseProgress);
  const [expanded, setExpanded] = useState<number | null>(0);

  // ----- 최빈 요일 계산 (혹은 override) -----
  const primaryWeekdayIndex = useMemo(() => {
    const override = route?.params?.weekdayIndex as number | undefined;
    if (typeof override === "number" && override >= 0 && override <= 6) return override;

    if (!sessions.length) return undefined;
    const counts = Array(7).fill(0);
    sessions.forEach((s) => counts[new Date(s.schedule).getDay()]++);
    const max = Math.max(...counts);
    const candidates = counts.map((c, i) => ({ c, i })).filter((x) => x.c === max).map((x) => x.i);

    if (candidates.length === 1) return candidates[0];

    const now = Date.now();
    const upcoming = sessions.find((s) => +new Date(s.schedule) >= now);
    return upcoming ? new Date(upcoming.schedule).getDay() : new Date(sessions[0].schedule).getDay();
  }, [sessions, route?.params?.weekdayIndex]);

  const primaryWeekdayLabel =
    typeof primaryWeekdayIndex === "number" ? `${WEEKDAYS[primaryWeekdayIndex]}요일` : "미정";

  // 진행률 계산 — ✅ syllabus 기준
  const totalSubtopics = useMemo(
    () => syllabus.reduce((sum, m) => sum + m.subtopics.length, 0),
    [syllabus]
  );
  const completedSubtopics = useMemo(() => Object.values(progressMap).filter(Boolean).length, [progressMap]);
  const totalProgressPct = useMemo(
    () => (totalSubtopics ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0),
    [completedSubtopics, totalSubtopics]
  );

  // 시간 입력값(달력으로 날짜 선택, 여기선 시간만 입력)
  const base = new Date();
  base.setHours(base.getHours() + 2, 0, 0, 0);
  const [hour, setHour] = useState(base.getHours());
  const [minute, setMinute] = useState(base.getMinutes());

  // ----- 캘린더 표시용 상태 -----
  const [displayYear, setDisplayYear] = useState<number>(base.getFullYear());
  const [displayMonth, setDisplayMonth] = useState<number>(base.getMonth() + 1); // 1~12
  const [selectedKey, setSelectedKey] = useState<string>(toDateKey(base));

  // 세션을 날짜키로 맵핑
  const sessionsByDate = useMemo(() => {
    const map: Record<string, ClassItem[]> = {};
    sessions.forEach((s) => {
      const k = isoToDateKey(s.schedule);
      (map[k] = map[k] || []).push(s);
    });
    return map;
  }, [sessions]);

  // 선택한 날짜 + 시간으로 ISO 생성
  const toISOFromSelected = () => {
    if (!selectedKey) return null;
    const [y, m, d] = selectedKey.split("-").map(Number);
    const dt = new Date(y, (m || 1) - 1, d || 1, clamp(hour, 0, 23), clamp(minute, 0, 59), 0, 0);
    return dt.toISOString();
  };

  const addSession = () => {
    const iso = toISOFromSelected();
    if (!iso) {
      Alert.alert("입력 확인", "달력에서 날짜를 선택해 주세요.");
      return;
    }
    const newItem: ClassItem = {
      classId: Math.floor(Math.random() * 9_000_000) + 100,
      student,
      interest: "",
      schedule: iso,
      status: "수업 예약됨",
      note: memoText || undefined,
    };
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSessions((prev) => [...prev, newItem].sort((a, b) => +new Date(a.schedule) - +new Date(b.schedule)));
  };

  const removeSession = (classId: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSessions((prev) => prev.filter((s) => s.classId !== classId));
  };

  const toggleModuleExpand = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => (prev === i ? null : i));
  };
  const toggleChecklist = (mIndex: number, iIndex: number) => {
    const key = `${mIndex}-${iIndex}`;
    setProgressMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const resetCourseChecks = () => setProgressMap({});

  // 지난(과거) 수업 리스트
  const pastSessions = useMemo(() => {
    const now = Date.now();
    return sessions
      .filter((s) => +new Date(s.schedule) < now)
      .sort((a, b) => +new Date(b.schedule) - +new Date(a.schedule));
  }, [sessions]);

  const onSave = () => {
    const updated = sessions.map((s) => ({ ...s, note: memoText || undefined }));
    route?.params?.onUpdateSessions?.(updated);
    route?.params?.onUpdateCourseProgress?.(progressMap);
    navigation.goBack();
  };

  /* ---------- 캘린더 렌더링 로직 ---------- */
  const firstDay = new Date(displayYear, displayMonth - 1, 1);
  const firstWeekday = firstDay.getDay(); // 0=일
  const daysInThisMonth = getDaysInMonth(displayYear, displayMonth);
  const prevMonthDate = () => {
    let y = displayYear;
    let m = displayMonth - 1;
    if (m < 1) { m = 12; y -= 1; }
    setDisplayYear(y); setDisplayMonth(m);
  };
  const nextMonthDate = () => {
    let y = displayYear;
    let m = displayMonth + 1;
    if (m > 12) { m = 1; y += 1; }
    setDisplayYear(y); setDisplayMonth(m);
  };

  const todayKey = toDateKey(new Date());
  const calendarCells: Array<Date | null> = useMemo(() => {
    const cells: Array<Date | null> = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInThisMonth; d++) {
      cells.push(new Date(displayYear, displayMonth - 1, d));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    while (cells.length < 42) cells.push(null);
    return cells;
  }, [displayYear, displayMonth, firstWeekday, daysInThisMonth]);

  const onSelectDate = (d: Date) => {
    const k = toDateKey(d);
    setSelectedKey(k);
  };

  const selectedSessions = sessionsByDate[selectedKey] || [];

  // ✅ 요일별(일~토) 무지개 색상
  const RAINBOW = [
    { bg: "#FFE5E5", border: "#FFB3B3", text: "#B00020" }, // 일 - 빨
    { bg: "#FFF0E0", border: "#FFCC99", text: "#8B4A00" }, // 월 - 주
    { bg: "#FFF8C5", border: "#FFE066", text: "#7A6E00" }, // 화 - 노
    { bg: "#E6F6E6", border: "#BDEDBD", text: "#1B5E20" }, // 수 - 초
    { bg: "#E6F0FF", border: "#B3D1FF", text: "#0D47A1" }, // 목 - 파
    { bg: "#E8EAF6", border: "#C5CAE9", text: "#1A237E" }, // 금 - 남(인디고/네이비)
    { bg: "#F3E5F5", border: "#E1BEE7", text: "#4A148C" }, // 토 - 보
  ];
  const pillColors =
    typeof primaryWeekdayIndex === "number" ? RAINBOW[primaryWeekdayIndex] : { bg: "#FFF4E5", border: "#FFE0B2", text: "#8B5E00" };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>수업 관리</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        {/* 학생 + 요일 배지 (오른쪽 정렬) */}
        <View style={styles.simpleCard}>
          <View style={styles.simpleCardRow}>
            <Text style={styles.title} numberOfLines={1}>
              {student.name}
              <Text style={styles.dim}> · {student.age}</Text>
            </Text>

            <View
              style={[
                styles.weekdayPill,
                { backgroundColor: pillColors.bg, borderColor: pillColors.border },
              ]}
            >
              <Text style={[styles.weekdayPillText, { color: pillColors.text }]}>
                요일: {primaryWeekdayLabel}
              </Text>
            </View>
          </View>
        </View>

        {/* 지난 수업 일정 리스트 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>지난 수업 일정</Text>
          {pastSessions.length === 0 ? (
            <Text style={styles.noSess}>지난 일정이 없습니다</Text>
          ) : (
            pastSessions.map((s) => (
              <View key={s.classId} style={styles.sessionMiniRow}>
                <Text style={styles.sessionMiniText}>{formatKoreanDate(s.schedule)}</Text>
              </View>
            ))
          )}
        </View>

        {/* 1) 수업 진행률 — syllabus 사용 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>수업 진행률</Text>

          <View style={styles.progressWrap}>
            <View style={styles.progressTop}>
              <Text style={styles.progressTitle}>전체 진행</Text>
              <Text style={styles.progressValue}>{totalProgressPct}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${totalProgressPct}%` }]} />
            </View>
            <Text style={styles.progressSub}>
              {completedSubtopics} / {totalSubtopics} 체크 완료
            </Text>
          </View>

          {syllabus.map((m, mIndex) => {
            const doneCount = m.subtopics.filter((_, i) => progressMap[`${mIndex}-${i}`]).length;
            const secPct = m.subtopics.length ? Math.round((doneCount / m.subtopics.length) * 100) : 0;
            const open = expanded === mIndex;

            return (
              <View key={mIndex} style={styles.mCard}>
                <TouchableOpacity style={styles.mHeader} onPress={() => toggleModuleExpand(mIndex)}>
                  <View style={styles.mHeaderLeft}>
                    <Text style={styles.mIndex}>{mIndex + 1}</Text>
                    <Text style={styles.mTitle}>{m.title}</Text>
                  </View>
                  <View style={styles.mHeaderRight}>
                    <Text style={styles.mBadge}>{doneCount}/{m.subtopics.length}</Text>
                    <Text style={styles.mChevron}>{open ? "⌃" : "⌄"}</Text>
                  </View>
                </TouchableOpacity>

                {open && (
                  <View style={styles.mBody}>
                    {m.subtopics.map((t, iIndex) => {
                      const key = `${mIndex}-${iIndex}`;
                      const checked = !!progressMap[key];
                      return (
                        <TouchableOpacity
                          key={key}
                          style={styles.itemRow}
                          onPress={() => toggleChecklist(mIndex, iIndex)}
                          activeOpacity={0.8}
                        >
                          <View style={[styles.checkbox, checked && styles.checkboxOn]}>
                            <Text style={styles.checkboxText}>{checked ? "✓" : ""}</Text>
                          </View>
                          <Text style={[styles.itemText, checked && styles.itemTextDone]}>{t}</Text>
                        </TouchableOpacity>
                      );
                    })}
                    <View style={styles.sectionProgressBg}>
                      <View style={[styles.sectionProgressFill, { width: `${secPct}%` }]} />
                    </View>
                    <Text style={styles.sectionProgressText}>이 강의 진행률 {secPct}%</Text>
                  </View>
                )}
              </View>
            );
          })}

          <View style={styles.rowGap}>
            <TouchableOpacity style={[styles.ctaBtn, styles.ctaGhost]} onPress={resetCourseChecks}>
              <Text style={[styles.ctaText, styles.ctaGhostText]}>체크 초기화</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2) 수업 일정 (캘린더 + 추가/삭제) */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>수업 일정</Text>

          {/* 캘린더 */}
          <View style={styles.calendarBox}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={prevMonthDate} style={styles.calNavBtn}>
                <Text style={styles.calNavTxt}>〈</Text>
              </TouchableOpacity>
              <Text style={styles.calHeaderTitle}>
                {displayYear}년 {displayMonth}월
              </Text>
              <TouchableOpacity onPress={nextMonthDate} style={styles.calNavBtn}>
                <Text style={styles.calNavTxt}>〉</Text>
              </TouchableOpacity>
            </View>

            {/* 요일 헤더 */}
            <View style={styles.weekHeaderRow}>
              {WEEKDAYS.map((w, idx) => (
                <View
                  key={w}
                  style={[
                    styles.weekHeaderCell,
                    typeof primaryWeekdayIndex === "number" &&
                      idx === primaryWeekdayIndex &&
                      styles.weekdayEmphasisHeader,
                  ]}
                >
                  <Text style={styles.weekHeaderText}>{w}</Text>
                </View>
              ))}
            </View>

            {/* 날짜 그리드 */}
            <View style={styles.grid}>
              {calendarCells.map((d, i) => {
                if (!d) return <View key={`empty-${i}`} style={styles.cell} />;
                const k = toDateKey(d);
                const isSelected = k === selectedKey;
                const isToday = k === toDateKey(new Date());
                const hasSessions = !!sessionsByDate[k];
                const dow = d.getDay();

                return (
                  <TouchableOpacity
                    key={k}
                    style={[
                      styles.cell,
                      typeof primaryWeekdayIndex === "number" &&
                        dow === primaryWeekdayIndex &&
                        styles.weekdayEmphasisCell,
                      isSelected && styles.cellSelected,
                      isToday && !isSelected && styles.cellToday,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedKey(k)}
                  >
                    <Text style={[styles.cellText, isSelected && styles.cellTextOn]}>
                      {d.getDate()}
                    </Text>
                    {hasSessions && <View style={styles.dot} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 선택일의 세션 간단 리스트 */}
            <View style={{ marginTop: 10 }}>
              {(sessionsByDate[selectedKey] || []).length === 0 ? (
                <Text style={styles.noSess}>선택한 날짜에 일정 없음</Text>
              ) : (
                (sessionsByDate[selectedKey] || []).map((s) => (
                  <View key={s.classId} style={styles.sessionMiniRow}>
                    <Text style={styles.sessionMiniText}>{formatKoreanDate(s.schedule)}</Text>
                    <TouchableOpacity onPress={() => removeSession(s.classId)} style={styles.delBtn}>
                      <Text style={styles.delBtnText}>삭제</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* 시간 입력 & 추가 */}
          <View style={styles.dateBox}>
            <View style={styles.selectedDateBadge}>
              <Text style={styles.selectedDateText}>날짜: {formatYMDLabel(selectedKey)}</Text>
            </View>

            <Field
              label="시"
              value={String(hour)}
              onChange={(t) => setHour(clamp(Number(t.replace(/[^0-9]/g, "")) || hour, 0, 23))}
              width={60}
            />
            <Field
              label="분"
              value={String(minute)}
              onChange={(t) => setMinute(clamp(Number(t.replace(/[^0-9]/g, "")) || minute, 0, 59))}
              width={60}
            />
            <TouchableOpacity style={styles.addBtn} onPress={addSession}>
              <Text style={styles.addBtnText}>추가</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3) 메모 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>메모</Text>
          <TextInput
            value={memoText}
            onChangeText={setMemoText}
            placeholder="예) 상추 키우기 집중, 토요일 선호 등"
            placeholderTextColor="#9AA0A6"
            style={[styles.input, styles.textarea]}
            multiline
          />
        </View>
      </ScrollView>

      {/* Bottom */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.ctaBtn, styles.ctaGhost]} onPress={() => navigation.goBack()}>
          <Text style={[styles.ctaText, styles.ctaGhostText]}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctaBtn} onPress={onSave}>
          <Text style={styles.ctaText}>저장</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default StudentDetailScreen;

/* ===== 보조 컴포넌트 ===== */
const Field: React.FC<{ label: string; value: string; onChange: (t: string) => void; width?: number }> = ({
  label,
  value,
  onChange,
  width = 70,
}) => {
  return (
    <View style={{ width }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
        style={styles.fieldInput}
        placeholderTextColor="#9AA0A6"
      />
    </View>
  );
};

/* ===================== Styles ===================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  backIcon: { color: "#FFF", fontSize: 22, fontWeight: "bold" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },

  simpleCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEF2FF",
  },
  // ✅ 이름/나이 왼쪽, 요일 pill 오른쪽
  simpleCardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  title: { fontSize: 18, color: "#111827", fontWeight: "800", flexShrink: 1 },
  dim: { color: "#6B7280", fontSize: 16, fontWeight: "600" },

  weekdayRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }, // (남아있어도 무해)
  weekdayPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#FFF4E5",
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  weekdayPillText: { fontSize: 12, fontWeight: "700", color: "#8B5E00" },

  card: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEF2FF",
  },
  sectionTitle: { marginTop: 2, marginBottom: 10, fontSize: 14, color: "#374151", fontWeight: "700" },

  /* 진행률 */
  progressWrap: { marginTop: 4 },
  progressTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  progressTitle: { fontSize: 13, color: "#444", fontWeight: "600" },
  progressValue: { fontSize: 13, color: PRIMARY, fontWeight: "700" },
  progressBarBg: { height: 8, backgroundColor: "#ECECF5", borderRadius: 4, overflow: "hidden" },
  progressBarFill: { height: 8, backgroundColor: PRIMARY, borderRadius: 4 },
  progressSub: { marginTop: 6, fontSize: 12, color: "#666" },

  mCard: { backgroundColor: "#FFF", borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "#EFF2FB", marginTop: 10 },
  mHeader: { paddingHorizontal: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  mHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  mIndex: { width: 28, height: 28, borderRadius: 14, backgroundColor: PRIMARY, color: "#FFF", textAlign: "center", lineHeight: 28, fontWeight: "700", fontSize: 13 },
  mTitle: { fontSize: 15, color: "#222", fontWeight: "700", flexShrink: 1 },
  mHeaderRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  mBadge: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "#F0F3FF", color: PRIMARY, borderRadius: 8, fontSize: 12, overflow: "hidden" },
  mChevron: { fontSize: 18, color: "#999" },
  mBody: { paddingHorizontal: 12, paddingBottom: 12 },

  itemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: PRIMARY, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF" },
  checkboxOn: { backgroundColor: PRIMARY },
  checkboxText: { color: "#FFF", fontSize: 14, fontWeight: "800" },
  itemText: { fontSize: 14, color: "#333", flexShrink: 1 },
  itemTextDone: { color: "#888", textDecorationLine: "line-through" },

  sectionProgressBg: { height: 6, backgroundColor: "#EDEDF6", borderRadius: 4, overflow: "hidden", marginTop: 10 },
  sectionProgressFill: { height: 6, backgroundColor: PRIMARY, borderRadius: 4 },
  sectionProgressText: { marginTop: 6, fontSize: 12, color: "#666" },

  rowGap: { gap: 10, marginTop: 10 },
  ctaBtn: { flex: 1, backgroundColor: PRIMARY, paddingVertical: 12, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  ctaText: { color: "#FFF", fontWeight: "800" },
  ctaGhost: { backgroundColor: "#EEF0FF" },
  ctaGhostText: { color: PRIMARY },

  /* 캘린더 */
  calendarBox: {
    backgroundColor: "#F8FAFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEF2FF",
    padding: 12,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  calHeaderTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  calNavBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: "#EEF0FF",
    alignItems: "center", justifyContent: "center",
  },
  calNavTxt: { color: PRIMARY, fontSize: 16, fontWeight: "800" },

  weekHeaderRow: { flexDirection: "row", marginTop: 4, marginBottom: 6 },
  weekHeaderCell: { flex: 1, alignItems: "center", paddingVertical: 6, borderRadius: 8 },
  weekHeaderText: { fontSize: 12, color: "#6B7280", fontWeight: "700" },
  weekdayEmphasisHeader: { backgroundColor: "#FFF4E5" },

  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    marginVertical: 2,
  },
  weekdayEmphasisCell: { backgroundColor: "#FFF9ED" },
  cellSelected: { backgroundColor: PRIMARY },
  cellToday: { borderWidth: 1.5, borderColor: PRIMARY },
  cellText: { fontSize: 14, color: "#111827", fontWeight: "700" },
  cellTextOn: { color: "#FFF" },
  dot: {
    width: 6, height: 6, borderRadius: 3, marginTop: 4,
    backgroundColor: "#0F9D58",
  },
  noSess: { color: "#6B7280", fontSize: 12, marginTop: 4 },

  sessionMiniRow: {
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEF2FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sessionMiniText: { fontSize: 13, color: "#111827", fontWeight: "700" },

  /* 시간 입력 & 추가 */
  dateBox: {
    backgroundColor: "#F8FAFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEF2FF",
    padding: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginTop: 10,
    flexWrap: "wrap",
  },
  selectedDateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#EEF0FF",
    borderWidth: 1,
    borderColor: "#CBD5FF",
    marginBottom: 4,
  },
  selectedDateText: { color: PRIMARY, fontWeight: "700", fontSize: 14 },

  fieldLabel: { fontSize: 12, color: "#6B7280", marginBottom: 6 },
  fieldInput: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  addBtn: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, backgroundColor: PRIMARY },
  addBtnText: { color: "#FFF", fontWeight: "800" },

  /* 메모 */
  input: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textarea: { minHeight: 110, textAlignVertical: "top" },

  /* bottom */
  bottomBar: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#EFEFF5",
  },
});
