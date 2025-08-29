import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { getCurrentUser } from '../utils/storage';

const MessengerScreen = ({ navigation, route }) => {
  const { recipient, requestTitle, requestId } = route.params;
  const [currentUser, setCurrentUser] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: recipient,
      content: `안녕하세요! "${requestTitle}" 의뢰에 대해 문의드립니다.`,
      timestamp: '2024-01-15 14:30',
      isFromMe: false,
    },
  ]);

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

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      Alert.alert('알림', '메시지를 입력해주세요.');
      return;
    }

    const newMessage = {
      id: messages.length + 1,
      sender: currentUser?.returnName || currentUser?.name || '익명',
      content: messageText.trim(),
      timestamp: new Date().toLocaleString('ko-KR'),
      isFromMe: true,
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageText('');

    // 상대방 응답 시뮬레이션
    setTimeout(() => {
      const responseMessage = {
        id: messages.length + 2,
        sender: recipient,
        content: '네, 연락주셔서 감사합니다! 언제 가능하신지 알려주세요.',
        timestamp: new Date().toLocaleString('ko-KR'),
        isFromMe: false,
      };
      setMessages(prev => [...prev, responseMessage]);
    }, 2000);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{recipient}</Text>
            <Text style={styles.headerSubtitle}>의뢰: {requestTitle}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      {/* Messages */}
      <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {messages.map((message) => (
          <View 
            key={message.id} 
            style={[
              styles.messageContainer,
              message.isFromMe ? styles.myMessage : styles.otherMessage
            ]}
          >
            <View style={[
              styles.messageBubble,
              message.isFromMe ? styles.myBubble : styles.otherBubble
            ]}>
              <Text style={[
                styles.messageText,
                message.isFromMe ? styles.myMessageText : styles.otherMessageText
              ]}>
                {message.content}
              </Text>
              <Text style={[
                styles.messageTime,
                message.isFromMe ? styles.myMessageTime : styles.otherMessageTime
              ]}>
                {formatTime(message.timestamp)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="메시지를 입력하세요..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <Text style={styles.sendButtonText}>전송</Text>
        </TouchableOpacity>
      </View>
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
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#E0E0E0',
  },
  headerSpacer: {
    width: 40,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messageContainer: {
    marginBottom: 15,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myBubble: {
    backgroundColor: '#6956E5',
  },
  otherBubble: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
  },
  myMessageText: {
    color: '#FFF',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
  },
  myMessageTime: {
    color: '#E0E0E0',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#999',
  },
  inputContainer: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#6956E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MessengerScreen;
