import React, { useEffect, useState } from "react";
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

type Module = {
  title: string;
  subtopics: string[];
};

const PRIMARY = "#6956E5";

const initialModules: Module[] = [
  {
    title: "1강 – 오리엔테이션 & 준비",
    subtopics: [
      "텃밭 가꾸기의 즐거움과 기본 개념",
      "필수 도구 소개(삽·모종삽·물뿌리개 등)",
      "장소 선정 요령(햇빛·배수·바람)",
      "토양 종류와 특징 간단 설명",
    ],
  },
  {
    title: "2강 – 흙과 토양 다루기",
    subtopics: [
      "잡초 제거 및 흙 고르기",
      "퇴비·거름으로 비옥한 흙 만들기",
      "토양 pH와 비료 기본 이해",
      "상자/화분 텃밭 응용",
    ],
  },
  {
    title: "3강 – 씨앗과 모종 심기",
    subtopics: [
      "계절·지역별 추천 작물(상추·깻잎·고추 등)",
      "씨앗 파종 vs 모종 정식 차이",
      "파종 간격·심는 깊이",
      "모종 정식 시 주의사항",
    ],
  },
  {
    title: "4강 – 물주기와 관리",
    subtopics: [
      "물 주는 시기와 횟수(아침/저녁)",
      "배수 문제 해결",
      "멀칭(비닐·짚)으로 수분 보존",
      "기초 병충해 예방 관리",
    ],
  },
  {
    title: "5강 – 성장 관리",
    subtopics: [
      "솎아내기와 지주세우기",
      "웃거름 주기(추가 비료)",
      "잎 따기/가지치기 기초",
      "텃밭 기록장 쓰기(성장 기록)",
    ],
  },
  {
    title: "6강 – 수확과 활용",
    subtopics: [
      "작물별 수확 시기와 방법",
      "수확 후 보관·저장",
      "수확물 간단 요리(샐러드·쌈 등)",
      "경험 공유 & QnA",
    ],
  },
];

function enableLayoutAnimation() {
  if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const CourseEditorScreen: React.FC<any> = ({ navigation, route }) => {
  // route.params?.modules 가 있으면 그걸로 초기화(다른 화면에서 넘어온 기존 데이터 편집 지원)
  const [modules, setModules] = useState<Module[]>(route?.params?.modules ?? initialModules);
  const [expanded, setExpanded] = useState<number | null>(0);

  useEffect(() => {
    enableLayoutAnimation();
  }, []);

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => (prev === index ? null : index));
  };

  const changeModuleTitle = (mIndex: number, value: string) => {
    setModules((prev) => {
      const copy = [...prev];
      copy[mIndex] = { ...copy[mIndex], title: value };
      return copy;
    });
  };

  const changeSubtopic = (mIndex: number, sIndex: number, value: string) => {
    setModules((prev) => {
      const copy = [...prev];
      const subs = [...copy[mIndex].subtopics];
      subs[sIndex] = value;
      copy[mIndex] = { ...copy[mIndex], subtopics: subs };
      return copy;
    });
  };

  const addModule = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setModules((prev) => [
      ...prev,
      { title: `${prev.length + 1}강 – 새 강의`, subtopics: ["새 소주제 1"] },
    ]);
    setExpanded(modules.length); // 새로 추가한 것 펼치기
  };

  const removeModule = (mIndex: number) => {
    Alert.alert("삭제", "이 강의를 삭제할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setModules((prev) => prev.filter((_, idx) => idx !== mIndex));
          if (expanded === mIndex) setExpanded(null);
        },
      },
    ]);
  };

  const addSubtopic = (mIndex: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setModules((prev) => {
      const copy = [...prev];
      copy[mIndex] = {
        ...copy[mIndex],
        subtopics: [...copy[mIndex].subtopics, `새 소주제 ${copy[mIndex].subtopics.length + 1}`],
      };
      return copy;
    });
  };

  const removeSubtopic = (mIndex: number, sIndex: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setModules((prev) => {
      const copy = [...prev];
      const subs = copy[mIndex].subtopics.filter((_, i) => i !== sIndex);
      copy[mIndex] = { ...copy[mIndex], subtopics: subs.length ? subs : [""] };
      return copy;
    });
  };

  const saveModules = () => {
    // TODO: 서버 저장 / 글로벌 상태 저장 등 연결
    // 예시) navigation.navigate("어딘가", { modules });
    console.log("Saved modules:", modules);
    Alert.alert("저장 완료", "목차가 저장되었습니다.");
    // navigation.goBack?.();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack?.()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>텃밭 기초 가꾸기 · 편집</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={saveModules}>
          <Text style={styles.saveText}>저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {modules.map((m, mIndex) => {
          const isOpen = expanded === mIndex;

          return (
            <View key={mIndex} style={styles.card}>
              {/* 카드 헤더: 강의명 + 펼침/삭제 */}
              <TouchableOpacity onPress={() => toggleExpand(mIndex)} style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Text style={styles.cardIndex}>{mIndex + 1}</Text>
                  <Text style={styles.cardTitlePreview} numberOfLines={1}>
                    {m.title || "제목 없음"}
                  </Text>
                </View>
                <View style={styles.cardHeaderRight}>
                  <TouchableOpacity
                    onPress={() => removeModule(mIndex)}
                    style={styles.deletePill}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.deletePillText}>삭제</Text>
                  </TouchableOpacity>
                  <Text style={styles.cardChevron}>{isOpen ? "⌃" : "⌄"}</Text>
                </View>
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.cardBody}>
                  {/* 강의 제목 입력 */}
                  <Text style={styles.label}>강의 제목</Text>
                  <TextInput
                    value={m.title}
                    onChangeText={(v) => changeModuleTitle(mIndex, v)}
                    placeholder="예) 1강 – 오리엔테이션 & 준비"
                    style={styles.input}
                  />

                  {/* 소주제 리스트 */}
                  <Text style={[styles.label, { marginTop: 12 }]}>소주제</Text>
                  {m.subtopics.map((s, sIndex) => (
                    <View key={`${mIndex}-${sIndex}`} style={styles.itemRow}>
                      <View style={styles.bullet} />
                      <TextInput
                        value={s}
                        onChangeText={(v) => changeSubtopic(mIndex, sIndex, v)}
                        placeholder="소주제 입력"
                        style={[styles.input, styles.itemInput]}
                      />
                      <TouchableOpacity
                        onPress={() => removeSubtopic(mIndex, sIndex)}
                        style={styles.smallGhostBtn}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.smallGhostBtnText}>삭제</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity
                    style={[styles.smallBtn, { marginTop: 8 }]}
                    onPress={() => addSubtopic(mIndex)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.smallBtnText}>+ 소주제 추가</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        {/* 강의 추가 */}
        <TouchableOpacity style={[styles.addModuleBtn]} onPress={addModule} activeOpacity={0.9}>
          <Text style={styles.addModuleText}>+ 강의 추가</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* 하단 저장/취소 등의 추가 버튼이 필요하면 여기 확장 */}
    </SafeAreaView>
  );
};

export default CourseEditorScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7FA" },

  header: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  backIcon: { color: "#FFF", fontSize: 22, fontWeight: "bold" },
  saveText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },

  content: { flex: 1, marginTop: 12 },

  card: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  cardIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    color: "#FFF",
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: 28,
    fontWeight: "700",
    fontSize: 13,
  },
  cardTitlePreview: {
    fontSize: 15,
    color: "#222",
    fontWeight: "700",
    flexShrink: 1,
  },
  cardHeaderRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  deletePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#F3F4FF",
    borderRadius: 999,
  },
  deletePillText: { color: PRIMARY, fontWeight: "700", fontSize: 12 },
  cardChevron: { fontSize: 18, color: "#999" },

  cardBody: { paddingHorizontal: 16, paddingBottom: 16 },

  label: { fontSize: 12, color: "#666", marginBottom: 6 },
  input: {
    backgroundColor: "#F6F7FF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E3E6FF",
    color: "#222",
  },

  itemRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PRIMARY,
    marginRight: 2,
  },
  itemInput: { flex: 1 },

  smallBtn: {
    alignSelf: "flex-start",
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  smallBtnText: { color: "#FFF", fontWeight: "700", fontSize: 12 },

  smallGhostBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#EEF0FF",
  },
  smallGhostBtnText: { color: PRIMARY, fontWeight: "700", fontSize: 12 },

  addModuleBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: "#EEF0FF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E3E6FF",
  },
  addModuleText: { color: PRIMARY, fontWeight: "700" },
});
