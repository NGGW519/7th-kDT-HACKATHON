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
  View
} from "react-native";

const COLORS = {
  primary: "#6956E5",
  white: "#FFFFFF",
  bg: "#F3F3F3",
  panel: "#FFFFFF",
  chipBg: "#EAEAF6",
  bubbleMe: "#6956E5",
  bubbleOther: "#FFF",
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
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(ts));
}
function formatFullDate(ts: number) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(ts));
}

export default function ChatDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const peer =
    route.params?.chat ?? { name: "이철수 멘토", subtitle: "전문 분야: 전기 수리" };

  const now = Date.now();
  const dateLabel = formatFullDate(now);

  const [messages, setMessages] = useState<Msg[]>([
    { id: "d1", text: "", isMe: false, ts: now, type: "date", dateLabel },
    { id: "m1", text: "안녕하세요 전등 수리 글 보고 연락드려요..", isMe: false, ts: now - 1000 * 60 * 30 },
    { id: "m2", text: "네 안녕하세요~ 혹시 언제쯤 가능하신가요?", isMe: true, ts: now - 1000 * 60 * 20 },
    { id: "m3", text: "내일 오후 3시 어떠세요?", isMe: false, ts: now - 1000 * 60 * 10 }
  ]);
  const [input, setInput] = useState("");

  const listRef = useRef<FlatList<Msg>>(null);
  useEffect(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, [messages.length]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const ts = Date.now();
    setMessages((prev) => [...prev, { id: `me-${ts}`, text, isMe: true, ts }]);
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
        {/* 내 메시지 (오른쪽) */}
        {isMe && (
          <View style={styles.msgWrap}>
            <Text style={[styles.messageTime, styles.timeLeft]}>
              {formatTime(item.ts)}
            </Text>
            <View style={[styles.messageBubble, styles.myBubble]}>
              <Text style={[styles.messageText, styles.myMessageText]}>{item.text}</Text>
            </View>
          </View>
        )}
        {/* 상대 메시지 (왼쪽) */}
        {!isMe && (
          <View style={styles.msgWrap}>
            <View style={[styles.messageBubble, styles.otherBubble]}>
              <Text style={[styles.messageText, styles.otherMessageText]}>{item.text}</Text>
            </View>
            <Text style={[styles.messageTime, styles.timeRight]}>
              {formatTime(item.ts)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Image source={require("../../assets/images/back.png")} />
        </TouchableOpacity>

        <View style={styles.headerAvatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{peer.name}</Text>
          <Text style={styles.headerSubtitle}>{peer.subtitle}</Text>
        </View>

        <Pressable style={[styles.headerBtn, { backgroundColor: "#FFFFFF33" }]}>
          <Image source={require("../../assets/images/bell.png")} />
        </Pressable>

        <View pointerEvents="none" style={styles.panelTopRound} />
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#F8F9FA" }} // ✅ 전체 메시지 영역 배경 통일
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          style={{ backgroundColor: "#F8F9FA" }}     // ✅ 리스트 자체 배경도 통일
          contentContainerStyle={styles.listContent} // ✅ flexGrow로 아래 여백까지 채움
          showsVerticalScrollIndicator={false}
        />

        {/* Input */}
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
            <Image source={require("../../assets/images/chat_message.png")} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },

  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 65,
    paddingBottom: 32,
    flexDirection: "row",
    alignItems: "center",
    position: "relative"
  },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF33",
    alignItems: "center",
    justifyContent: "center"
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#DEDEDE",
    borderWidth: 1,
    borderColor: "#000",
    marginHorizontal: 10
  },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "800" },
  headerSubtitle: { color: "#E9E5FF", fontSize: 12, marginTop: 2 },
  panelTopRound: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -16,
    height: 30,
    backgroundColor: "#F8F9FA",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 10
  },

  listContent: {
    flexGrow: 1,                 // ✅ 내용이 적어도 화면 끝까지 채움
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#F8F9FA"
  },

  dateChip: {
    alignSelf: "center",
    backgroundColor: COLORS.chipBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12
  },
  dateChipText: { color: "#6C6C8A", fontSize: 12, fontWeight: "600" },

  row: {
    width: "100%",
    flexDirection: "row",
    marginBottom: 12,
    backgroundColor: "#F8F9FA",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 8,
  },

  msgWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    maxWidth: "85%"
  },

  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20
  },
  myBubble: { backgroundColor: COLORS.bubbleMe },
  otherBubble: {
    backgroundColor: COLORS.bubbleOther,
    borderWidth: 1,
    borderColor: "#E0E0E0"
  },
  messageText: { fontSize: 14, lineHeight: 20 },
  myMessageText: { color: "#FFF" },
  otherMessageText: { color: "#333" },

  messageTime: { fontSize: 11, color: "#999" },
  timeLeft: { marginRight: 6 },
  timeRight: { marginLeft: 6 },

  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF"
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    paddingHorizontal: 12,
    color: "#222"
  },
  sendBtn: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center"
  }
});
