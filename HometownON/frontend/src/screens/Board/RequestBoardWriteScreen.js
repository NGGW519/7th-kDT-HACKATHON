import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { getCurrentUser } from "../../utils/storage";
import API_URL from '../../config/apiConfig';
import AuthService from '../../services/AuthService';

const COLORS = {
    primary: "#6956E5",
    white: "#FFFFFF",
    gray: "#666666",
    lightGray: "#B0B0B0",
    bg: "#F8F9FA",
    border: "#E0E0E0",
    chipBg: "#FFF",
    chipActiveBg: "#45B7D1",
    chipActiveText: "#FFF",
};

const CATEGORIES = [
    { key: "repair", title: "수리", icon: "🔧" },
    { key: "agriculture", title: "농업", icon: "🌾" },
    { key: "it", title: "IT", icon: "💻" },
    { key: "cleaning", title: "청소", icon: "🧹" },
    { key: "installation", title: "설치", icon: "🔨" },
];

export default function RequestBoardWriteScreen({ route }) {
    const navigation = useNavigation();
    const { boardType } = route?.params || {};

    const [currentUser, setCurrentUser] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("repair");
    const [budget, setBudget] = useState("");
    const [location, setLocation] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const user = await getCurrentUser();
                if (user) setCurrentUser(user);
            } catch (e) {
                console.error("사용자 데이터 로드 오류:", e);
            }
        })();
    }, []);

    const canSubmit =
        title.trim().length > 0 &&
        content.trim().length > 0 &&
        budget.trim().length > 0 &&
        location.trim().length > 0;

    const handleSubmit = async () => {
        if (!canSubmit) {
            Alert.alert("알림", "필수 항목을 모두 입력해주세요.");
            return;
        }

        const newPost = {
            title: title.trim(),
            content: content.trim(),
            category: selectedCategory,
            budget: budget.trim(),
            location: location.trim(),
        };

        console.log('Submitting post:', newPost);

        try {
            const token = await AuthService.getToken();
            console.log('API URL:', `${API_URL}/api/requests/`);
            
            if (!token) {
                Alert.alert("오류", "로그인이 필요합니다. 먼저 로그인해주세요.");
                return;
            }
            
            const response = await fetch(`${API_URL}/api/requests/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(newPost),
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (response.ok) {
                const post = await response.json();
                console.log('Created post from API:', post);
                const handleAlertPress = () => {
                    setTimeout(() => {
                        // 게시판 목록으로 돌아가면서 새로고침 트리거
                        navigation.navigate("Board", { refresh: true });
                    }, 100);
                };
                Alert.alert("등록 완료", "의뢰가 성공적으로 등록되었습니다!", [
                    {
                        text: "확인",
                        onPress: handleAlertPress,
                    },
                ]);
            } else {
                const errorText = await response.text();
                console.log('Error response:', errorText);
                Alert.alert("오류", `의뢰를 등록하지 못했습니다.\n상태: ${response.status}\n오류: ${errorText}`);
            }
        } catch (error) {
            console.error('Error creating request post:', error);
            Alert.alert("오류", `의뢰를 등록하는 중 오류가 발생했습니다.\n${error.message}`);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerBtn}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.headerBack}>←</Text>
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>의뢰 게시글 작성</Text>
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                >
                    <Text style={styles.submitBtnText}>등록</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* 카테고리 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>카테고리</Text>
                    <View style={styles.categoryRow}>
                        {CATEGORIES.map((c) => {
                            const active = selectedCategory === c.key;
                            return (
                                <TouchableOpacity
                                    key={c.key}
                                    style={[
                                        styles.categoryChip,
                                        active && styles.categoryChipActive,
                                    ]}
                                    onPress={() => setSelectedCategory(c.key)}
                                >
                                    <Text style={styles.categoryIcon}>{c.icon}</Text>
                                    <Text
                                        style={[
                                            styles.categoryText,
                                            active && styles.categoryTextActive,
                                        ]}
                                    >
                                        {c.title}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* 제목 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>제목</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="예) 집 수리 의뢰합니다"
                        placeholderTextColor="#999"
                        maxLength={80}
                    />
                    <Text style={styles.countText}>{title.length}/80</Text>
                </View>

                {/* 내용 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>내용</Text>
                    <TextInput
                        style={[styles.input, styles.textarea]}
                        value={content}
                        onChangeText={setContent}
                        placeholder="필요한 작업 내용, 일정, 추가 요청사항 등을 자세히 적어주세요."
                        placeholderTextColor="#999"
                        multiline
                        textAlignVertical="top"
                        maxLength={2000}
                    />
                    <Text style={styles.countText}>{content.length}/2000</Text>
                </View>

                {/* 예산 / 위치 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>세부 정보</Text>

                    <View style={styles.inlineRow}>
                        <View style={styles.inlineCol}>
                            <Text style={styles.inlineLabel}>예산</Text>
                            <TextInput
                                style={styles.input}
                                value={budget}
                                onChangeText={setBudget}
                                placeholder='예) "50-100만원", "일당 협의"'
                                placeholderTextColor="#999"
                                maxLength={30}
                            />
                        </View>

                        <View style={[styles.inlineCol, { marginLeft: 12 }]}>
                            <Text style={styles.inlineLabel}>위치</Text>
                            <TextInput
                                style={styles.input}
                                value={location}
                                onChangeText={setLocation}
                                placeholder="예) 강원도 춘천시"
                                placeholderTextColor="#999"
                                maxLength={30}
                            />
                        </View>
                    </View>
                </View>

                {/* 안내 박스 */}
                <View style={styles.tips}>
                    <Text style={styles.tipsTitle}>💡 작성 팁</Text>
                    <Text style={styles.tip}>• 작업 범위와 희망 일정(기간)을 적어주세요.</Text>
                    <Text style={styles.tip}>• 예산/위치를 적을수록 매칭이 빨라져요.</Text>
                    <Text style={styles.tip}>• 연락이 필요한 경우 댓글/채팅을 활용해요.</Text>
                    <Text style={styles.tip}>• 서로를 존중하는 표현을 사용해 주세요.</Text>
                </View>
            </ScrollView>
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
    },
    headerBtn: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerCenter: { flex: 1, alignItems: "center" },
    headerBack: { fontSize: 24, color: COLORS.white, fontWeight: "bold" },
    headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: "700" },
    submitBtn: {
        backgroundColor: "#45B7D1",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    submitBtnDisabled: { backgroundColor: "#BDBDBD" },
    submitBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 14 },

    content: { flex: 1, backgroundColor: COLORS.bg },

    section: { backgroundColor: "#FFF", marginBottom: 10, padding: 20 },
    sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 15 },

    categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    categoryChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.chipBg,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginRight: 10,
        marginBottom: 10,
    },
    categoryChipActive: {
        backgroundColor: COLORS.chipActiveBg,
        borderColor: COLORS.chipActiveBg,
    },
    categoryIcon: { fontSize: 16, marginRight: 6 },
    categoryText: { fontSize: 14, color: "#666", fontWeight: "600" },
    categoryTextActive: { color: COLORS.chipActiveText },

    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: "#FFF",
        fontSize: 16,
    },
    textarea: { minHeight: 180 },

    countText: { color: "#999", fontSize: 12, textAlign: "right", marginTop: 6 },

    inlineRow: { flexDirection: "row" },
    inlineCol: { flex: 1 },
    inlineLabel: {
        fontSize: 12,
        color: "#666",
        fontWeight: "700",
        marginBottom: 8,
    },

    tips: { backgroundColor: "#FFF", margin: 20, padding: 20, borderRadius: 10 },
    tipsTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 10 },
    tip: { fontSize: 14, color: "#666", marginBottom: 6 },
});