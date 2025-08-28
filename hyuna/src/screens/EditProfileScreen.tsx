// src/screens/RegistrationFormScreen.tsx
import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  primary: "#6956E5",
  white: "#FFFFFF",
  card: "#FFFFFF",
  line: "#E9E9EF",
  text: "#2C2C2C",
  sub: "#8C8C8C",
  placeholder: "#B9B9C2",
  inputBorder: "#E7E7ED",
  orange: "#F88742",
  bg: "#FAFAFA",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

function SelectField({
  value,
  placeholder,
  onPress,
}: {
  value?: string;
  placeholder?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.selectField}>
      <Text style={[styles.inputText, !value && { color: COLORS.placeholder }]}>
        {value || placeholder}
      </Text>
      <Text style={styles.caret}>▾</Text>
    </Pressable>
  );
}

export default function RegistrationFormScreen() {
  const navigation = useNavigation();

  // 폼 상태
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [specialty, setSpecialty] = useState("");
  const [intro, setIntro] = useState("");
  const [regionTime, setRegionTime] = useState("");
  const [method, setMethod] = useState<string | undefined>();
  const [note, setNote] = useState("");

  // 드롭다운 모달 상태
  const [openCategory, setOpenCategory] = useState(false);
  const [openMethod, setOpenMethod] = useState(false);

  const dateText = useMemo(
    () =>
      new Intl.DateTimeFormat("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "long",
      }).format(new Date()),
    []
  );

  const categoryOptions = [
    "전기·조명",
    "수도·배관",
    "가구 조립",
    "도배·장판",
    "가전/전자",
    "기타",
  ];
  const methodOptions = ["대면", "전화", "문자", "화상(Zoom)", "채팅"];

  const onSave = () => {
    // TODO: 서버 저장 로직
    // 필요한 필드 유효성 체크 후 저장하세요.
    // 여기서는 단순히 뒤로 가기만 처리
    navigation.goBack();
  };

  const canSave = name.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Image source={require("../images/back.png")} />
        </TouchableOpacity>


        {/* 상단 라운드 */}
        <View pointerEvents="none" style={styles.panelTopRound} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: COLORS.white }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 6 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* 성함 */}
          <SectionLabel>성함</SectionLabel>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="이름을 입력하세요"
            placeholderTextColor={COLORS.placeholder}
            style={styles.input}
            returnKeyType="next"
          />

          {/* 카테고리 */}
          <SectionLabel style={{ marginTop: 14 }}>카테고리</SectionLabel>
          <SelectField
            value={category}
            placeholder="예: 전기·조명, 수도·배관"
            onPress={() => setOpenCategory(true)}
          />

          {/* 전문 분야 */}
          <SectionLabel style={{ marginTop: 14 }}>전문 분야</SectionLabel>
          <TextInput
            value={specialty}
            onChangeText={setSpecialty}
            placeholder="예: 전기 수리"
            placeholderTextColor={COLORS.placeholder}
            style={styles.input}
            returnKeyType="next"
          />

          {/* 자기 소개 */}
          <SectionLabel style={{ marginTop: 14 }}>자기 소개</SectionLabel>
          <TextInput
            value={intro}
            onChangeText={setIntro}
            placeholder="간단한 소개를 입력하세요"
            placeholderTextColor={COLORS.placeholder}
            style={[styles.input, styles.textarea]}
            multiline
            textAlignVertical="top"
          />

          {/* 지역 및 활동 가능한 시간 */}
          <SectionLabel style={{ marginTop: 14 }}>지역 및 활동 가능 시간</SectionLabel>
          <TextInput
            value={regionTime}
            onChangeText={setRegionTime}
            placeholder="예: 경남 함안군 / 월, 수, 금 오후 2시~5시"
            placeholderTextColor={COLORS.placeholder}
            style={styles.input}
            returnKeyType="next"
          />

          {/* 멘토링 방식 */}
          <SectionLabel style={{ marginTop: 14 }}>멘토링 방식</SectionLabel>
          <SelectField
            value={method}
            placeholder="대면 / 전화 / 문자"
            onPress={() => setOpenMethod(true)}
          />

          {/* 유의사항 */}
          <SectionLabel style={{ marginTop: 14 }}>유의사항 (선택)</SectionLabel>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="필요 시 작성해주세요"
            placeholderTextColor={COLORS.placeholder}
            style={styles.input}
          />
        </ScrollView>

        {/* 하단 고정 버튼 */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.saveBtn, !canSave && { opacity: 0.5 }]}
            onPress={onSave}
            disabled={!canSave}
          >
            <Text style={styles.saveBtnText}>저장하기</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* 카테고리 모달 */}
      <Modal visible={openCategory} transparent animationType="fade" onRequestClose={() => setOpenCategory(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpenCategory(false)}>
          <Pressable style={styles.modalSheet}>
            <Text style={styles.modalTitle}>카테고리 선택</Text>
            {categoryOptions.map((opt) => (
              <Pressable
                key={opt}
                style={styles.modalItem}
                onPress={() => {
                  setCategory(opt);
                  setOpenCategory(false);
                }}
              >
                <Text style={styles.modalItemText}>{opt}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* 멘토링 방식 모달 */}
      <Modal visible={openMethod} transparent animationType="fade" onRequestClose={() => setOpenMethod(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpenMethod(false)}>
          <Pressable style={styles.modalSheet}>
            <Text style={styles.modalTitle}>멘토링 방식</Text>
            {methodOptions.map((opt) => (
              <Pressable
                key={opt}
                style={styles.modalItem}
                onPress={() => {
                  setMethod(opt);
                  setOpenMethod(false);
                }}
              >
                <Text style={styles.modalItemText}>{opt}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },

  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 16,
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF26",
    alignItems: "center",
    justifyContent: "center",
  },
  headerDate: { color: "#EDE6FF", fontSize: 13, fontWeight: "600" },

  panelTopRound: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -16,
    height: 32,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  scroll: { flex: 1, backgroundColor: COLORS.white },

  label: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "700",
    marginBottom: 8,
  },

  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 12,
    backgroundColor: COLORS.card,
    color: COLORS.text,
    marginBottom: 16,

  },
  inputText: {
    fontSize: 14,
    color: COLORS.text,
  },
  textarea: {
    minHeight: 96,
    paddingTop: 10,
  },

  selectField: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  caret: { fontSize: 18, color: COLORS.sub, marginLeft: 8 },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  saveBtn: {
    height: 48,
    borderRadius: 10,
    backgroundColor: COLORS.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "800" },

  // 모달
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  modalSheet: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
    paddingTop: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#F4F4F8",
  },
  modalItemText: { fontSize: 15, color: COLORS.text },
});
