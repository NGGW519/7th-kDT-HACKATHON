// src/ChatDetailScreen.tsx
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
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
  panel: "#FFFFFF",
  chipBg: "#EAEAF6",
  bubbleMe: "#4F49A9",
  bubbleOther: "#EDEDED",
  textDark: "#2C2C2C",
  textGray: "#8C8C8C",
};

type Msg = {
  id: string;
  text: string;
  isMe: boolean;
  ts: number;
  type?: "date";
  dateLabel?: string;
};

function formatTime(ts: number) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(ts));
}
function formatFullDate(ts: number) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(ts));
}

/** 날짜 비교 & 날짜칩/메시지 존재 여부 */
function isSameDay(a: number, b: number) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}
function hasMessageForDate(msgs: Msg[], ts: number) {
  return msgs.some((m) => m.type !== "date" && isSameDay(m.ts, ts));
}
function hasDateChipForDate(msgs: Msg[], ts: number) {
  return msgs.some((m) => m.type === "date" && isSameDay(m.ts, ts));
}

export default function ChatDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();

  // BoardScreen 에서 넘겨오는 값들 고려
  const recipient: string =
    route.params?.recipient ||
    route.params?.title ||
    route.params?.chat?.name ||
    "대화상대";
  const requestTitle: string =
    route.params?.requestTitle || route.params?.chat?.subtitle || "";

  // 초기 메시지는 비워두고, 보낼 때 해당 날짜의 첫 메시지면 날짜칩 삽입
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");

  const listRef = useRef<FlatList<Msg>>(null);

  useEffect(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, [messages.length]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const ts = Date.now();

    setMessages((prev) => {
      const arr = [...prev];

      // 오늘 일반 메시지가 없고 + 오늘 날짜칩도 없으면 날짜칩 먼저 생성
      const needDateChip = !hasMessageForDate(arr, ts) && !hasDateChipForDate(arr, ts);
      if (needDateChip) {
        arr.push({
          id: `date-${ts}`,
          text: "",
          isMe: false,
          ts,
          type: "date",
          dateLabel: formatFullDate(ts),
        });
      }

      // 내 메시지 추가
      arr.push({ id: `me-${ts}`, text, isMe: true, ts });
      return arr;
    });

    setInput("");
  };

  const renderItem = ({ item }: { item: Msg }) => {
    if (item.type === "date") {
      return (
        <View style={styles.dateChip}>
          <Text style={styles.dateChipText}>{item.dateLabel}</Text>
        </View>
      );
    }

    const isMe = item.isMe;
    return (
      <View style={[styles.row, { justifyContent: isMe ? "flex-end" : "flex-start" }]}>
        {/* 왼쪽 말풍선 (상대) */}
        {!isMe && (
          <View style={styles.leftWrap}>
            <View style={styles.tailLeft} />
            <View style={[styles.bubble, styles.bubbleOther]}>
              <Text style={styles.bubbleOtherText}>{item.text}</Text>
            </View>
            <Text style={styles.timeLeft}>{formatTime(item.ts)}</Text>
          </View>
        )}

        {/* 오른쪽 말풍선 (나) */}
        {isMe && (
          <View style={styles.rightWrap}>
            <Text style={styles.timeRight}>{formatTime(item.ts)}</Text>
            <View style={[styles.bubble, styles.bubbleMe]}>
              <Text style={styles.bubbleMeText}>{item.text}</Text>
            </View>
            <View style={styles.tailRight} />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Image source={require("../../../assets/images/back.png")} />
        </TouchableOpacity>

        <View style={styles.headerAvatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{recipient}</Text>
          {!!requestTitle && <Text style={styles.headerSubtitle}>{requestTitle}</Text>}
        </View>

        <Pressable style={[styles.headerBtn, { backgroundColor: "#FFFFFF33" }]}>
          <Image source={require("../../../assets/images/bell.png")} />
        </Pressable>

        {/* 라운드 오버레이 (상단 패널 곡률 유지) */}
        <View pointerEvents="none" style={styles.panelTopRound} />
      </View>

      {/* 본문 */}
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: COLORS.panel }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* 입력 바 */}
        <View style={styles.inputBar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="채팅을 입력해주세요"
            placeholderTextColor="#A0A0A0"
            style={styles.input}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={send}>
            <Image source={require("../../../assets/images/chat_message.png")} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------------- styles ---------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },

  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 65,
    paddingBottom: 32,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF33",
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#DEDEDE",
    borderWidth: 1,
    borderColor: "#000",
    marginHorizontal: 10,
  },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "800" },
  headerSubtitle: { color: "#E9E5FF", fontSize: 12, marginTop: 2 },

  panelTopRound: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -16,
    height: 30,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 10,
  },

  listContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: COLORS.panel,
  },

  dateChip: {
    alignSelf: "center",
    backgroundColor: COLORS.chipBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  dateChipText: { color: "#6C6C8A", fontSize: 12, fontWeight: "600" },

  row: { width: "100%", flexDirection: "row", alignItems: "flex-end", marginBottom: 8 },

  leftWrap: { flexDirection: "row", alignItems: "flex-end", maxWidth: "85%" },
  rightWrap: { flexDirection: "row", alignItems: "flex-end", maxWidth: "85%" },

  bubble: { maxWidth: "80%", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14 },
  bubbleOther: { backgroundColor: COLORS.bubbleOther },
  bubbleOtherText: { color: COLORS.textDark, fontSize: 14 },
  bubbleMe: { backgroundColor: COLORS.bubbleMe },
  bubbleMeText: { color: "#fff", fontSize: 14 },

  // 꼬리
  tailLeft: {
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderRightWidth: 10,
    borderBottomWidth: 8,
    borderStyle: "solid",
    backgroundColor: "transparent",
    borderTopColor: "transparent",
    borderRightColor: COLORS.bubbleOther, // 왼쪽 말풍선 색
    borderBottomColor: "transparent",
    marginRight: -2,
    alignSelf: "flex-end",
  },
  tailRight: {
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderLeftWidth: 10,
    borderBottomWidth: 8,
    borderStyle: "solid",
    backgroundColor: "transparent",
    borderTopColor: "transparent",
    borderLeftColor: COLORS.bubbleMe, // 오른쪽 말풍선 색
    borderBottomColor: "transparent",
    marginLeft: -2,
    alignSelf: "flex-end",
  },

  timeLeft: { color: COLORS.textGray, fontSize: 11, marginLeft: 6 },
  timeRight: { color: COLORS.textGray, fontSize: 11, marginRight: 6 },

  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.panel,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#F1F1F1",
    borderRadius: 10,
    paddingHorizontal: 12,
    color: "#222",
  },
  sendBtn: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
