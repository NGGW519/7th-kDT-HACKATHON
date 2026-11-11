// src/screens/JobsScreen.tsx
import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  primary: "#6956E5",
  white: "#FFFFFF",
  bg: "#FAFAFA",
  panel: "#FFFFFF",
  text: "#2C2C2C",
  sub: "#8C8C8C",
  line: "#E9E9EF",
  chipWaitBg: "#EEEFFD",
  chipWaitBorder: "#E2E2F4",
  chipWaitText: "#6956E5",
  chipRunBg: "#E8F6FF",
  chipRunBorder: "#D6EAFE",
  chipRunText: "#2A7AC3",
  chipDoneBg: "#E7F8ED",
  chipDoneBorder: "#CDEFD8",
  chipDoneText: "#2E9C62",
  orange: "#F88742",
};

type Status = "대기" | "진행중" | "완료";
type Item = { id: string; name: string; category: string; status: Status };

function formatHeaderDate(d = new Date()) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(d);
}

export default function RequestStatusScreen() {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<"received" | "mine" | "inbox">("received");
  const dateText = useMemo(() => formatHeaderDate(), []);

  // ---- 목데이터 (API 연결 전까지) ----
  const received: Item[] = [
    { id: "r1", name: "김민수", category: "전기 · 조명", status: "대기" },
    { id: "r2", name: "박지현", category: "수도 · 배관", status: "진행중" },
    { id: "r3", name: "이서윤", category: "가구 조립", status: "완료" },
  ];
  const mine: Item[] = [
    { id: "m1", name: "우리집", category: "전기 · 조명", status: "진행중" },
    { id: "m2", name: "사무실", category: "가전/전자", status: "대기" },
  ];
  // 받은 연락: 다른 페이지 질문/채팅 수신으로 가정
  const inbox: Item[] = [
    { id: "i1", name: "홍길동", category: "게시판 질문", status: "대기" },
    { id: "i2", name: "이정민", category: "메신저 채팅", status: "대기" },
    { id: "i3", name: "권하늘", category: "게시판 질문", status: "완료" },
  ];

  const summary = {
    receivedNew: received.filter((x) => x.status === "대기").length,
    mineRunning: mine.filter((x) => x.status === "진행중").length,
    doneThisMonth:
      received.concat(mine, inbox).filter((x) => x.status === "완료").length,
    inboxNeedReply: inbox.filter((x) => x.status !== "완료").length,
  };

  const dataByTab = tab === "received" ? received : tab === "mine" ? mine : inbox;

  const reply = (item: Item) => {
    // 🔸메신저로 이동 (현재 App.tsx 구조 기준)
    navigation.navigate("MessengerTab", {
      screen: "MessengerChatScreen",
      params: { chat: { name: item.name, subtitle: item.category } },
      fromTab: "Jobs",
    });

    // 🔹BoardStack의 ChatDetail로 보내고 싶다면 아래로 교체:
    // navigation.navigate("Board", {
    //   screen: "ChatDetail",
    //   params: { chat: { name: item.name, subtitle: item.category } },
    // });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={{ marginLeft: 8 }}>
          <Text style={styles.headerDate}>{dateText}</Text>
          <Text style={styles.headerTitle}>의뢰 현황</Text>
        </View>
        <View pointerEvents="none" style={styles.panelTopRound} />
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: COLORS.panel }} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* 요약 카드 */}
        <View style={styles.cards}>
          <SummaryCard
            title="받은 신청"
            subtitle={`신규 ${summary.receivedNew}건`}
            value={summary.receivedNew}
            titleColor={COLORS.text}
          />
          <SummaryCard
            title="나의 의뢰"
            subtitle={`진행중 ${summary.mineRunning}건`}
            value={summary.mineRunning}
            titleColor={COLORS.text}
          />
          <SummaryCard
            title="완료 내역"
            subtitle={`이번 달 ${summary.doneThisMonth}건`}
            value={summary.doneThisMonth}
            titleColor={COLORS.chipDoneText}
          />
          <SummaryCard
            title="받은 연락"
            subtitle={`답장 필요 ${summary.inboxNeedReply}건`}
            value={summary.inboxNeedReply}
            titleColor={COLORS.orange}
          />
        </View>

        {/* 세그먼트 탭 */}
        <View style={styles.segmentWrap}>
          <Segment tab={tab} setTab={setTab} />
        </View>

        {/* 리스트 */}
        <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
          {dataByTab.map((it) => (
            <ListItem key={it.id} item={it} onReply={reply} />
          ))}
          {dataByTab.length === 0 && (
            <View style={styles.empty}>
              <Text style={{ color: COLORS.sub, fontSize: 13 }}>표시할 항목이 없습니다.</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

/* ------- 작은 컴포넌트들 ------- */

function SummaryCard({
  title,
  subtitle,
  value,
  titleColor,
}: {
  title: string;
  subtitle: string;
  value: number;
  titleColor?: string;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardIcon} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.cardTitle, titleColor && { color: titleColor }]}>{title}</Text>
        <Text style={styles.cardSub}>{subtitle}</Text>
      </View>
      <Text style={[styles.cardValue, titleColor && { color: titleColor }]}>{value}</Text>
    </View>
  );
}

function Segment({
  tab,
  setTab,
}: {
  tab: "received" | "mine" | "inbox";
  setTab: (t: "received" | "mine" | "inbox") => void;
}) {
  return (
    <View style={styles.segment}>
      <Pressable
        onPress={() => setTab("received")}
        style={[styles.segmentBtn, tab === "received" && styles.segmentBtnActive]}
      >
        <Text style={[styles.segmentText, tab === "received" && styles.segmentTextActive]}>받은 신청</Text>
      </Pressable>
      <Pressable
        onPress={() => setTab("mine")}
        style={[styles.segmentBtn, tab === "mine" && styles.segmentBtnActive]}
      >
        <Text style={[styles.segmentText, tab === "mine" && styles.segmentTextActive]}>나의 의뢰</Text>
      </Pressable>
      <Pressable
        onPress={() => setTab("inbox")}
        style={[styles.segmentBtn, tab === "inbox" && styles.segmentBtnActive]}
      >
        <Text style={[styles.segmentText, tab === "inbox" && styles.segmentTextActive]}>받은 연락</Text>
      </Pressable>
    </View>
  );
}

function ListItem({ item, onReply }: { item: Item; onReply: (i: Item) => void }) {
  const chipStyle =
    item.status === "대기"
      ? {
          bg: COLORS.chipWaitBg,
          border: COLORS.chipWaitBorder,
          text: COLORS.chipWaitText,
          w: 46,
        }
      : item.status === "진행중"
      ? {
          bg: COLORS.chipRunBg,
          border: COLORS.chipRunBorder,
          text: COLORS.chipRunText,
          w: 58,
        }
      : {
          bg: COLORS.chipDoneBg,
          border: COLORS.chipDoneBorder,
          text: COLORS.chipDoneText,
          w: 46,
        };

  return (
    <View style={styles.item}>
      <View style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemSub}>{item.category}</Text>
      </View>

      {/* 상태칩 */}
      <View style={[styles.chip, { backgroundColor: chipStyle.bg, borderColor: chipStyle.border, width: chipStyle.w }]}>
        <Text style={[styles.chipText, { color: chipStyle.text }]}>{item.status}</Text>
      </View>

      {/* 답장 버튼 */}
      <TouchableOpacity style={styles.replyBtn} onPress={() => onReply(item)}>
        <Text style={styles.replyText}>답장하기</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ------- styles ------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },

  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 16,
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF33",
    alignItems: "center",
    justifyContent: "center",
  },
  headerDate: { color: "#EDE6FF", fontSize: 13 , marginBottom: 8},
  headerTitle: { color: COLORS.white, fontSize: 22, fontWeight: "800", marginBottom: 8 },
  panelTopRound: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -16,
    height: 30,
    backgroundColor: COLORS.panel,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  cards: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "48%",
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: "#F3F3F8",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EAEAF6",
    marginRight: 10,
  },
  cardTitle: { color: COLORS.text, fontSize: 13, fontWeight: "700" },
  cardSub: { color: COLORS.sub, fontSize: 12, marginTop: 4 },
  cardValue: { color: COLORS.primary, fontSize: 18, fontWeight: "800" },

  segmentWrap: { paddingHorizontal: 16, marginTop: 12 },
  segment: {
    flexDirection: "row",
    backgroundColor: "#F2F2F7",
    borderRadius: 999,
    padding: 4,
    alignItems: "center",
    justifyContent: "space-between",
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 999,
    alignItems: "center",
  },
  segmentBtnActive: {
    backgroundColor: COLORS.panel,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  segmentText: { color: COLORS.sub, fontSize: 13, fontWeight: "600" },
  segmentTextActive: { color: COLORS.text, fontWeight: "800" },

  item: {
    backgroundColor: COLORS.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F3F8",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#D9D9D9", marginRight: 10 },
  itemTitle: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
  itemSub: { color: COLORS.sub, fontSize: 12, marginTop: 2 },

  chip: {
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  chipText: { fontSize: 11, fontWeight: "700" },

  replyBtn: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: COLORS.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  replyText: { color: COLORS.white, fontSize: 13, fontWeight: "800" },

  empty: {
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },

  footerHint: {
    marginTop: 10,
    marginHorizontal: 16,
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.bg,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  footerDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: "#EAEAF6", marginRight: 8 },
  footerText: { color: COLORS.sub, fontSize: 12 },
});
