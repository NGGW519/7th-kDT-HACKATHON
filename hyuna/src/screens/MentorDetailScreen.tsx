// MentorDetailScreen.tsx
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Rating } from "react-native-ratings";

const COLORS = {
  primary: "#6956E5",
  white: "#FFFFFF",
  black: "#000000",
  textDark: "#333333",
  textMid: "#555555",
  textLight: "#777777",
  gray: "#DEDEDE",
  border: "#CCCCCC",
  orange: "#F88742",
  cardShadow: "rgba(0,0,0,0.25)",
};

export default function MentorDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();

  useFocusEffect(
    useCallback(() => {
      console.log("MentorDetailScreen focused");
      return () => console.log("MentorDetailScreen unfocused");
    }, [])
  );

  const post = route?.params?.post ?? {};
  const name: string = post?.name ?? "이철수 멘토";
  const specialty: string = post?.detail ? `전문 분야 : ${post.detail}` : "전문 분야: 전기 수리";
  const mode: string = `방식: ${post?.method ?? "대면"}`;
  const rating: number = post?.rating ?? 4.8;
  const avatarUri: string | undefined = post?.avatarUri;
  const bio: string =
    post?.bio ??
    "30년 경력의 전기 기술자로, 지역 사회에서 다양한 기술을 나누고 있습니다. 안전과 품질을 최우선으로 작업합니다.";
  const regionTime: string =
    post?.regionTime ?? "경남 거제시 고현동 / 월, 수, 금 오후 2시~6시";
  const notes: string = post?.notes ?? "대면 중심, 간단한 도구 지참 가능";

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더(보라) */}
      <View style={styles.header}></View>

      {/* 상단바: 뒤로가기 / 채팅 */}
      <View style={styles.statusBar}>
        <TouchableOpacity
          style={styles.roundIconButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="뒤로가기"
        >
          <Image source={require("../images/back.png")} />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityLabel="채팅"
          onPress={() => navigation.navigate('ChatDetail' as never)}
          style={styles.roundIconButton}
        >
          <Image source={require("../images/chat.png")}/>
        </TouchableOpacity>
      </View>

      <View style={styles.contentPanel}>
        {/* 카드 그룹: 헤더 + 본문 */}
        <View style={styles.cardGroup}>
          {/* 주황 헤더 띠 */}
          <View style={styles.cardHeaderStrip}>
            <Text style={styles.cardHeaderTitle}>멘토 프로필</Text>
          </View>

          {/* 프로필 카드 본문 */}
          <View style={styles.cardBody}>
            <View style={styles.avatarHolder}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarPlaceholder} />
              )}
            </View>

            <Text style={styles.mentorName}>{name}</Text>
            <Text style={styles.specialty}>{specialty}</Text>
            <Text style={styles.mode}>{mode}</Text>

            {/* 별점 & 평균 표시 */}
            <View style={styles.ratingWrap}>
              {/* ✅ 별점 컴포넌트로 교체 (0.1 단위 반영) */}
              <Rating
              type="custom"
              imageSize={24}        // 별 크기
              startingValue={rating} // 0.1 단위 float 가능
              readonly               // 읽기 전용
              ratingCount={5}        // 5개 별
              fractions={1}          // 0.1 단위
              tintColor={COLORS.white}    // 별 주변 배경색(카드 배경과 맞추기)
              ratingBackgroundColor="#E0E0E0" // 빈별 배경
              />
              <Text style={styles.ratingNumber}>{rating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>5개의 후기</Text>
            </View>
          </View>
        </View>

        {/* 섹션들 */}
        <ScrollView
          style={styles.sections}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>멘토 소개</Text>
            <Text style={styles.sectionBody}>{bio}</Text>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>지역 및 활동 가능 시간</Text>
            <Text style={styles.sectionBody}>{regionTime}</Text>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>멘토링 방식 및 유의사항</Text>
            <Text style={styles.sectionBody}>{notes}</Text>
          </View>
        </ScrollView>

        {/* 신청하기 버튼 */}
        <TouchableOpacity style={styles.applyBtn} onPress={() => {}}>
          <Text style={styles.applyBtnText}>신청하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  statusBar: {
    height: 64,
    paddingHorizontal: 21,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  roundIconButton: {
    width: 41,
    height: 41,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  roundIconButtonIcon: {
    fontSize: 20,
    color: "#222",
    opacity: 0.85,
  },
  contentPanel: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 0,
    paddingHorizontal: 16,
  },

  /* 카드 그룹 (헤더+본문 세트) */
  cardGroup: {
    marginTop: 24,
    marginHorizontal: 23,
  },
  cardHeaderStrip: {
    height: 50,
    backgroundColor: COLORS.orange,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeaderTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "700",
  },
  cardBody: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.orange,
    borderTopWidth: 0, // 헤더와 맞물리게
    // Added for overlap
  },

  avatarHolder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.black,
    backgroundColor: COLORS.gray,
    marginBottom: 8,
    alignSelf: "center",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  avatarPlaceholder: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: COLORS.gray,
  },
  mentorName: {
    color: COLORS.textDark,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 0,
    textAlign: "center",
  },
  specialty: {
    marginTop: 4,
    color: "#555",
    fontSize: 15,
    fontWeight: "400",
    textAlign: "center",
  },
  mode: {
    marginTop: 4,
    color: "#555",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },

  /* 회색 테두리 둥근 상자 */
  ratingWrap: {
    marginTop: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 4,
    backgroundColor: COLORS.white,
    alignSelf: "stretch",
    marginHorizontal: 23,
  },
  starRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  starText: {
    fontSize: 20,
    letterSpacing: 2,
    color: "#000",
  },
  ratingNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000",
  },
  reviewCount: {
    marginTop: 4,
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: "700",
  },

  sections: {
    flex: 1,
    marginTop: 16,
  },
  sectionCard: {
    marginHorizontal: 23,
    marginBottom: 14,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.textDark,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionBody: {
    color: COLORS.textMid,
    fontSize: 14,
    fontWeight: "400",
  },

  applyBtn: {
    position: "absolute",
    left: "10%",
    right: "10%",
    bottom: 16,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  applyBtnText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "700",
  },
});
