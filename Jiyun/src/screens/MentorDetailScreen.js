import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { getCurrentUser } from '../utils/storage';

const MentorDetailScreen = ({ navigation, route }) => {
  const { post } = route.params;
  const [currentUser, setCurrentUser] = useState(null);
  
  // 멘토 정보 (실제 데이터 구조에 맞춤)
  const name = post?.author || "이철수 멘토";
  const title = post?.title || "전기공 기술 멘토링 제공합니다";
  const content = post?.content || "20년간 전기공으로 일한 경험을 바탕으로 전기 기술을 가르쳐드립니다. 초보자도 환영합니다.";
  const experience = post?.experience || "20년";
  const hourlyRate = post?.hourlyRate || "3만원";
  const location = post?.location || "강원도";
  const category = post?.category || "technical";
  const likes = post?.likes || 15;
  const comments = post?.comments || 8;
  const views = post?.views || 52;
  const createdAt = post?.createdAt || "2024-01-15";

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('사용자 데이터 로드 오류:', error);
    }
  };

  const handleContactMentor = () => {
    navigation.navigate('Messenger', { 
      recipient: post.author,
      requestTitle: post.title,
      requestId: post.id
    });
  };

  // 카테고리를 한글로 변환
  const getCategoryText = (category) => {
    switch (category) {
      case 'technical':
        return '기술';
      case 'agriculture':
        return '농업';
      case 'lifestyle':
        return '라이프스타일';
      case 'seeking':
        return '멘토 찾기';
      default:
        return '기타';
    }
  };

  const handleBookMentor = () => {
    Alert.alert(
      '멘토 예약',
      `${name} 멘토와 예약하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '예약',
          onPress: () => {
            Alert.alert('성공', '멘토 예약이 완료되었습니다!', [
              { text: '확인' }
            ]);
          },
        },
      ]
    );
  };



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6956E5" />
      
      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>멘토 상세정보</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Mentor Profile */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image 
              source={require('../assets/images/회원가입_귀향자.png')}
              style={styles.avatar}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.mentorName}>{name}</Text>
          <Text style={styles.mentorTitle}>{title}</Text>
        </View>

        {/* Mentor Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>카테고리</Text>
            <Text style={styles.detailValue}>{getCategoryText(category)}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>경력</Text>
            <Text style={styles.detailValue}>{experience}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>활동 지역</Text>
            <Text style={styles.detailValue}>{location}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>시간당 요금</Text>
            <Text style={styles.detailValue}>{hourlyRate}</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>멘토링 내용</Text>
          <Text style={styles.contentText}>{content}</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>게시글 통계</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>좋아요</Text>
              <Text style={styles.statValue}>{likes}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>댓글</Text>
              <Text style={styles.statValue}>{comments}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>조회수</Text>
              <Text style={styles.statValue}>{views}</Text>
            </View>
          </View>
          <Text style={styles.createdAtText}>작성일: {createdAt}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={[
              styles.bookButton,
              category === 'seeking' && styles.seekingButton
            ]}
            onPress={category === 'seeking' ? handleContactMentor : handleBookMentor}
          >
            <Text style={styles.bookButtonText}>
              {category === 'seeking' ? '멘토 찾기 진행중' : '멘토 예약'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={handleContactMentor}
          >
            <Text style={styles.contactButtonText}>연락하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6956E5',
  },
  headerSafeArea: {
    backgroundColor: '#6956E5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#6956E5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  profileSection: {
    backgroundColor: '#FFF',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 10,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
  },
  mentorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  mentorTitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  detailsSection: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: '#666',
    flex: 2,
    textAlign: 'right',
  },
  contentSection: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  contentText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  statsSection: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6956E5',
  },
  createdAtText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  actionSection: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    gap: 15,
  },
  bookButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  seekingButton: {
    backgroundColor: '#FF6B6B',
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#6956E5',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MentorDetailScreen;
