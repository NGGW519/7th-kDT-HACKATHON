// src/screens/MyRequestsChatScreen.tsx
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
  createdAt: string;
  status: RequestStatus;
  acceptedBy?: string | null;
  isNew?: boolean;
  likes?: number;
  comments?: number;
  views?: number;
};

type ChatThread = {
  id: string;
  partnerName: string;
  requestTitle: string;
  lastMessage: string;
  unread: number;
  updatedAt: string;
};

export default function MyActiveRequestsScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<"내 의뢰" | "채팅하기">("내 의뢰");
  const [currentUser, setCurrentUser] = useState<any>(null);

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

  const categories: Array<{ key: CategoryKey; title: string; icon: string }> = [
    { key: "all", title: "전체", icon: "📋" },
    { key: "repair", title: "수리", icon: "🔧" },
    { key: "agriculture", title: "농업", icon: "🌾" },
    { key: "it", title: "IT", icon: "💻" },
    { key: "cleaning", title: "청소", icon: "🧹" },
    { key: "installation", title: "설치", icon: "🔨" },
  ];
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");

  const [myRequests] = useState<MyRequest[]>([
    {
      id: 101,
      title: "거실 전등 교체 부탁드려요",
      content: "천장에 설치된 오래된 형광등을 LED로 교체하고 싶습니다.",
      category: "repair",
      budget: "10-20만원",
      location: "강원도 춘천시",
      createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
      status: "대기",
      isNew: true,
      likes: 2,
      comments: 1,
      views: 12,
    },
    {
      id: 102,
      title: "책장/수납장 조립 도와주세요",
      content: "이케아 책장 2개와 수납장 1개 조립 필요합니다.",
      category: "installation",
      budget: "일당 협의",
      location: "강원도 원주시",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      status: "진행중",
      acceptedBy: "김민지 귀향자",
      likes: 5,
      comments: 3,
      views: 33,
    },
    {
      id: 103,
      title: "싱크대 배수구 점검",
      content: "물이 잘 안 내려가요. 원인 점검 및 간단 수리 원합니다.",
      category: "repair",
      budget: "5-10만원",
      location: "강원도 강릉시",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
      status: "완료",
      acceptedBy: "박성호 귀향자",
      likes: 8,
      comments: 4,
      views: 40,
    },
  ]);

  const [chats] = useState<ChatThread[]>([
    {
      id: "c1",
      partnerName: "김민지 귀향자",
      requestTitle: "책장/수납장 조립 도와주세요",
      lastMessage: "오늘 7시에 가능하실까요?",
      unread: 2,
      updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: "c2",
      partnerName: "박성호 귀향자",
      requestTitle: "싱크대 배수구 점검",
      lastMessage: "내일 영수증 전달드릴게요.",
      unread: 0,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
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

  const filteredRequests = useMemo(() => {
    const base = myRequests.filter((r) => r.status !== "취소");
    return selectedCategory === "all" ? base : base.filter((r) => r.category === selectedCategory);
  }, [myRequests, selectedCategory]);

  const openWrite = () => navigation.navigate("FreeBoardWrite" as never);
  const openRequestDetail = (item: MyRequest) =>
    navigation.navigate("BoardDetail" as never, { post: item } as never);
  const openChat = (partnerName: string, title: string) =>
    navigation.navigate("MessengerTab" as never, {
      screen: "MessengerChatScreen",
      params: { title: partnerName, fromRequestTitle: title },
    } as never);

  const renderMyRequest = ({ item }: { item: MyRequest }) => (
    <TouchableOpacity style={styles.postItem} activeOpacity={0.9} onPress={() => openRequestDetail(item)}>
      <View style={styles.postHeader}>
        <View style={styles.postInfo}>
          <Text style={styles.categoryTag}>
            {getCategoryIcon(item.category)} {getCategoryTitle(item.category)}
          </Text>
          {item.isNew && <Text style={styles.newTag}>NEW</Text>}
        </View>
        <Text style={styles.postDate}>{formatDate(item.createdAt)}</Text>
      </View>

      <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.postContent} numberOfLines={2}>{item.content}</Text>

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

      <View style={styles.postFooter}>
        <View style={styles.authorInfo}>
          <Image source={require("../../assets/images/회원가입_지역주민.png")} style={styles.authorAvatar} resizeMode="contain" />
          <Text style={styles.authorName}>{currentUser?.name ?? "나"}</Text>
        </View>
        <View style={styles.postStats}>
          <View style={styles.statItem}><Text style={styles.statIcon}>👍</Text><Text style={styles.statText}>{item.likes ?? 0}</Text></View>
          <View style={styles.statItem}><Text style={styles.statIcon}>💬</Text><Text style={styles.statText}>{item.comments ?? 0}</Text></View>
          <View style={styles.statItem}><Text style={styles.statIcon}>👁️</Text><Text style={styles.statText}>{item.views ?? 0}</Text></View>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.contactButton, { backgroundColor: "#6c757d" }]} onPress={() => openRequestDetail(item)}>
          <Text style={styles.contactButtonText}>상세보기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.contactButton, !item.acceptedBy && styles.disabledBtn]}
          onPress={() => item.acceptedBy && openChat(item.acceptedBy, item.title)}
          disabled={!item.acceptedBy}
        >
          <Text style={[styles.contactButtonText, !item.acceptedBy && styles.disabledBtnText]}>
            {item.acceptedBy ? "채팅하기" : "수락 대기"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderChat = ({ item }: { item: ChatThread }) => (
    <TouchableOpacity
      style={styles.chatCard}
      activeOpacity={0.9}
      onPress={() => openChat(item.partnerName, item.requestTitle)}
    >
      <View style={styles.chatHeader}>
        <Text style={styles.chatPartner}>{item.partnerName}</Text>
        <View style={styles.chatRight}>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
          <Text style={styles.chatTime}>{formatDate(item.updatedAt)}</Text>
        </View>
      </View>
      <Text style={styles.chatTitle} numberOfLines={1}>{item.requestTitle}</Text>
      <Text style={styles.chatPreview} numberOfLines={2}>{item.lastMessage}</Text>
    </TouchableOpacity>
  );

  const CategoryChips = (
    <View style={styles.categoryContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
        {categories.map((c) => (
          <TouchableOpacity
            key={c.key}
            style={[styles.categoryButton, selectedCategory === c.key && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory(c.key)}
          >
            <Text style={styles.categoryIcon}>{c.icon}</Text>
            <Text style={[styles.categoryTitle, selectedCategory === c.key && styles.categoryTitleActive]}>
              {c.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* 헤더: 날짜/타이틀 제거 → 뒤로가기 버튼만 노출 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.writeButton} onPress={() => navigation.navigate("FreeBoardWrite" as never)}>
          <Text style={styles.writeButtonText}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* 탭(유지) */}
      <View style={styles.tabRow}>
        <TouchableOpacity onPress={() => setActiveTab("내 의뢰")} style={{ marginHorizontal: 16 }}>
          <View style={activeTab === "내 의뢰" ? styles.activeTabUnderline : null}>
            <Text style={activeTab === "내 의뢰" ? styles.tabActive : styles.tab}>내 의뢰</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("채팅하기")} style={{ marginHorizontal: 16 }}>
          <View style={activeTab === "채팅하기" ? styles.activeTabUnderline : null}>
            <Text style={activeTab === "채팅하기" ? styles.tabActive : styles.tab}>채팅하기</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 본문 */}
      <View style={styles.contentPanel}>
        {activeTab === "내 의뢰" ? (
          <>
            {CategoryChips}
            <FlatList
              data={filteredRequests}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderMyRequest}
              style={styles.postsList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.postsContainer}
              ListEmptyComponent={
                <View style={{ padding: 40, alignItems: "center" }}>
                  <Text style={{ color: "#999" }}>등록한 의뢰가 없습니다.</Text>
                  <TouchableOpacity onPress={() => navigation.navigate("FreeBoardWrite" as never)} style={[styles.contactButton, { marginTop: 12 }]}>
                    <Text style={styles.contactButtonText}>의뢰 등록하기</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </>
        ) : (
          <FlatList
            data={chats}
            keyExtractor={(item) => item.id}
            renderItem={renderChat}
            style={styles.postsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.postsContainer}
            ListEmptyComponent={<View style={{ padding: 40, alignItems: "center" }}><Text style={{ color: "#999" }}>진행중인 채팅이 없습니다.</Text></View>}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },

  // 헤더: 좌측 뒤로가기, 우측 글쓰기
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
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  categoryContainer: { backgroundColor: COLORS.bg, paddingVertical: 15 },
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
  newTag: { fontSize: 10, color: "#FFF", backgroundColor: "#FF6B6B", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  postDate: { fontSize: 12, color: "#999" },
  postTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 8, lineHeight: 22 },
  postContent: { fontSize: 14, color: "#666", lineHeight: 20, marginBottom: 12 },

  postDetails: { backgroundColor: "#F8F9FA", borderRadius: 8, padding: 12, marginBottom: 15 },
  detailItem: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  detailLabel: { fontSize: 12, color: "#666", fontWeight: "600", width: 40 },
  detailValue: { fontSize: 12, color: "#333", flex: 1 },
  statusContainer: { flex: 1 },
  statusCompleted: { fontSize: 12, color: "#28a745", fontWeight: "600" },
  statusPending: { fontSize: 12, color: "#ffc107", fontWeight: "600" },
  statusInprogress: { fontSize: 12, color: COLORS.primary, fontWeight: "700" },

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

  chatCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  chatHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chatPartner: { fontSize: 16, color: "#111", fontWeight: "700" },
  chatRight: { flexDirection: "row", alignItems: "center" },
  unreadBadge: { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", paddingHorizontal: 6, marginRight: 8 },
  unreadText: { color: "#FFF", fontSize: 12, fontWeight: "800" },
  chatTime: { fontSize: 12, color: "#999" },
  chatTitle: { marginTop: 6, fontSize: 13, color: "#444" },
  chatPreview: { marginTop: 4, fontSize: 13, color: "#666" },
});
