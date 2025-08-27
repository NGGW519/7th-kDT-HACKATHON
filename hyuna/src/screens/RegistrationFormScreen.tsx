// src/screens/RequestCreateScreen.tsx
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
  bg: "#F3F3F3",
  text: "#222",
  gray: "#666",
  border: "#E5E6EB",
  placeholder: "#BDBDBD",
  orange: "#FF8A3D",
};

const CATEGORIES = ["전기 · 조명", "수도·배관", "가구 조립", "IT 지원"];

export default function RequestCreateScreen() {
  const nav = useNavigation();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [availableTime, setAvailableTime] = useState("");
  const [contact, setContact] = useState("");
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [catModal, setCatModal] = useState(false);

  const onSubmit = () => {
    // TODO: 서버 전송 로직
    console.log({
      title,
      category,
      location,
      availableTime,
      contact,
      content,
      imageUri,
    });
    // 임시로 뒤로 가기
    // @ts-ignore
    nav.goBack?.();
  };

  // (선택) Expo 사용 시 이미지 업로드 연결 예시:
  // const pickImage = async () => {
  //   const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //   if (status !== "granted") return;
  //   const res = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     quality: 0.8,
  //   });
  //   if (!res.canceled) setImageUri(res.assets[0].uri);
  // };

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity  style={styles.backBtn} onPress={() => nav.goBack()}>
          <Image source={require("../images/back.png")} />
        </TouchableOpacity>
      </View>

      {/* 하얀 패널 */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 32 }}
          bounces={false}
        >
          <View style={styles.panelTopRound} />

          <View style={styles.formWrap}>
            {/* 제목 */}
            <Text style={styles.label}>제목</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="예: 전등 고쳐주실 분 찾습니다"
              placeholderTextColor={COLORS.placeholder}
              style={styles.input}
            />

            {/* 카테고리 (드롭다운 모달) */}
            <Text style={styles.label}>카테고리</Text>
            <TouchableOpacity
              onPress={() => setCatModal(true)}
              style={[styles.input, styles.dropdown]}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !category && { color: COLORS.placeholder },
                ]}
              >
                {category ?? "예: 전기 수리, 소형 가전"}
              </Text>
              <Text style={styles.dropdownArrow}>▾</Text>
            </TouchableOpacity>

            {/* 위치 */}
            <Text style={styles.label}>위치</Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="예: 경남 거제시 고현동"
              placeholderTextColor={COLORS.placeholder}
              style={styles.input}
            />

            {/* 가능한 시간 */}
            <Text style={styles.label}>가능한 시간</Text>
            <TextInput
              value={availableTime}
              onChangeText={setAvailableTime}
              placeholder="예: 평일 오후 6시 이후"
              placeholderTextColor={COLORS.placeholder}
              style={styles.input}
            />

            {/* 연락 가능 수단 */}
            <Text style={styles.label}>연락 가능 수단</Text>
            <TextInput
              value={contact}
              onChangeText={setContact}
              placeholder="예: 010-1234-5678"
              placeholderTextColor={COLORS.placeholder}
              style={styles.input}
              keyboardType="phone-pad"
            />

            {/* 내용 */}
            <Text style={styles.label}>내용</Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="의뢰 내용을 입력해주세요"
              placeholderTextColor={COLORS.placeholder}
              style={[styles.input, styles.textarea]}
              multiline
            />

            {/* 이미지 업로드 박스 */}
            <Text style={styles.label}>이미지 업로드</Text>
            <TouchableOpacity
              // onPress={pickImage} // ← Expo일 때 활성화
              style={styles.uploadBox}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.preview} />
              ) : (
                <Text style={styles.uploadPlaceholder}>+ 이미지 추가</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* 하단 제출 버튼 */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={onSubmit} style={styles.submitBtn}>
            <Text style={styles.submitText}>등록하기</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* 카테고리 선택 모달 */}
      <Modal visible={catModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalBack} onPress={() => setCatModal(false)}>
          <View style={styles.modalSheet}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={styles.modalItem}
                onPress={() => {
                  setCategory(c);
                  setCatModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },

  header: {
    backgroundColor: COLORS.primary,
    height: 80,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingTop: 80,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  backIcon: { color: COLORS.white, fontSize: 18, marginTop: 24 },

  // 상단 둥근 패널
  panelTopRound: {
    height: 24,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 48
  },
  formWrap: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,

  },

  label: {
    marginTop: 10,
    marginBottom: 6,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
  },
  dropdown: { flexDirection: "row", alignItems: "center" },
  dropdownText: { flex: 1, color: COLORS.text, fontSize: 14 },
  dropdownArrow: { color: "#999", fontSize: 16 },

  textarea: {
    height: 110,
    textAlignVertical: "top",
    paddingTop: 10,
  },

  uploadBox: {
    height: 110,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  uploadPlaceholder: { color: COLORS.placeholder, fontSize: 14 },
  preview: { width: "100%", height: "100%", borderRadius: 10, resizeMode: "cover" },

  footer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  submitBtn: {
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: COLORS.white, fontSize: 16, fontWeight: "800" },

  // 카테고리 모달
  modalBack: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    paddingBottom: 24,
    paddingTop: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  modalItemText: { fontSize: 16, color: COLORS.text },
});
