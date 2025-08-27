// src/screens/BoardDetailScreen.tsx
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect } from "react";
import {
  Image,
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
  bg: "#F6F6F6",      // 바탕 회색
  panel: "#FFFFFF",   // 카드(패널) 흰색
  text: "#222",
  sub: "#777",
  line: "#E9E9E9",
  pillPink: "#FFECE8",
  pillPinkBorder: "#FF6B6B",
  cta: "#FF8A3D",     // 하단 버튼 오렌지
  input: "#F2F2F2",
};

const CATEGORY_PILLS: Record<string, any> = {
  "전기 · 조명": require("../images/category_electric.png"),
  "수도·배관": require("../images/category_water.png"),
  "가구 조립": require("../images/category_furniture.png"),
  "IT 지원": require("../images/category_it.png"),
};

export default function BoardDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();

  useFocusEffect(
    useCallback(() => {
      console.log('BoardDetailScreen focused');
      // Add any data re-fetching or state updates here if needed
      return () => console.log('BoardDetailScreen unfocused');
    }, [])
  );

  // 목록에서 넘겨준 데이터
  const post = route.params?.post ?? {};
  const { 
    title = "",
    category = "",
    location = "",
    thumbnail,
    body,
    authorName = "김철수",
    // 필요하면 추가 필드…
  } = post;

  useEffect(() => {
    console.log('BoardDetailScreen - route.params.post changed:', route.params?.post);
  }, [route.params?.post]);

  console.log('BoardDetailScreen - post:', post);
  console.log('BoardDetailScreen - category:', category);
  console.log('BoardDetailScreen - title:', title);

  const catImg = CATEGORY_PILLS[category];

  return (
    <SafeAreaView style={styles.safe}>
      {/* 상단 얇은 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Image
            source={require("../images/left_arrow.png")}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('ChatDetail' as never)}>
          <Image
            source={require("../images/chat.png")}
            style={styles.messageIcon}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* 상단 이미지 영역 */}
        <View style={styles.heroWrap}>
          {thumbnail ? (
            <Image source={thumbnail} style={styles.hero} />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={{ color: "#A8A8A8" }}>[이미지 삽입 영역]</Text>
            </View>
          )}
        </View>

        {/* 흰 패널 카드 */}
        <View style={styles.card}>
          {/* 카테고리 라벨(있으면 이미지, 없으면 분홍 pill) */}
          {catImg ? (
            <Image source={catImg} style={styles.categoryPillImg} />
          ) : category ? (
            <View style={styles.categoryPillFallback}>
              <Text style={styles.categoryPillFallbackText}>{category}</Text>
            </View>
          ) : null}

          <Text style={styles.title}>{title}</Text>
          {!!location && <Text style={styles.location}>{location}</Text>}

          {/* 구분선 */}
          <View style={styles.divider} />

          {/* 작성자 영역 */}
          <View style={styles.authorRow}>
            <Image
              source={require("../images/avatar.png")}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.authorName}>{authorName}</Text>
              <Text style={styles.authorSub}>전문 분야: 전기 수리</Text>
            </View>
          </View>

          {/* 본문 */}
          <Text style={styles.body}>
            {body ?? "집에 전등이 나갔어요\n도와주세요\n50000원 드립니다!"}
          </Text>

          {/* 하단 얇은 구분선 */}
          <View style={[styles.divider, { marginTop: 16 }]} />

          {/* 댓글 입력 바(카드 안) */}
          <Text style={styles.commentTitle}>댓글 / 질문 (3)</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="댓글을 입력해주세요…"
              placeholderTextColor="#BDBDBD"
            />
            <TouchableOpacity style={styles.sendBtn}>
              <Image
                source={require("../images/send_message.png")}
                style={{ width: 18, height: 18}}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 하단 고정 CTA */}
      <TouchableOpacity style={styles.cta}>
        <Text style={styles.ctaText}>신청하기</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg, // 전체 회색 배경
  },

  /* 헤더 */
  header: {
    marginTop: 45,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIcon: { width: 22, height: 22, resizeMode: "contain"},
  messageIcon: { width: 44, height: 44, resizeMode: "contain", marginRight: 30, marginTop: 10 },
  
  /*작성자 프로필 이미지 */
  heroWrap: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12 },
  hero: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    resizeMode: "cover",
    backgroundColor: "#EEE",
  },
  heroPlaceholder: {
    height: 180,
    borderRadius: 14,
    backgroundColor: "#F3F3F3",
    alignItems: "center",
    justifyContent: "center",
  },

  /* 흰 패널 카드 */
  card: {
    backgroundColor: COLORS.panel,
    borderRadius: 16,
    padding: 16,
    // 살짝 둥근 그림자 느낌
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  categoryPillImg: {
    width: 84,
    height: 24,
    resizeMode: "contain",
    marginBottom: 8,
  },
  categoryPillFallback: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: COLORS.pillPink,
    borderWidth: 1,
    borderColor: COLORS.pillPinkBorder,
    marginBottom: 8,
  },
  categoryPillFallbackText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.pillPinkBorder,
  },

  title: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  location: { fontSize: 12, color: COLORS.sub, marginTop: 6 },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.line,
    marginTop: 14,
  },

  authorRow: { flexDirection: "row", alignItems: "center", marginTop: 14 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  authorName: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  authorSub: { fontSize: 12, color: COLORS.sub, marginTop: 2 },

  body: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
  },

  commentTitle: {
    marginTop: 14,
    fontSize: 13,
    color: COLORS.sub,
  },
  inputRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.input,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  sendBtn: {
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cta,
    alignItems: "center",
    justifyContent: "center",
  },

  /* 하단 CTA */
  cta: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    height: 46,
    borderRadius: 10,
    backgroundColor: COLORS.cta,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});
