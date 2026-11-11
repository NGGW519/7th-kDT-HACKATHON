// src/screens/MyStudentsScreen.tsx
import React, { useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ClassItem = {
  classId: number;
  student: { name: string; age: number };
  interest: string;
  schedule: string;      // ISO string
  status: "수업 예약됨" | "오리엔테이션 완료" | "1강 완료" | "2강 진행 중";
  note?: string;
};

const PRIMARY = "#6956E5";
const BG = "#F7F7FA";
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// StudentDetail 커리큘럼 총 항목 수와 맞추세요(기본 6×4=24)
const TOTAL_SUBTOPICS = 24;

const mockData: ClassItem[] = [
  { classId: 101, student: { name: "김민지", age: 32 }, interest: "채소 재배, 귀촌 준비", schedule: "2025-03-05T14:00:00", status: "1강 완료", note: "상추 키우기 집중" },
  { classId: 102, student: { name: "박성호", age: 45 }, interest: "주말농장 경험, 퇴비 활용 관심", schedule: "2025-03-06T10:00:00", status: "2강 진행 중", note: "거름 제조법 추가" },
  { classId: 103, student: { name: "이지현", age: 28 }, interest: "베란다 텃밭, 소규모 화분", schedule: "2025-03-07T19:00:00", status: "오리엔테이션 완료", note: "주중 저녁 가능" },
  { classId: 104, student: { name: "최영수", age: 60 }, interest: "귀농 희망, 고추 재배", schedule: "2025-03-08T11:00:00", status: "수업 예약됨", note: "작목반 경험 有" },
  { classId: 105, student: { name: "한수연", age: 36 }, interest: "아이 동반 체험", schedule: "2025-03-09T15:00:00", status: "수업 예약됨", note: "토요일 선호" },
  { classId: 106, student: { name: "오현석", age: 52 }, interest: "친환경 재배, 건강 관리", schedule: "2025-03-10T09:00:00", status: "1강 완료", note: "멀칭법 관심" },
];

function formatKoreanDate(iso: string) {
  const d = new Date(iso);
  const day = WEEKDAYS[d.getDay()];
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  const hh = d.getHours().toString().padStart(2, "0");
  const min = d.getMinutes().toString().padStart(2, "0");
  return `${mm}/${dd}(${day}) ${hh}:${min}`;
}

// 학생별 키 & 진행률 계산
const keyOf = (s: { name: string; age: number }) => `${s.name}__${s.age}`;
const pctFromMap = (map?: Record<string, boolean>) => {
  if (!map) return 0;
  const done = Object.values(map).filter(Boolean).length;
  return TOTAL_SUBTOPICS ? Math.round((done / TOTAL_SUBTOPICS) * 100) : 0;
};

// 요일별 무지개 색상
const RAINBOW = [
  { bg: "#FFE5E5", border: "#FFB3B3", text: "#B00020" }, // 일 - 빨
  { bg: "#FFF0E0", border: "#FFCC99", text: "#8B4A00" }, // 월 - 주
  { bg: "#FFF8C5", border: "#FFE066", text: "#7A6E00" }, // 화 - 노
  { bg: "#E6F6E6", border: "#BDEDBD", text: "#1B5E20" }, // 수 - 초
  { bg: "#E6F0FF", border: "#B3D1FF", text: "#0D47A1" }, // 목 - 파
  { bg: "#E8EAF6", border: "#C5CAE9", text: "#1A237E" }, // 금 - 남
  { bg: "#F3E5F5", border: "#E1BEE7", text: "#4A148C" }, // 토 - 보
];

const MyStudentsScreen: React.FC<any> = ({ navigation }) => {
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<ClassItem[]>(mockData);

  // 학생별 진행 체크맵 저장: { "이름__나이": { "m-i": boolean, ... } }
  const [progressByStudent, setProgressByStudent] = useState<Record<string, Record<string, boolean>>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((item) =>
      [item.student.name, String(item.student.age), item.interest, item.note ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [data, query]);

  // 상단 요약 카드(전체/완료/진행) — 학생 단위로 계산
  const summary = useMemo(() => {
    const keys = Array.from(new Set(data.map((d) => keyOf(d.student))));
    const total = keys.length;
    const done = keys.reduce((acc, k) => acc + (pctFromMap(progressByStudent[k]) >= 100 ? 1 : 0), 0);
    const ongoing = total - done; // 100% 미만 (0% 포함)
    return { total, done, ongoing };
  }, [data, progressByStudent]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setData((prev) => [...prev]); // 데모: 그대로 유지
      setRefreshing(false);
    }, 700);
  };

  const renderItem = ({ item }: { item: ClassItem }) => {
    const key = keyOf(item.student);
    const pct = pctFromMap(progressByStudent[key]);

    const d = new Date(item.schedule);
    const wIdx = isNaN(d.getTime()) ? undefined : d.getDay();
    const pill = typeof wIdx === "number" ? RAINBOW[wIdx] : { bg: "#F0F3FF", border: "#CBD5FF", text: PRIMARY };
    const weekdayLabel = typeof wIdx === "number" ? `${WEEKDAYS[wIdx]}요일` : "미정";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          navigation?.navigate?.("StudentDetailScreen", {
            student: item.student,
            sessions: data.filter(
              (d) => d.student.name === item.student.name && d.student.age === item.student.age
            ),
            courseProgress: progressByStudent[key],
            onUpdateCourseProgress: (map: Record<string, boolean>) => {
              setProgressByStudent((prev) => ({ ...prev, [key]: map }));
            },
          })
        }
      >
        <View style={styles.cardTop}>
          {/* 왼쪽: 이름/나이 + 요일 pill */}
          <View style={styles.nameRow}>
            <Text style={styles.studentName} numberOfLines={1}>
              {item.student.name}
              <Text style={styles.studentAge}> · {item.student.age}</Text>
            </Text>
            <View style={[styles.weekdayPill, { backgroundColor: pill.bg, borderColor: pill.border }]}>
              <Text style={[styles.weekdayPillText, { color: pill.text }]}>{weekdayLabel}</Text>
            </View>
          </View>

          {/* 오른쪽: 진행률 배지 */}
          <View style={styles.badgeGhost}>
            <Text style={styles.badgeGhostText}>진행률 {pct}%</Text>
          </View>
        </View>

        <Text style={styles.interest} numberOfLines={1}>
          {item.interest}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaLeft}>🗓 {formatKoreanDate(item.schedule)}</Text>
          <Text style={styles.metaRight} numberOfLines={1}>
            📝 {item.note ?? "메모 없음"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>1:1 수업 리스트</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 상단 요약 카드: 전체 / 완료 / 진행 */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>전체</Text>
          <Text style={styles.statValue}>{summary.total}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>완료</Text>
          <Text style={styles.statValue}>{summary.done}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>진행</Text>
          <Text style={styles.statValue}>{summary.ongoing}</Text>
        </View>
      </View>

      {/* 검색 */}
      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="이름/관심사/메모 검색"
          placeholderTextColor="#9AA0A6"
          style={styles.searchInput}
        />
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(it) => String(it.classId)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 8 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyTitle}>수업이 없습니다</Text>
            <Text style={styles.emptySub}>아래 버튼으로 수업을 추가해보세요</Text>
          </View>
        }
      />

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.ctaBtn, styles.ctaGhost]}
          onPress={() => setQuery("")}
        >
          <Text style={[styles.ctaText, styles.ctaGhostText]}>검색 지우기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => navigation?.navigate?.("CreateClassScreen")}
        >
          <Text style={styles.ctaText}>새 수업 만들기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default MyStudentsScreen;

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

  // 상단 요약 카드
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  statLabel: { fontSize: 12, color: "#6B7280" },
  statValue: { fontSize: 16, color: "#111827", fontWeight: "800", marginTop: 2 },

  searchWrap: { paddingHorizontal: 16, marginTop: 12 },
  searchInput: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  card: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  // 이름 + 요일 pill
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
  studentName: { fontSize: 16, color: "#111827", fontWeight: "800" },
  studentAge: { fontSize: 14, color: "#6B7280", fontWeight: "600" },

  // 요일 pill
  weekdayPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  weekdayPillText: { fontSize: 12, fontWeight: "700" },

  // 진행률 배지 (우측)
  badgeGhost: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#F0F3FF",
    borderWidth: 1,
    borderColor: "#CBD5FF",
  },
  badgeGhostText: { fontSize: 12, fontWeight: "700", color: PRIMARY },

  interest: { marginTop: 6, color: "#374151", fontSize: 13 },
  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  metaLeft: { fontSize: 12, color: "#6B7280" },
  metaRight: { fontSize: 12, color: "#6B7280", flexShrink: 1 },

  emptyBox: { alignItems: "center", justifyContent: "center", paddingVertical: 80 },
  emptyIcon: { fontSize: 34, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  emptySub: { fontSize: 13, color: "#6B7280", marginTop: 4 },

  bottomBar: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#EFEFF5",
  },
  ctaBtn: {
    flex: 1,
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaGhost: { backgroundColor: "#EEF0FF" },
  ctaText: { color: "#FFF", fontWeight: "800" },
  ctaGhostText: { color: PRIMARY },
});
