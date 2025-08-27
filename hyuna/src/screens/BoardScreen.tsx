import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
// 상단에 추가
import { useNavigation } from "@react-navigation/native";


import FreeBoardScreen from "./FreeBoardScreen";
import MentorBoardScreen from "./MentorBoardScreen";

const COLORS = {
  primary: "#6956E5",
  white: "#FFFFFF",
  gray: "#666666",
  lightGray: "#B0B0B0",
  bg: "#F4F4F4",
  line: "#BDBDBD",
};

const CATEGORY_ICONS: Record<
  string,
  { icon?: any; label?: any; color?: string; tagBg?: string; tagBorder?: string }
> = {
  "전기 · 조명": {
    icon: require("../images/electric.png"),
    label: require("../images/category_electric.png"),
    color: "#FF6B6B",
    tagBg: "#FFECE8",
    tagBorder: "#FF6B6B",
  },
  "수도·배관": {
    icon: require("../images/water.png"),
    label: require("../images/category_water.png"),
    color: "#3DADF3",
    tagBg: "#EDF3FF",
    tagBorder: "#3DADF3",
  },
  "가구 조립": {
    icon: require("../images/furniture.png"),
    label: require("../images/category_furniture.png"),
    color: "#FFD93D",
    tagBg: "#FFFDF2",
    tagBorder: "#FFD93D",
  },
  "IT 지원": {
    icon: require("../images/it.png"),
    label: require("../images/category_it.png"),
    color: "#A084E8",
    tagBg: "#F7F4FF",
    tagBorder: "#A084E8",
  },
};

type Post = {
  id: string;
  category: keyof typeof CATEGORY_ICONS;
  title: string;
  location: string;
  price: string;
  likes: number;
  comments: number;
  time: string;
  thumbnail?: any;
};

const ALL_POSTS: Post[] = [
  {
    id: "1",
    category: "전기 · 조명",
    title: "전등 고쳐주실 분 찾습니다",
    location: "경남 함안군 가야읍 · 평일 오후 6시 이후",
    price: "50000원",
    likes: 3,
    comments: 8,
    time: "3분 전",
    thumbnail: require("../images/image_1.png"),
  },
  {
    id: "2",
    category: "수도·배관",
    title: "수도가 고장났어요 ㅠㅠ !!",
    location: "경남 거제시 고현동 · 평일 오후 6시 이후",
    price: "50000원",
    likes: 3,
    comments: 8,
    time: "3일 전",
    thumbnail: require("../images/image_2.png"),
  },
  {
    id: "3",
    category: "가구 조립",
    title: "허리가 안좋아서 가구 조립이 어렵..",
    location: "경남 거제시 고현동 · 평일 오후 6시 이후",
    price: "50000원",
    likes: 3,
    comments: 8,
    time: "4시간 전",
    thumbnail: require("../images/image_3.png"),
  },
  {
    id: "4",
    category: "IT 지원",
    title: "새로운 Window 운영체제 어떻게 설치하나요?",
    location: "경남 거제시 고현동 · 평일 오후 6시 이후",
    price: "50000원",
    likes: 3,
    comments: 8,
    time: "5일 전",
  },
];

const FILTERS = ["전체", ...Object.keys(CATEGORY_ICONS)];

const today = new Date();
const dateText = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  weekday: "long",
}).format(today);

export default function BoardScreen() {
  const navigation = useNavigation();
  const [selected, setSelected] = useState("전체");
  const [page, setPage] = useState(1); // 데모용 페이지네이션
  const [activeTab, setActiveTab] = useState("의뢰 게시판"); // New state for active tab

  const filtered = useMemo(() => {
    const base = selected === "전체"
      ? ALL_POSTS
      : ALL_POSTS.filter(p => p.category === selected);
    // 데모용: 페이지당 4개
    const pageSize = 4;
    const start = (page - 1) * pageSize;
    return base.slice(start, start + pageSize);
  }, [selected, page]);

const renderPost = ({ item }: { item: Post }) => {
  const meta = CATEGORY_ICONS[item.category] || {};
  return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('BoardDetail', { post: item })}> 
        {/* 좌측 원형 아이콘 */}
        <View style={styles.leftCol}>
          {meta.icon ? (
            <Image source={meta.icon} style={styles.categoryIcon} />
          ) : (
            <View style={[styles.fallbackCircle, { backgroundColor: meta.color || "#CCC" }]} />
          )}
        </View>

        {/* 중앙 본문 */}
        <View style={styles.cardContent}>
          {/* 카테고리 라벨 */}
          <Image source={meta.label} style={styles.categoryLabel} />

          {/* 제목 / 위치 */}
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.location} numberOfLines={1}>{item.location}</Text>

          {/* 하단 메타 */}
          <View style={styles.infoRow}>
            <View style={styles.metaItem}>
              <Image source={require("../images/reward.png")} style={styles.metaIcon} />
              <Text style={styles.small}>{item.price}</Text>
            </View>
            <View style={styles.metaItem}>
              <Image source={require("../images/heart.png")} style={styles.metaIcon} />
              <Text style={styles.small}>{item.likes}</Text>
            </View>
            <View style={styles.metaItem}>
              <Image source={require("../images/comment.png")} style={styles.metaIcon} />
              <Text style={styles.small}>{item.comments}</Text>
            </View>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        </View>

        {/* 썸네일(있을 때만) */}
        {item.thumbnail ? (
          <Image source={item.thumbnail} style={styles.thumbnail} />
        ) : null}
      </TouchableOpacity>
    );
  };

  // JSX
return (
  <SafeAreaView style={styles.safe}>
    {/* 헤더(보라) */}
    <View style={styles.header}>
      <Text style={styles.headerDate}>{dateText}</Text>
      <Text style={styles.headerTitle}>게시판</Text>
    </View>

    {/* 상단 탭(보라 위) */}
    <View style={styles.tabRow}>
      <TouchableOpacity onPress={() => setActiveTab('의뢰 게시판')} style={{ marginHorizontal: 16 }}>
        <View style={activeTab === '의뢰 게시판' ? styles.activeTabUnderline : null}>
          <Text style={activeTab === '의뢰 게시판' ? styles.tabActive : styles.tab}>의뢰 게시판</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setActiveTab('멘토 게시판')} style={{ marginHorizontal: 16 }}>
        <View style={activeTab === '멘토 게시판' ? styles.activeTabUnderline : null}>
          <Text style={activeTab === '멘토 게시판' ? styles.tabActive : styles.tab}>멘토 게시판</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setActiveTab('자유 게시판')} style={{ marginHorizontal: 16 }}>
        <View style={activeTab === '자유 게시판' ? styles.activeTabUnderline : null}>
          <Text style={activeTab === '자유 게시판' ? styles.tabActive : styles.tab}>자유 게시판</Text>
        </View>
      </TouchableOpacity>
    </View>

    {/* 흰색 패널 시작 (라운드) */}
<View style={styles.contentPanel}>

  {/* 카테고리 필터 (얇은 회색 띠) */}
  {activeTab === "의뢰 게시판" && (
    <View style={styles.filterWrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterBar}
      >
        {FILTERS.map((label) => {
          const active = selected === label;
          return (
            <TouchableOpacity
              key={label}
              onPress={() => { setSelected(label); setPage(1); }}
              style={[
                styles.filterPill,
                active ? styles.filterActive : styles.filterInactive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: active ? "#4F508A" : "#999" },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  )}

  {/* 리스트 */}
  {activeTab === "의뢰 게시판" && (
    <FlatList
      data={filtered}
      keyExtractor={(it) => it.id}
      renderItem={renderPost}
      contentContainerStyle={{ paddingBottom: 100 }}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  )}
  {activeTab === "멘토 게시판" && <MentorBoardScreen />}
  {activeTab === "자유 게시판" && <FreeBoardScreen />}


      {/* 페이지네이션(가운데) + 글쓰기(오른쪽 하단) */}
      {activeTab === "의뢰 게시판" && (
        <View style={styles.bottomRow}>
          <View style={styles.pagination}>
            {[1,2,3,4,5].map((n, index, array) => (
              <>
                <TouchableOpacity key={n} onPress={() => setPage(n)} style={{ paddingHorizontal: 4 }}>
                  <Text style={[styles.pageText, page === n && styles.pageActive]}>{n}</Text>
                </TouchableOpacity>
                {index < array.length - 1 && (
                  <Text style={styles.pageSeparator}>|</Text>
                )}
              </>
            ))}
          </View>

          <TouchableOpacity style={styles.writeBtn} onPress={() => navigation.navigate('RegistrationForm')}>
            <Text style={styles.writeBtnText}>+ 글쓰기</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  </SafeAreaView>
);
}

// STYLES (추가/수정만)
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary }, // 상단 보라 유지

  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 65,
    paddingBottom: 16,
  },
  headerDate: { color: COLORS.white, fontSize: 14, fontWeight: "600" },
  headerTitle: { color: COLORS.white, fontSize: 22, fontWeight: "700", marginTop: 3 },

  tabRow: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 0,
    marginTop: -12,
  },
  tab: { color: COLORS.lightGray, fontSize: 17, fontWeight: "600" },
  tabActive: { color: COLORS.white, fontSize: 17, fontWeight: "600" },
  activeTabUnderline: {
    borderBottomWidth: 3,
    borderBottomColor: "#C9DCFF",
    paddingBottom: 8,
    paddingHorizontal: 8,
  },

 contentPanel: {
  flex: 1,
  backgroundColor: COLORS.white,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  paddingTop: 0,
  paddingHorizontal: 16,
},

  // ← 새로 추가: 얇은 회색 배경 띠 컨테이너
  filterWrap: {
    backgroundColor: COLORS.bg,
    height: 56,                 // 얇게
    justifyContent: "center",
    marginHorizontal: -16,      // 패널 좌우 패딩 무시하고 꽉 차게
    paddingHorizontal: 16,      // 다시 안쪽 여백 부여
    borderTopLeftRadius: 24,         // ← 위쪽만 둥글게
    borderTopRightRadius: 24,
    overflow: "hidden", 
  },

 
  filterBar: {
    paddingVertical: 0,
    alignItems: "center",
  },


  filterPill: {
    height: 32,                 
    paddingHorizontal: 10,
    borderRadius: 14,
    marginRight: 10,
    marginVertical: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  filterInactive: { backgroundColor: "#EEE", borderWidth: 1, borderColor: "#DDD" },
  filterActive:   { backgroundColor: "rgba(79,80,138,0.3)" },
  filterText:     { fontWeight: "700", fontSize: 13 },

  // 카드와의 간격도 얇게 보이도록
  separator: { height: 1, backgroundColor: "#E5E5E5", },

  // 리스트 아이템: 배경 없음, 줄로 구분
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    justifyContent: "flex-start",

  },

  leftCol: { marginRight: 10 },
  categoryIcon: { width: 38, height: 38, resizeMode: "contain" },
  fallbackCircle: { width: 38, height: 38, borderRadius: 19 },

  cardContent: { flex: 1, justifyContent: "flex-start" , alignItems: "flex-start",},
  categoryLabel: { width: 100, height: 26, resizeMode: "contain", marginBottom: 6 },

  tag: {
    borderWidth: 1.2,
    borderRadius: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 6,
  },
  tagText: { fontSize: 13, fontWeight: "700" },

  title: { fontSize: 16, fontWeight: "800", color: "#000" },
  location: { fontSize: 12, color: COLORS.gray, marginTop: 4 },

  infoRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  metaItem: { flexDirection: "row", alignItems: "center", marginRight: 12 },
  metaIcon: { width: 14, height: 14, resizeMode: "contain", marginRight: 4 },
  small: { fontSize: 12, color: COLORS.gray },
  time: { fontSize: 10, color: COLORS.gray, marginLeft: "auto" },

  thumbnail: { width: 82, height: 62, borderRadius: 6, marginLeft: 10 },

  // 하단(중앙 페이지번호 + 오른쪽 글쓰기)
  bottomRow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  pagination: { flexDirection: "row", alignItems: "center" },
  pageText: { fontSize: 13, color: COLORS.gray, marginHorizontal: 4 },
  pageActive: { fontWeight: "700", textDecorationLine: "underline", color : "#000" },
  pageSeparator: { fontSize: 13, color: COLORS.gray, marginHorizontal: 4 },

  writeBtn: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  writeBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
