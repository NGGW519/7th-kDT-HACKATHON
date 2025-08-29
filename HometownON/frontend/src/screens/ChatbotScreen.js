import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Animated,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

const ChatbotScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: '안녕하세요! 🤖\n저는 고향이 AI 어시스턴트입니다.\n무엇을 도와드릴까요?',
      timestamp: new Date(),
      isTyping: false,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      title: '주민센터 위치 문의',
      lastMessage: '주민센터는 함안군 가야읍 시청로 123에 있습니다.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2시간 전
      messageCount: 4,
    },
    {
      id: 2,
      title: '미션 관련 문의',
      lastMessage: '현재 진행 가능한 미션이 있어요!',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1일 전
      messageCount: 6,
    },
    {
      id: 3,
      title: '날씨 정보 문의',
      lastMessage: '오늘 함안군 날씨 정보입니다:',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3일 전
      messageCount: 3,
    },
  ]);
  const scrollViewRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const sendButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 초기 애니메이션
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateSendButton = () => {
    Animated.sequence([
      Animated.timing(sendButtonScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(sendButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    animateSendButton();

    const newMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText,
      timestamp: new Date(),
      isTyping: false,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // 타이핑 표시
    setIsTyping(true);
    const typingMessage = {
      id: Date.now() + 0.5,
      type: 'bot',
      text: '',
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages(prev => [...prev, typingMessage]);

    // 봇 응답 시뮬레이션
    setTimeout(() => {
      setIsTyping(false);
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        text: getBotResponse(inputText),
        timestamp: new Date(),
        isTyping: false,
      };
      setMessages(prev => prev.filter(msg => !msg.isTyping).concat(botResponse));
    }, 1500);
  };

  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('주민센터') || lowerMessage.includes('동사무소')) {
      return '🏛️ 주민센터는 함안군 가야읍 시청로 123에 있습니다.\n\n📍 가야초등학교 옆에 위치해 있어요!\n\n📞 전화: 055-123-4567\n🕐 운영시간: 평일 09:00-18:00';
    } else if (lowerMessage.includes('미션') || lowerMessage.includes('퀘스트')) {
      return '🎯 현재 진행 가능한 미션이 있어요!\n\n📱 메인 화면에서 미션을 확인해보세요.\n\n✨ 미션을 완료하면 배지와 경험치를 얻을 수 있습니다!';
    } else if (lowerMessage.includes('안녕') || lowerMessage.includes('반가워')) {
      return '👋 안녕하세요! 고향에서의 하루가 어떠신가요?\n\n🌅 오늘도 좋은 하루 보내세요!';
    } else if (lowerMessage.includes('날씨') || lowerMessage.includes('기온')) {
      return '🌤️ 오늘 함안군 날씨 정보입니다:\n\n🌡️ 기온: 22°C\n☀️ 날씨: 맑음\n💨 바람: 약함\n\n🚶‍♂️ 산책하기 좋은 날씨네요!';
    } else if (lowerMessage.includes('도움') || lowerMessage.includes('help')) {
      return '💡 제가 도와드릴 수 있는 것들입니다:\n\n📍 주민센터 위치\n🎯 미션 정보\n🌤️ 날씨 정보\n🏥 병원/약국\n🚌 교통 정보\n\n무엇이든 물어보세요!';
    } else {
      return '🤔 죄송합니다. 질문을 이해하지 못했어요.\n\n💡 다른 방법으로 질문해주시거나, "도움"이라고 입력해보세요!';
    }
  };

  const handleVoiceInput = () => {
    setIsRecording(true);
    Alert.alert(
      '🎤 음성 입력',
      '음성 입력 기능을 사용하려면 마이크 권한이 필요합니다.',
      [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => setIsRecording(false),
        },
        {
          text: '권한 허용',
          onPress: () => {
            Alert.alert('🎤 음성 입력', '음성 입력 기능은 추후 구현 예정입니다.');
            setIsRecording(false);
          },
        },
      ]
    );
  };

  const handleChatMenu = () => {
    setShowChatMenu(!showChatMenu);
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        text: '안녕하세요! 🤖\n저는 고향이 AI 어시스턴트입니다.\n무엇을 도와드릴까요?',
        timestamp: new Date(),
        isTyping: false,
      },
    ]);
    setShowChatMenu(false);
  };

  const handleChatHistory = () => {
    setShowChatHistory(true);
    setShowChatMenu(false);
  };

  const handleBackToChat = () => {
    setShowChatHistory(false);
  };

  const handleSelectChat = (chat) => {
    // 선택된 채팅으로 이동 (실제로는 해당 채팅의 메시지를 로드)
    Alert.alert('채팅 선택', `${chat.title} 채팅을 불러옵니다.`);
    setShowChatHistory(false);
  };

  const handleDeleteChat = (chatId) => {
    Alert.alert(
      '채팅 삭제',
      '이 채팅을 삭제하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
          },
        },
      ]
    );
  };

  // 메뉴 외부 클릭 시 메뉴 닫기
  const handleOutsideClick = () => {
    if (showChatMenu) {
      setShowChatMenu(false);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatChatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}일 전`;
    } else if (hours > 0) {
      return `${hours}시간 전`;
    } else {
      return '방금 전';
    }
  };

  const renderTypingIndicator = () => (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <View style={styles.typingDots}>
          <Animated.View style={[styles.typingDot, { opacity: fadeAnim }]} />
          <Animated.View style={[styles.typingDot, { opacity: fadeAnim }]} />
          <Animated.View style={[styles.typingDot, { opacity: fadeAnim }]} />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6956E5" />
      
      {/* Background overlay for menu */}
      {showChatMenu && (
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={handleOutsideClick}
        />
      )}
      
              {/* Header */}
        <SafeAreaView style={styles.headerSafeArea}>
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <View style={styles.botAvatar}>
                <Image 
                  source={require('../assets/images/ai_chatbot.png')} 
                  style={styles.botAvatarImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>인공지능 고향이에게{'\n'}무엇이든 물어보세요!</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.moreButton} onPress={handleChatMenu}>
              <Text style={styles.moreIcon}>⋯</Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      
      {/* Chat Menu */}
      {showChatMenu && (
        <Animated.View 
          style={[
            styles.chatMenu,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity style={styles.menuItem} onPress={handleNewChat}>
            <Text style={styles.menuIcon}>🆕</Text>
            <Text style={styles.menuText}>새로운 채팅</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleChatHistory}>
            <Text style={styles.menuIcon}>📋</Text>
            <Text style={styles.menuText}>채팅 목록</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Chat History Screen */}
      {showChatHistory && (
        <Animated.View 
          style={[
            styles.chatHistoryContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Chat History Header */}
          <SafeAreaView style={styles.chatHistorySafeArea}>
            <View style={styles.chatHistoryHeader}>
              <TouchableOpacity style={styles.backButton} onPress={handleBackToChat}>
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
              <Text style={styles.chatHistoryHeaderTitle}>채팅 목록</Text>
              <View style={styles.headerRight} />
            </View>
          </SafeAreaView>

          {/* Chat History List */}
          <ScrollView style={styles.chatHistoryList} showsVerticalScrollIndicator={false}>
            {chatHistory.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                style={styles.chatHistoryItem}
                onPress={() => handleSelectChat(chat)}
                onLongPress={() => handleDeleteChat(chat.id)}
              >
                <View style={styles.chatHistoryContent}>
                  <View style={styles.chatHistoryLeft}>
                    <View style={styles.chatHistoryAvatar}>
                      <Image 
                        source={require('../assets/images/ai_chatbot.png')} 
                        style={styles.chatHistoryAvatarImage}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.chatHistoryInfo}>
                      <Text style={styles.chatHistoryTitle}>{chat.title}</Text>
                      <Text style={styles.chatHistoryLastMessage} numberOfLines={1}>
                        {chat.lastMessage}
                      </Text>
                      <Text style={styles.chatHistoryTime}>{formatChatTime(chat.timestamp)}</Text>
                    </View>
                  </View>
                  <View style={styles.chatHistoryRight}>
                    <View style={styles.messageCountBadge}>
                      <Text style={styles.messageCountText}>{chat.messageCount}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.messagesContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <Animated.View
              key={message.id}
              style={[
                styles.messageContainer,
                message.type === 'user' ? styles.userMessage : styles.botMessage,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
                             {message.type === 'bot' && !message.isTyping && (
                 <View style={styles.botAvatarSmall}>
                   <Image 
                     source={require('../assets/images/ai_chatbot.png')} 
                     style={styles.botAvatarImageSmall}
                     resizeMode="contain"
                   />
                 </View>
               )}
              <View
                style={[
                  styles.messageBubble,
                  message.type === 'user' ? styles.userBubble : styles.botBubble,
                ]}
              >
                {message.isTyping ? (
                  renderTypingIndicator()
                ) : (
                  <>
                    <Text
                      style={[
                        styles.messageText,
                        message.type === 'user' ? styles.userText : styles.botText,
                      ]}
                    >
                      {message.text}
                    </Text>
                    <Text style={[
                      styles.timestamp,
                      message.type === 'user' && { color: 'rgba(255,255,255,0.7)' }
                    ]}>
                      {formatTime(message.timestamp)}
                    </Text>
                  </>
                )}
              </View>
                             {message.type === 'user' && (
                 <View style={styles.userAvatarSmall}>
                   <Image 
                     source={require('../assets/images/회원가입_귀향자.png')} 
                     style={styles.userAvatarImageSmall}
                     resizeMode="contain"
                   />
                 </View>
               )}
            </Animated.View>
          ))}
        </ScrollView>

        {/* Input Area */}
        <Animated.View 
          style={[
            styles.inputContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="메시지를 입력하세요..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={styles.voiceButton}
              onPress={handleVoiceInput}
              disabled={isRecording}
            >
              <Image 
                source={require('../assets/images/microphone.png')} 
                style={styles.buttonIcon}
              />
            </TouchableOpacity>
            <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendMessage}
                disabled={inputText.trim() === ''}
              >
                <Image 
                  source={require('../assets/images/paper-plane.png')} 
                  style={styles.buttonIcon}
                />
              </TouchableOpacity>
            </Animated.View>
          </View>
          
          {isRecording && (
            <Animated.View 
              style={[styles.recordingIndicator, { opacity: fadeAnim }]}
            >
              <Text style={styles.recordingText}>🎤 음성 입력 중...</Text>
            </Animated.View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#6956E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  backIcon: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  botAvatar: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  botAvatarImage: {
    width: 80,
    height: 80,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreIcon: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
  },
  chatMenu: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 140,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 999,
  },
  chatHistoryContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#6956E5',
    zIndex: 1001,
  },
  chatHistorySafeArea: {
    backgroundColor: '#6956E5',
  },
  chatHistoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#6956E5',
  },
  chatHistoryHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  chatHistoryList: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
  },
  chatHistoryItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginVertical: 6,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatHistoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatHistoryLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatHistoryAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatHistoryAvatarImage: {
    width: 32,
    height: 32,
  },
  chatHistoryInfo: {
    flex: 1,
  },
  chatHistoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  chatHistoryLastMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  chatHistoryTime: {
    fontSize: 12,
    color: '#999',
  },
  chatHistoryRight: {
    alignItems: 'center',
  },
  messageCountBadge: {
    backgroundColor: '#6956E5',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  messageCountText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  messagesList: {
    flex: 1,
    padding: 20,
  },
  messageContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userBubble: {
    backgroundColor: '#6956E5',
    borderBottomRightRadius: 8,
    marginLeft: 40,
  },
  botBubble: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    marginRight: 40,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFF',
    fontWeight: '600',
  },
  botText: {
    color: '#2C3E50',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
    alignSelf: 'flex-end',
    fontWeight: '500',
  },
  botAvatarSmall: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  botAvatarImageSmall: {
    width: 80,
    height: 80,
  },
  userAvatarSmall: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  userAvatarImageSmall: {
    width: 100,
    height: 100,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingBubble: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6956E5',
    marginHorizontal: 2,
  },
  inputContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  voiceButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sendButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    width: 38,
    height: 38,
  },
  recordingIndicator: {
    backgroundColor: '#FF5722',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordingText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ChatbotScreen;
