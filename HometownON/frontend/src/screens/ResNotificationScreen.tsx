import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getCurrentUser } from '../utils/storage';

const ResNotificationScreen = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadUserData();
    loadNotifications();
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

  const loadNotifications = () => {
    // 실제로는 서버에서 가져올 데이터
    const mockNotifications = [
      {
        id: 1,
        type: 'request',
        title: '관련 의뢰 알림',
        message: '수리 분야 관련 의뢰 게시물이 2건 있습니다.',
        time: '5분 전',
        isRead: false,
        icon: '🔧',
        color: '#FF6B6B',
      },
      {
        id: 2,
        type: 'mission',
        title: '배지 획득 임박',
        message: '탐색형 배지를 모으기 위해 3개의 미션을 더 수행하세요!',
        time: '10분 전',
        isRead: false,
        icon: '🏆',
        color: '#FFD700',
      },
      {
        id: 3,
        type: 'mentor',
        title: '멘토 매칭 성공',
        message: '기술 분야 멘토와 매칭되었습니다. 연락해보세요!',
        time: '30분 전',
        isRead: true,
        icon: '🎓',
        color: '#4ECDC4',
      },
      {
        id: 4,
        type: 'achievement',
        title: '업적 달성',
        message: '첫 번째 의뢰 완료! 신뢰 배지를 획득했습니다.',
        time: '1시간 전',
        isRead: true,
        icon: '⭐',
        color: '#28a745',
      },
      {
        id: 5,
        type: 'community',
        title: '커뮤니티 활동',
        message: '자유게시판에 새로운 댓글이 달렸습니다.',
        time: '2시간 전',
        isRead: true,
        icon: '💬',
        color: '#45B7D1',
      },
      {
        id: 6,
        type: 'weather',
        title: '날씨 알림',
        message: '오늘 오후에 비가 올 예정입니다. 외출 시 우산을 챙기세요.',
        time: '3시간 전',
        isRead: true,
        icon: '🌧️',
        color: '#6c757d',
      },
    ];

    setNotifications(mockNotifications);
  };

  const handleNotificationPress = (notification) => {
    // 알림 타입에 따라 다른 화면으로 이동
    switch (notification.type) {
      case 'request':
        navigation.navigate('RequestBoard');
        break;
      case 'mission':
        navigation.navigate('MissionList');
        break;
      case 'mentor':
        navigation.navigate('MentorBoard');
        break;
      case 'achievement':
        navigation.navigate('Achievement');
        break;
      case 'community':
        navigation.navigate('FreeBoard');
        break;
      default:
        break;
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.isRead).length;
  };

  const formatTime = (timeString) => {
    return timeString;
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
          <Text style={styles.headerTitle}>알림</Text>
          <View style={styles.headerRight}>
            {getUnreadCount() > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{getUnreadCount()}</Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>알림이 없습니다</Text>
            <Text style={styles.emptyMessage}>
              새로운 알림이 오면 여기에 표시됩니다
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                !notification.isRead && styles.unreadItem
              ]}
              onPress={() => {
                handleNotificationPress(notification);
                markAsRead(notification.id);
              }}
            >
              <View style={[
                styles.notificationIcon,
                { backgroundColor: notification.color + '20' }
              ]}>
                <Text style={styles.iconText}>{notification.icon}</Text>
              </View>
              
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={[
                    styles.notificationTitle,
                    !notification.isRead && styles.unreadTitle
                  ]}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {formatTime(notification.time)}
                  </Text>
                </View>
                
                <Text style={[
                  styles.notificationMessage,
                  !notification.isRead && styles.unreadMessage
                ]}>
                  {notification.message}
                </Text>
                
                {!notification.isRead && (
                  <View style={styles.unreadDot} />
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
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
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  unreadBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unreadItem: {
    backgroundColor: '#F0F8FF',
    borderLeftWidth: 4,
    borderLeftColor: '#6956E5',
  },
  notificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
    position: 'relative',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  unreadMessage: {
    color: '#333',
  },
  unreadDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6956E5',
  },
});

export default ResNotificationScreen;
