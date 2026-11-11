// src/screens/MyAllRequestsScreen.tsx
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getCurrentUser } from "../../utils/storage";

const COLORS = {
  primary: "#6956E5",
  white: "#FFFFFF",
  gray: "#666666",
  lightGray: "#B0B0B0",
  bg: "#F8F9FA",
  border: "#E0E0E0",
};

type RequestStatus = "대기" | "진행중" | "완료" | "취소";
type CategoryKey = "repair" | "agriculture" | "it" | "cleaning" | "installation" | "all";

type MyRequest = {
  id: number;
  title: string;
  content: string;
  category: Exclude<CategoryKey, "all">;
  budget?: string;
  location: string;
  createdAt: string;     // ISO
  status: RequestStatus;
  acceptedBy?: string | null;
  isNew?: boolean;
  likes?: number;
  comments?: number;
  views?: number;
};

export default function MyAllRequestsScreen() {
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 필터 상태
  const categories: Array<{ key: CategoryKey; title: string; icon: string }> = [
    { key: "all", title: "전체", icon: "📋" },
    { key: "repair", title: "수리", icon: "🔧" },
    { key: "agriculture", title: "농업", icon: "🌾" },
    { key: "it", title: "IT", icon: "💻" },
    { key: "cleaning", title: "청소", icon: "🧹" },
    { key: "installation", title: "설치", icon: "🔨" },
  ];
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");

  const statuses: Array<{ key: RequestStatus | "all"; title: string }> = [
    { key: "all", title: "전체" },
    { key: "대기", title: "대기" },
    { key: "진행중", title: "진행중" },
    { key: "완료", title: "완료" },
    { key: "취소", title: "취소" },
  ];
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus | "all">("all");

  useEffect(() => {
    (async () => {
      try {
        const u = await getCurrentUser();
        if (u) setCurrentUser(u);
      } catch (e) {
        console.error("사용자 데이터 로드 오류:", e);
      }
    })();
  }, []);

  // 예시 데이터: 과거/완료/취소 포함
  const [myRequests] = useState<MyRequest[]>([
    {
      id: 201,
      title: "가스레인지 설치 도움",
      content: "가스레인지 새 제품 설치가 필요합니다.",
      category: "installation",
      budget: "10-15만원",
      location: "강원도 삼척시",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      status: "대기",
      isNew: true,
      likes: 1, comments: 0, views: 7,
    },
    {
      id: 202,
      title: "컴퓨터 포맷 및 세팅",
      content: "오래된 PC 포맷과 기본 프로그램 설치 부탁드려요.",
      category: "it",
      budget: "5-10만원",
      location: "강원도 춘천시",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      status: "진행중",
      acceptedBy: "김민지 귀향자",
      likes: 3, comments: 1, views: 18,
    },
    {
      id: 203,
      title: "거실 장판 교체 상담",
      content: "장판 상태가 좋지 않아 교체가 필요할지 상담받고 싶어요.",
      category: "repair",
      budget: "상담 후 결정",
      location: "강원도 강릉시",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      status: "완료",
      acceptedBy: "박성호 귀향자",
      likes: 11, comments: 5, views: 44,
    },
    {
      id: 204,
      title: "이사 청소 요청",
      content: "원룸 이사청소가 필요합니다. 견적 부탁드려요.",
      category: "cleaning",
      budget: "10-20만원",
      location: "강원도 원주시",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
      status: "취소",
      likes: 0, comments: 0, views: 5,
    },
    {
      id: 205,
      title: "책상·의자 조립",
      content: "조립식 책상 1, 의자 2 조립 부탁드립니다.",
      category: "installation",
      budget: "일당 협의",
      location: "강원도 태백시",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 200).toISOString(),
      status: "완료",
      acceptedBy: "이도현 귀향자",
      likes: 6, comments: 2, views: 30,
    },
    {
      id: 206,
      title: "세탁기 배수 문제",
      content: "배수구에서 역류가 있습니다. 점검 요청드립니다.",
      category: "repair",
      budget: "5-10만원",
      location: "강원도 속초시",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      status: "진행중",
      acceptedBy: "최진우 귀향자",
      likes: 4, comments: 2, views: 21,
    },
  ]);

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString("ko-KR");
  };

  const getCategoryIcon = (category: CategoryKey) => {
    switch (category) {
      case "repair": return "🔧";
      case "agriculture": return "🌾";
      case "it": return "💻";
      case "cleaning": return "🧹";
      case "installation": return "🔨";
      default: return "📋";
    }
  };
  const getCategoryTitle = (category: CategoryKey) => {
    switch (category) {
      case "repair": return "수리";
      case "agriculture": return "농업";
      case "it": return "IT";
      case "cleaning": return "청소";
      case "installation": return "설치";
      default: return "전체";
    }
  };

  const filtered = useMemo(() => {
    let list = [...myRequests];
    if (selectedCategory !== "all") {
      list = list.filter((r) => r.category === selectedCategory);
    }
    if (selectedStatus !== "all") {
      list = list.filter((r) => r.status === selectedStatus);
    }
    // 최신순
    list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return list;
  }, [myRequests, selectedCategory, selectedStatus]);

  const openRequestDetail = (item: MyRequest) =>
    navigation.navigate("BoardDetail" as never, { post: item } as never);

  const openChat = (partnerName?: string, title?: string) => {
    if (!partnerName) return;
    navigation.navigate("MessengerTab" as never, {
      screen: "MessengerChatScreen",
      params: { title: partnerName, fromRequestTitle: title },
    } as never);
  };

  const renderRequest = ({ item }: { item: MyRequest }) => (
    <TouchableOpacity
      style={styles.postItem}
      activeOpacity={0.9}
      onPress={() => openRequestDetail(item)}
    >
      {/* 상단 메타 */}
      <View style={styles.postHeader}>
        <View style={styles.postInfo}>
          <Text style={styles.categoryTag}>
            {getCategoryIcon(item.category)} {getCategoryTitle(item.category)}
          </Text>
          {item.isNew && <Text style={styles.newTag}>NEW</Text>}
        </View>
        <Text style={styles.postDate}>{formatDate(item.createdAt)}</Text>
      </View>

      {/* 제목/본문 */}
      <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.postContent} numberOfLines={2}>{item.content}</Text>

      {/* 상세 정보 */}
      <View style={styles.postDetails}>
        {item.budget && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>예산:</Text>
            <Text style={styles.detailValue}>{item.budget}</Text>
          </View>
        )}
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>위치:</Text>
          <Text style={styles.detailValue}>{item.location}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>상태:</Text>
          <View style={styles.statusContainer}>
            {item.status === "완료" ? (
              <Text style={styles.statusCompleted}>✅ 완료</Text>
            ) : item.status === "진행중" ? (
              <Text style={styles.statusInprogress}>🟣 진행중</Text>
            ) : item.status === "취소" ? (
              <Text style={styles.statusCanceled}>🚫 취소</Text>
            ) : (
              <Text style={styles.statusPending}>⏳ 대기</Text>
            )}
          </View>
        </View>
        {item.acceptedBy && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>수락자:</Text>
            <Text style={styles.detailValue}>{item.acceptedBy}</Text>
          </View>
        )}
      </View>

      {/* 작성자 + 통계 */}
      <View style={styles.postFooter}>
        <View style={styles.authorInfo}>
          <Image
            source={require("../../assets/images/회원가입_지역주민.png")}
            style={styles.authorAvatar}
            resizeMode="contain"
          />
          <Text style={styles.authorName}>{currentUser?.name ?? "나"}</Text>
        </View>
        <View style={styles.postStats}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>👍</Text>
            <Text style={styles.statText}>{item.likes ?? 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>💬</Text>
            <Text style={styles.statText}>{item.comments ?? 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>👁️</Text>
            <Text style={styles.statText}>{item.views ?? 0}</Text>
          </View>
        </View>
      </View>

      {/* 액션 */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: "#6c757d" }]}
          onPress={() => openRequestDetail(item)}
        >
          <Text style={styles.contactButtonText}>상세보기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.contactButton, !item.acceptedBy && styles.disabledBtn]}
          onPress={() => item.acceptedBy && openChat(item.acceptedBy, item.title)}
          disabled={!item.acceptedBy}
        >
          <Text
            style={[
              styles.contactButtonText,
              !item.acceptedBy && styles.disabledBtnText,
            ]}
          >
            {item.acceptedBy ? "채팅하기" : "수락 대기"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const CategoryChips = (
    <View style={styles.filterRow}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {categories.map((c) => (
          <TouchableOpacity
            key={c.key}
            style={[
              styles.categoryButton,
              selectedCategory === c.key && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(c.key)}
          >
            <Text style={styles.categoryIcon}>{c.icon}</Text>
            <Text
              style={[
                styles.categoryTitle,
                selectedCategory === c.key && styles.categoryTitleActive,
              ]}
            >
              {c.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const StatusChips = (
    <View style={[styles.filterRow, { paddingTop: 0 }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {statuses.map((s) => {
          const active = selectedStatus === s.key;
          return (
            <TouchableOpacity
              key={s.key}
              style={[styles.statusChip, active && styles.statusChipActive]}
              onPress={() => setSelectedStatus(s.key)}
            >
              <Text style={[styles.statusChipText, active && styles.statusChipTextActive]}>
                {s.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* 헤더: 뒤로가기 + 글쓰기 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

      </View>

      {/* 본문 */}
      <View style={styles.contentPanel}>
        {CategoryChips}
        {StatusChips}

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRequest}
          style={styles.postsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.postsContainer}
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: "center" }}>
              <Text style={{ color: "#999" }}>조회 결과가 없습니다.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },

  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 65,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  backIcon: { color: COLORS.white, fontSize: 18, fontWeight: "800" },

  writeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  writeButtonText: { fontSize: 18, color: "#FFF" },

  contentPanel: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  filterRow: { backgroundColor: COLORS.bg, paddingVertical: 15 },
  categoryScroll: { paddingHorizontal: 20 },

  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: "#FFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryIcon: { fontSize: 16, marginRight: 6 },
  categoryTitle: { fontSize: 14, fontWeight: "600", color: "#666" },
  categoryTitleActive: { color: "#FFF" },

  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10,
  },
  statusChipActive: { backgroundColor: "#EEF0FF", borderColor: COLORS.primary },
  statusChipText: { fontSize: 13, color: "#444", fontWeight: "600" },
  statusChipTextActive: { color: COLORS.primary, fontWeight: "800" },

  postsList: { flex: 1, backgroundColor: COLORS.bg },
  postsContainer: { padding: 20 },

  postItem: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  postInfo: { flexDirection: "row", alignItems: "center" },
  categoryTag: {
    fontSize: 12,
    color: COLORS.primary,
    backgroundColor: "#F0F0FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  newTag: {
    fontSize: 10,
    color: "#FFF",
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  postDate: { fontSize: 12, color: "#999" },
  postTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 8, lineHeight: 22 },
  postContent: { fontSize: 14, color: "#666", lineHeight: 20, marginBottom: 12 },

  postDetails: { backgroundColor: "#F8F9FA", borderRadius: 8, padding: 12, marginBottom: 15 },
  detailItem: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  detailLabel: { fontSize: 12, color: "#666", fontWeight: "600", width: 44 },
  detailValue: { fontSize: 12, color: "#333", flex: 1 },

  statusContainer: { flex: 1 },
  statusCompleted: { fontSize: 12, color: "#28a745", fontWeight: "600" },
  statusPending: { fontSize: 12, color: "#ffc107", fontWeight: "600" },
  statusInprogress: { fontSize: 12, color: COLORS.primary, fontWeight: "700" },
  statusCanceled: { fontSize: 12, color: "#dc3545", fontWeight: "700" },

  postFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  authorInfo: { flexDirection: "row", alignItems: "center" },
  authorAvatar: { width: 24, height: 24, marginRight: 8 },
  authorName: { fontSize: 14, color: "#333", fontWeight: "500" },

  postStats: { flexDirection: "row", alignItems: "center" },
  statItem: { flexDirection: "row", alignItems: "center", marginLeft: 15 },
  statIcon: { fontSize: 14, marginRight: 4 },
  statText: { fontSize: 12, color: "#666" },

  actionButtons: { flexDirection: "row", gap: 10, marginTop: 15 },
  contactButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  contactButtonText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  disabledBtn: { backgroundColor: "#DADADA" },
  disabledBtnText: { color: "#9CA3AF" },
});
