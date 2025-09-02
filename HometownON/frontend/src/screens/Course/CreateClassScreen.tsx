import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const PRIMARY = "#6956E5";
const BG = "#F7F7FA";

type StatusType = "수업 예약됨" | "오리엔테이션 완료" | "1강 완료" | "2강 진행 중";
type Recurrence = "WEEKLY" | "BIWEEKLY"; // 반복만 사용

const STATUS_OPTIONS: StatusType[] = [
  "수업 예약됨",
  "오리엔테이션 완료",
  "1강 완료",
  "2강 진행 중",
];

const RECURRENCE_OPTIONS: { key: Recurrence; label: string }[] = [
  { key: "WEEKLY", label: "매주" },
  { key: "BIWEEKLY", label: "2주마다" },
];

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"]; // 0~6

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function formatKoreanDate(d: Date) {
  const day = WEEKDAYS[d.getDay()];
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${mm}/${dd}(${day}) ${hh}:${min}`;
}

function nextWeekdayOnOrAfter(start: Date, targetWeekday: number) {
  const d = new Date(start);
  const diff = (targetWeekday - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff);
  return d;
}

function buildRecurrence(
  baseStart: Date,
  targetWeekday: number,
  hour: number,
  minute: number,
  recurrence: Recurrence,
  count: number
) {
  const first = nextWeekdayOnOrAfter(baseStart, targetWeekday);
  first.setHours(hour, minute, 0, 0);
  const items: Date[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(first);
    const addDays = recurrence === "WEEKLY" ? i * 7 : i * 14;
    d.setDate(first.getDate() + addDays);
    items.push(d);
  }
  return items;
}

const CreateClassScreen: React.FC<any> = ({ navigation, route }) => {
  const now = new Date();
  const init = new Date(now);
  init.setHours(now.getHours() + 2, 0, 0, 0);

  // 수강생/수업 정보
  const [name, setName] = useState("");
  const [age, setAge] = useState<string>("");
  const [interest, setInterest] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<StatusType>("수업 예약됨");

  // 시작 주(연-월-일)
  const [year, setYear] = useState(init.getFullYear());
  const [month, setMonth] = useState(init.getMonth() + 1); // 1~12
  const [day, setDay] = useState(init.getDate());

  // 요일/시간
  const [weekday, setWeekday] = useState<number>(init.getDay());
  const [hour, setHour] = useState(init.getHours());
  const [minute, setMinute] = useState(init.getMinutes());

  // 반복 옵션
  const [recurrence, setRecurrence] = useState<Recurrence>("WEEKLY");
  const [sessionsCount, setSessionsCount] = useState<string>("4"); // 2~52

  const valid = useMemo(() => {
    const a = Number(age);
    const c = Number(sessionsCount);
    if (!name.trim()) return false;
    if (!age.trim() || Number.isNaN(a) || a < 1 || a > 120) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false; // 단순 검증 (윤년/말일은 서버에서 한 번 더)
    if (hour < 0 || hour > 23) return false;
    if (minute < 0 || minute > 59) return false;
    if (!sessionsCount.trim() || Number.isNaN(c) || c < 2 || c > 52) return false;
    return true;
  }, [name, age, month, day, hour, minute, sessionsCount]);

  const startOfSeries = useMemo(() => {
    const m = clamp(month, 1, 12);
    const d = clamp(day, 1, 31);
    const h = clamp(hour, 0, 23);
    const min = clamp(minute, 0, 59);
    return new Date(year, m - 1, d, h, min, 0, 0);
  }, [year, month, day, hour, minute]);

  const previewDates = useMemo(() => {
    const count = clamp(Number(sessionsCount || "0"), 2, 52);
    if (!valid) return [];
    return buildRecurrence(startOfSeries, weekday, hour, minute, recurrence, count);
  }, [valid, startOfSeries, weekday, hour, minute, recurrence, sessionsCount]);

  const onSave = () => {
    if (!valid) {
      Alert.alert("입력 확인", "필수 항목을 올바르게 입력해 주세요.");
      return;
    }
    const base = {
      student: { name: name.trim(), age: Number(age) },
      interest: interest.trim() || "관심사 미입력",
      status,
      note: note.trim() || undefined,
    };
    const count = clamp(Number(sessionsCount), 2, 52);
    const dates = buildRecurrence(startOfSeries, weekday, hour, minute, recurrence, count);

    const items = dates.map((d) => ({
      classId: Math.floor(Math.random() * 9_000) + 100,
      schedule: d.toISOString(),
      ...base,
    }));

    if (route?.params?.onCreateMany) {
      route.params.onCreateMany(items);
    } else if (route?.params?.onCreate) {
      items.forEach((it) => route.params.onCreate(it)); // 하위 호환
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>새 수업 만들기</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        <View style={styles.form}>
          {/* 수강생 정보 */}
          <Text style={styles.sectionTitle}>수강생 정보</Text>
          <View style={styles.field}>
            <Text style={styles.label}>이름 *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="예) 김민지"
              placeholderTextColor="#9AA0A6"
              style={styles.input}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>나이 *</Text>
              <TextInput
                value={age}
                onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ""))}
                placeholder="예) 32"
                placeholderTextColor="#9AA0A6"
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={[styles.field, { flex: 2 }]}>
              <Text style={styles.label}>관심사/배경</Text>
              <TextInput
                value={interest}
                onChangeText={setInterest}
                placeholder="예) 채소 재배, 귀촌 준비"
                placeholderTextColor="#9AA0A6"
                style={styles.input}
              />
            </View>
          </View>

          {/* 시작 주 (연/월/일) */}
          <Text style={styles.sectionTitle}>시작 주</Text>
          <View style={styles.dateRow}>
            <StepperInput label="연"   value={year}   min={1970} max={2100} step={1}  onChange={setYear} />
            <StepperInput label="월"   value={month}  min={1}    max={12}   step={1}  onChange={setMonth} />
            <StepperInput label="일"   value={day}    min={1}    max={31}   step={1}  onChange={setDay} />
          </View>

          {/* 요일 선택 */}
          <Text style={styles.sectionTitle}>요일</Text>
          <View style={styles.chipsRow}>
            {WEEKDAYS.map((w, idx) => {
              const active = weekday === idx;
              return (
                <TouchableOpacity
                  key={w}
                  style={[styles.chip, active && styles.chipOn]}
                  onPress={() => setWeekday(idx)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextOn]}>{w}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 시간 선택 */}
          <Text style={styles.sectionTitle}>시간</Text>
          <View style={styles.dateRow}>
            <StepperInput label="시"   value={hour}   min={0} max={23} step={1} onChange={setHour} />
            <StepperInput label="분"   value={minute} min={0} max={59} step={5} onChange={setMinute} />
            <View style={{ flex: 1 }} />
          </View>

          {/* 반복 주기 & 횟수 */}
          <Text style={styles.sectionTitle}>반복 주기</Text>
          <View style={styles.chipsRow}>
            {RECURRENCE_OPTIONS.map((opt) => {
              const active = recurrence === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.chip, active && styles.chipOn]}
                  onPress={() => setRecurrence(opt.key)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextOn]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.field, { marginTop: 8 }]}>
            <Text style={styles.label}>횟수 (2~52)</Text>
            <TextInput
              value={sessionsCount}
              onChangeText={(t) => setSessionsCount(t.replace(/[^0-9]/g, ""))}
              placeholder="예) 4"
              placeholderTextColor="#9AA0A6"
              keyboardType="number-pad"
              style={styles.input}
            />
            <Text style={styles.help}>시작 주 이후, 선택한 요일·시간으로 반복 생성됩니다.</Text>
          </View>

          {/* 상태 */}
          <Text style={styles.sectionTitle}>수업 상태</Text>
          <View style={styles.chipsRow}>
            {STATUS_OPTIONS.map((s) => {
              const active = s === status;
              return (
                <TouchableOpacity key={s} style={[styles.chip, active && styles.chipOn]} onPress={() => setStatus(s)}>
                  <Text style={[styles.chipText, active && styles.chipTextOn]}>{s}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 메모 */}
          <Text style={styles.sectionTitle}>메모</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="예) 상추 키우기 집중, 토요일 선호 등"
            placeholderTextColor="#9AA0A6"
            style={[styles.input, styles.textarea]}
            multiline
          />

          {/* 미리보기 */}
          <Text style={styles.sectionTitle}>생성될 일정 미리보기</Text>
          <View style={styles.previewBox}>
            {previewDates.length === 0 ? (
              <Text style={styles.previewEmpty}>입력을 완료하면 회차 일정이 표시됩니다.</Text>
            ) : (
              previewDates.slice(0, 6).map((d, i) => (
                <Text key={i} style={styles.previewItem}>
                  {i + 1}. {formatKoreanDate(d)}
                </Text>
              ))
            )}
            {previewDates.length > 6 && (
              <Text style={styles.previewMore}>… 외 {previewDates.length - 6}회</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.ctaBtn, styles.ctaGhost]}
          onPress={() => {
            setName(""); setAge(""); setInterest(""); setNote("");
            setStatus("수업 예약됨");
            setYear(init.getFullYear());
            setMonth(init.getMonth() + 1);
            setDay(init.getDate());
            setWeekday(init.getDay());
            setHour(init.getHours());
            setMinute(init.getMinutes());
            setRecurrence("WEEKLY");
            setSessionsCount("4");
          }}
        >
          <Text style={[styles.ctaText, styles.ctaGhostText]}>초기화</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.ctaBtn, !valid && { opacity: 0.5 }]} onPress={onSave} disabled={!valid}>
          <Text style={styles.ctaText}>저장</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CreateClassScreen;

/* ===== 입력 가능한 Stepper ===== */
const StepperInput: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}> = ({ label, value, min, max, step, onChange }) => {
  const [text, setText] = useState(String(value));

  // 부모 값이 바뀌면 입력창 동기화
  useEffect(() => {
    setText(String(value));
  }, [value]);

  const commit = () => {
    if (text.trim() === "") {
      setText(String(value));
      return;
    }
    const n = Number(text);
    if (Number.isNaN(n)) {
      setText(String(value));
      return;
    }
    const clamped = clamp(Math.round(n), min, max);
    if (clamped !== value) onChange(clamped);
    setText(String(clamped));
  };

  const inc = () => onChange(clamp(value + step, min, max));
  const dec = () => onChange(clamp(value - step, min, max));

  return (
    <View style={styles.stepper}>
      <Text style={styles.stepLabel}>{label}</Text>
      <View style={styles.stepBox}>
        <TouchableOpacity onPress={dec} style={styles.stepBtn}>
          <Text style={styles.stepBtnTxt}>−</Text>
        </TouchableOpacity>

        <TextInput
          value={text}
          onChangeText={(t) => setText(t.replace(/[^0-9]/g, ""))}
          onBlur={commit}
          keyboardType="number-pad"
          style={styles.stepInput}
          maxLength={4} // 연도 대비 여유
        />

        <TouchableOpacity onPress={inc} style={styles.stepBtn}>
          <Text style={styles.stepBtnTxt}>＋</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  backIcon: { color: "#FFF", fontSize: 22, fontWeight: "bold" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },

  form: { paddingHorizontal: 16, paddingTop: 14 },
  sectionTitle: { marginTop: 18, marginBottom: 8, fontSize: 14, color: "#374151", fontWeight: "700" },
  field: { marginBottom: 12 },
  label: { marginBottom: 6, fontSize: 12, color: "#6B7280" },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  help: { marginTop: 6, fontSize: 12, color: "#6B7280" },

  row: { flexDirection: "row", alignItems: "flex-start" },

  dateRow: { flexDirection: "row", gap: 12, marginBottom: 8 },

  /* stepper */
  stepper: { flex: 1 },
  stepLabel: { fontSize: 12, color: "#6B7280", marginBottom: 6 },
  stepBox: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EEF0FF",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnTxt: { color: PRIMARY, fontSize: 18, fontWeight: "900" },
  stepInput: {
    minWidth: 56,
    textAlign: "center",
    fontSize: 16,
    color: "#111827",
    fontWeight: "700",
    paddingVertical: 0,
    paddingHorizontal: 0,
  },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#EEF1F5",
  },
  chipOn: { backgroundColor: "#EEF0FF", borderWidth: 1, borderColor: PRIMARY },
  chipText: { fontSize: 12, color: "#374151" },
  chipTextOn: { color: PRIMARY, fontWeight: "700" },

  textarea: { minHeight: 90, textAlignVertical: "top" },

  previewBox: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
  },
  previewEmpty: { fontSize: 12, color: "#6B7280" },
  previewItem: { fontSize: 13, color: "#111827", marginBottom: 4 },
  previewMore: { fontSize: 12, color: "#6B7280" },

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
