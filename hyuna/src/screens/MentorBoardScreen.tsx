// MentorBoardScreen.tsx
import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
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
  gray: "#666666",
  lightGray: "#B0B0B0",
  bg: "#F4F4F4",
  line: "#BDBDBD",
  orange : "#F88742"
};

const CATEGORY_ICONS: Record<
  string,
  { icon?: any; label?: any; color?: string; tagBg?: string; tagBorder?: string }
> = {
  "전기 · 조명": {
    icon: require("../images/electric.png"),
    label: require("../images/category_electric.png"),

  },
  "수도·배관": {
    icon: require("../images/water.png"),
    label: require("../images/category_water.png"),
  },
  "가구 조립": {
    icon: require("../images/furniture.png"),
    label: require("../images/category_furniture.png"),
  },
  "IT 지원": {
    icon: require("../images/it.png"),
    label: require("../images/category_it.png"),
  },
};

type Post = {
  id: string;
  category: keyof typeof CATEGORY_ICONS;
  name: string;       // 멘토 이름
  detail: string;     // 전문/설명
  method: string;     // 방식 (대면/비대면 등)
  comments: number;
  time: string;
  rating: number;
};

const ALL_POSTS: Post[] = [
  {
    id: "1",
    category: "전기 · 조명",
    name: "이철수",
    detail: "전기 수리",
    method: "대면",
    comments: 8,
    time: "3분 전",
    rating : 4.8

  },
  {
    id: "2",
    category: "수도·배관",
    name: "김수정",
    detail: "배관 점검",
    method: "대면",
    comments: 5,
    time: "3일 전",
    rating : 4.5
  },
  {
    id: "3",
    category: "가구 조립",
    name: "박도현",
    detail: "가구 조립/설치",
    method: "비대면 상담 가능",
    comments: 12,
    time: "4시간 전",
    rating : 4.7
  },
  {
    id: "4",
    category: "IT 지원",
    name: "최나래",
    detail: "PC/OS 설정, 네트워크",
    method: "원격/대면",
    comments: 2,
    time: "5일 전",
    rating : 4.9
  },
];

const FILTERS = ["전체", ...Object.keys(CATEGORY_ICONS)];

export default function MentorBoardScreen() {
  const navigation = useNavigation();
  const [selected, setSelected] = useState("전체");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const base =
      selected === "전체" ? ALL_POSTS : ALL_POSTS.filter((p) => p.category === selected);
    const pageSize = 4;
    const start = (page - 1) * pageSize;
    return base.slice(start, start + pageSize);
  }, [selected, page]);

  const renderPost = ({ item }: { item: Post }) => {
    const meta = CATEGORY_ICONS[item.category] || {};
    return (
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate("MentorDetail" as never, { post: item } as never)}
      >
        {/* 좌측 원형 아이콘 */}
        <View style={styles.leftCol}>
            <Image source={require("../images/vector.png")} style={styles.Icon} />
        </View>

        {/* 중앙 본문 */}
        <View style={styles.cardContent}>
          {/* 카테고리 라벨 */}
          {!!meta.label && <Image source={meta.label} style={styles.categoryLabel} />}

          {/* 멘토 이름 / 전문 */}
          <Text style={styles.title} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.location} numberOfLines={1}>
            {"전문 분야 : "}{item.detail}
          </Text>

          {/* 하단 메타: 방식/댓글/시간 */}
          <View style={styles.infoRow}>
            <View style={styles.metaItem}>
              <Text style={styles.small}>{"방식 : "}{item.method}</Text>
            </View>
            <View style={styles.metaItem}>
              <Image source={require("../images/comment.png")} style={styles.metaIcon} />
              <Text style={styles.small}>{item.comments}</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <Text style={styles.rating}>{`⭐ ${item.rating ?? "0.0"}`}</Text>
            <TouchableOpacity style={styles.applyBtn} onPress={() => Alert.alert('신청되었습니다')}>
              <Text style={styles.applyBtnText}>신청하기</Text>
            </TouchableOpacity>
          </View>
          
        </View>
      
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.contentPanel}>
        {/* 카테고리 필터 */}
        <View style={styles.filterWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterBar}
          >
            {FILTERS.map((label) => {
              const active = selected === label;
              return (
                <Pressable
                  key={label}
                  onPress={() => {
                    setSelected(label);
                    setPage(1);
                  }}
                  style={[styles.filterPill, active ? styles.filterActive : styles.filterInactive]}
                >
                  <Text style={[styles.filterText, { color: active ? "#4F508A" : "#999" }]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* 리스트 */}
        <FlatList
          data={filtered}
          keyExtractor={(it) => it.id}
          renderItem={renderPost}
          contentContainerStyle={{ paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        {/* 페이지네이션 (필요 시 외부에서 감싸서 위치 조정 가능) */}
        <View style={styles.bottomRow}>
          <View style={styles.pagination}>
            {[1, 2, 3, 4, 5].map((n, index, array) => (
              <React.Fragment key={n}>
                <Pressable onPress={() => setPage(n)} style={{ paddingHorizontal: 4 }}>
                  <Text style={[styles.pageText, page === n && styles.pageActive]}>{n}</Text>
                </Pressable>
                {index < array.length - 1 && <Text style={styles.pageSeparator}>|</Text>}
              </React.Fragment>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },

  contentPanel: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 0,
  },

  filterWrap: {
    backgroundColor: COLORS.bg,
    height: 56,
    justifyContent: "center",
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderTopLeftRadius: 24,
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
  filterActive: { backgroundColor: "rgba(79,80,138,0.3)" },
  filterText: { fontWeight: "700", fontSize: 13 },

  separator: { height: 1, backgroundColor: "#E5E5E5" },

  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 6,

  },

  leftCol: { marginRight: 12 },
  Icon: { width: 45, height: 45, marginTop: 36, },
  fallbackCircle: { width: 38, height: 38, borderRadius: 19 },

  cardContent: { flex: 1, justifyContent: "flex-start", alignItems: "flex-start" },
  categoryLabel: { width: 100, height: 26, resizeMode: "contain", marginBottom: 6, marginLeft: -56 },

  title: { fontSize: 16, fontWeight: "800", color: "#000" },
  location: { fontSize: 12, color: COLORS.gray, marginTop: 4 },

 infoRow: {flexDirection: "row",alignItems: "center", marginTop: 6, width: "100%",},
  metaItem: { flexDirection: "row", alignItems: "center", marginRight: 12 },
  metaIcon: { width: 14, height: 14, resizeMode: "contain", marginRight: 4},
  small: { fontSize: 12, color: COLORS.gray, marginTop: -3},
  time: { fontSize: 10, color: COLORS.gray, marginLeft: "auto" },
  rate : {fontSize: 12, color: "#FFA500", fontWeight: "700", marginLeft: 16},

  actionRow: {
  flexDirection: "row",
  alignItems: "center",
  marginLeft: "auto",
  marginTop: -28

},
  rating: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.orange,
    marginRight: 16,
},
  applyBtn: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: "auto",
},
  applyBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },

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
  pageActive: { fontWeight: "700", textDecorationLine: "underline", color: "#000" },
  pageSeparator: { fontSize: 13, color: COLORS.gray, marginHorizontal: 4 },
});
