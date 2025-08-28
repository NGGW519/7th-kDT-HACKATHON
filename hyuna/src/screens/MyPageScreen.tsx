// src/screens/MyPageScreen.tsx
import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import {
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const COLORS = {
  primary: "#6956E5",
  white: "#FFFFFF",
  bg: "#FAFAFA",
  card: "#FFFFFF",
  line: "#E9E9EF",
  text: "#2C2C2C",
  sub: "#8C8C8C",
  orange: "#F88742",
  chipBg: "#F5F1FF",
};

function formatHeaderDate(d = new Date()) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(d);
}

export default function MyPageScreen() {
  const navigation = useNavigation();
  const [fontSize, setFontSize] = useState<"basic" | "large">("basic");
  const dateText = useMemo(() => formatHeaderDate(), []);

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerDate}>{dateText}</Text>
        <Text style={styles.headerTitle}>마이페이지</Text>
        <View pointerEvents="none" style={styles.panelTopRound} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* 프로필 카드 */}
        {/* 카드 그룹: 헤더 + 본문 */}
                <View style={styles.profileCard}>
                  {/* 주황 헤더 띠 */}
                  <View style={styles.profileCardTop}>
                    <Text style={styles.profileCardTopText}>내 정보</Text>
                  </View>

          <View style={styles.profileBody}>
            <View style={styles.avatar} />
            <Text style={styles.name}>이철수 멘토</Text>
            <Text style={styles.subtitle}>전문 분야: 전기 수리</Text>

            <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfileScreen' as never)}>
              <Text style={styles.editBtnText}>수정하기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 구분선 */}
        <View style={styles.sectionDivider} />
        
        <View style={styles.thinDivider} />

        {/* 글씨 크기 */}
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowIcon}>
                <Image source={require("../images/font_size.png")} />
            </Text>
            <Text style={styles.rowTitle}>글씨 크기</Text>
          </View>

          <View style={styles.segment}>
            <Pressable
              onPress={() => setFontSize("basic")}
              style={[styles.segmentBtn, fontSize === "basic" && styles.segmentBtnActive]}
            >
              <Text style={[styles.segmentText, fontSize === "basic" && styles.segmentTextActive]}>
                기본
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setFontSize("large")}
              style={[styles.segmentBtn, fontSize === "large" && styles.segmentBtnActive]}
            >
              <Text style={[styles.segmentText, fontSize === "large" && styles.segmentTextActive]}>
                크게
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.thinDivider} />

        {/* 공지사항 */}
        <Pressable style={styles.row} onPress={() => {}}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowIcon}>
                <Image source={require("../images/megaphone.png")} />
            </Text>
            <Text style={styles.rowTitle}>공지사항</Text>
          </View>
        </Pressable>


        {/* 앱 정보 */}
        <Pressable style={styles.row} onPress={() => {}}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowIcon}>
                <Image source={require("../images/information.png")} />
            </Text>
            <Text style={styles.rowTitle}>앱 정보</Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
    position: "relative",

  },
  headerDate: { color: "#EDE6FF", fontSize: 13, marginBottom: 12 },
  headerTitle: { color: COLORS.white, fontSize: 22, fontWeight: "800" },

  // 상단 라운드 패널 커브
  panelTopRound: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -16,
    height: 30,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  scroll: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: 16, paddingBottom: 40 },

  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.orange,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    marginHorizontal: 30,
  },
  profileCardTop: {
    backgroundColor: COLORS.orange,
        borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13,
    paddingVertical: 10,
    alignItems: "center",
  },
  profileCardTopText: { color: COLORS.white, fontSize: 20, fontWeight: "800" },

  profileBody: { padding: 18, alignItems: "center" },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#D9D9D9",
    marginBottom: 14,
  },
  name: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.sub, marginTop: 4, marginBottom: 14 },

  editBtn: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  editBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },

  sectionDivider: {
    height: 16,
  },

  row: {
    paddingVertical: 14,
    paddingHorizontal: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: { flexDirection: "row", alignItems: "center" },
  rowIcon: { width: 26, textAlign: "center", fontSize: 16, color: COLORS.text, marginRight: 16, marginTop: 10 },
  rowTitle: { fontSize: 18, color: COLORS.text , marginTop: 10},

  thinDivider: { height: 2, backgroundColor: COLORS.line, marginHorizontal: 0, marginTop : 16 },

  segment: {
    flexDirection: "row",
    backgroundColor: "#F2F2F7",
    borderRadius: 999,
    padding: 3,
  },
  segmentBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginHorizontal: 2,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  segmentText: { fontSize: 16, color: COLORS.sub, fontWeight: "600" },
  segmentTextActive: { color: COLORS.text },

});
