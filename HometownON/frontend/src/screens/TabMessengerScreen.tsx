// MessengerScreen.tsx
import { useNavigation } from "@react-navigation/native";
import React, { useMemo } from "react";
import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

type Chat = {
  id: string;
  name: string;
  subtitle: string;
  time: string;
};

const COLORS = {
  primary: "#6956E5",
  bg: "#F3F3F3",
  white: "#FFFFFF",
  textDark: "#333333",
  textMid: "#545454",
  textGray: "#8C8C8C",
  borderGray: "#E5E6EB",
  cardBorder: "#949BA5",
  offWhite: "#FAFAFC",
};

const today = new Date();

const formattedDate = new Intl.DateTimeFormat("ko-KR", {
  month: "long",    // '9월'
  day: "numeric",   // '2일'
  weekday: "long",  // '화요일'
}).format(today);


import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";

export default function TabMessengerScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const data: Chat[] = useMemo(
    () => [
      { id: "1", name: "이철수", subtitle: "전기 수리", time: "오전 11:48" },
      { id: "2", name: "김영희", subtitle: "재봉틀", time: "08. 22 10:32" },
      { id: "3", name: "박민수", subtitle: "컴퓨터 조립", time: "08. 22 10:32" },
      { id: "4", name: "김채원", subtitle: "전기 수리", time: "08. 22 10:32" },
      { id: "5", name: "이철수", subtitle: "전기 수리", time: "08. 22 10:32" },
    ],
    []
  );

  const renderItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MessengerChatScreen', { chat: { name: item.name, subtitle: item.subtitle } })}>
      <View style={styles.avatar} />
      <View style={styles.cardTextBox}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
      </View>
      <Text style={styles.cardTime}>{item.time}</Text>
    </TouchableOpacity>
  );



  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerDate}>{formattedDate}</Text>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>메신저</Text>
          <TouchableOpacity style={styles.bell}>
            <Image
            source={require("../assets/images/bell.png")} // 프로젝트 안의 이미지
            style={styles.bellDot} />
          </TouchableOpacity>
        </View>
        

        {/* 검색바 */}
        <View style={styles.searchBar}>
          {/* 검색 아이콘 */}
          <Image
            source={require("../assets/images/search.png")} // 프로젝트 안의 이미지
            style={styles.searchIcon}
          />

          {/* 입력창 */}
          <TextInput
            placeholder="검색하기"
            placeholderTextColor="#888888"
            style={styles.searchInput}
          />
        </View>

        {/* 상단 라운드와 컨텐츠 배경 패널 */}
        <View style={styles.panelTopRound} />
        </View>

      {/* 리스트 영역 */}
      <View style={styles.listWrap}>
        <FlatList
          data={data}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 12, gap: 12 }}
          showsVerticalScrollIndicator={false}
        />
      </View>      

      {/* 하단 탭바 */}
      
    </SafeAreaView>
  );
}

function Tab({ iconLabel, active }: { iconLabel: string; active?: boolean }) {
  return (
    <TouchableOpacity style={styles.tabItem}>
      <View
        style={[
          styles.tabIcon,
          { borderColor: active ? COLORS.primary : "#8C8C8C" },
        ]}
      />
      <Text
        style={[
          styles.tabText,
          { color: active ? COLORS.primary : "#8C8C8C" },
        ]}
        numberOfLines={1}
      >
        {iconLabel}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },

  // ----- 헤더(보라 배경) -----
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerDate: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 50,
  },
  headerRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "700",
    paddingTop: 2,
  },
  bell: {
    marginLeft: "auto",
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  bellDot: { color: COLORS.white, fontSize: 12, marginTop: -2 },

  // 검색바
  searchBar: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
    searchIcon: {
      width: 20,
      height: 20,
      marginRight: 8,
      tintColor: "#6956E5",   // ← 이미지 색상 덮어씌우기 (단색 PNG/SVG일 때)
    },
  searchInput: {
    flex: 1,
    color: "#222",
    fontSize: 14,
    paddingVertical: 0,
  },

  // 상단 라운드
  panelTopRound: {
  position: "absolute",
  top: 180,                // 헤더 끝나는 지점보다 살짝 위
  left: 0,
  right: 0,
  height: 30,              // 라운드가 두드러지게 높이 줌
  backgroundColor: "#F3F3F3",
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  zIndex: 10,              // 헤더 위로 오게
},

  // ----- 리스트 컨테이너 -----
  listWrap: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 16,
      paddingTop: 12,   // ← 기존값보다 키우기 (ex: 12 → 28~40)
    marginTop: 24,     // ← 추가 여유 (필요시 0~16)
  },

  // ----- 카드(대화 항목) -----
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    ...(Platform.OS === "android"
      ? { elevation: 4 }
      : {
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 4 },
        }),
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DEDEDE",
    borderWidth: 1,
    borderColor: "#000",
    marginRight: 12,
  },
  cardTextBox: { flex: 1 },
  cardTitle: { color: COLORS.textDark, fontSize: 16, fontWeight: "800" },
  cardSubtitle: {
    marginTop: 2,
    color: COLORS.textMid,
    fontSize: 12,
    fontWeight: "600",
  },
  cardTime: { color: COLORS.textGray, fontSize: 12, marginLeft: 8 },

  // ----- 하단 탭바 -----
  tabbar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.offWhite,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 8,
    paddingBottom: 12,
    ...(Platform.OS === "android"
      ? { elevation: 8 }
      : {
          shadowColor: "#EFF1F4",
          shadowOpacity: 0.3,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: -4 },
        }),
  },
  tabItem: { width: 64, alignItems: "center" },
  tabIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    marginBottom: 4,
  },
  tabText: { fontSize: 11, fontWeight: "500" },
});
