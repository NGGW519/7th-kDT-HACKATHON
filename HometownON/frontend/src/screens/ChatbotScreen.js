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
} from 'react-native';
import { REACT_APP_API_URL } from '@env';

const ChatbotScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: '안녕하세요! 🤖\n저는 고향이 AI 어시스턴트입니다.\n무엇을 도와드릴까요?',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef();

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // 디버깅용 로그
  useEffect(() => {
    console.log('🔍 Current sessionId:', sessionId);
  }, [sessionId]);

  const handleSendMessage = () => {
    if (inputText.trim() === '' || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText,
      timestamp: new Date(),
    };

    const botMessagePlaceholder = { 
      id: Date.now() + 1, 
      type: 'bot', 
      text: '', 
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, botMessagePlaceholder]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    console.log('📤 Sending message with sessionId:', sessionId);

    const apiUrl = REACT_APP_API_URL || 'http://10.0.2.2:8000';
    const url = `${apiUrl}/api/chatbot/chat`;
    
    const requestBody = {
      message: currentInput,
      ...(sessionId && { session_id: sessionId }) // sessionId가 있을 때만 포함
    };

    console.log('📡 Request body:', requestBody);

    const xhr = new XMLHttpRequest();
    let processedLength = 0;

    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    // 응답 헤더에서 세션 ID 가져오기
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 2) { // HEADERS_RECEIVED
        const responseSessionId = xhr.getResponseHeader('X-Session-ID');
        if (responseSessionId && !sessionId) {
          console.log('🆕 Got new sessionId from header:', responseSessionId);
          setSessionId(parseInt(responseSessionId, 10));
        }
      }
    };
    
    // 스트리밍 데이터 처리
    xhr.onprogress = () => {
      const currentText = xhr.responseText;
      const newChunk = currentText.substring(processedLength);
      
      if (newChunk) {
        console.log('📨 Received chunk:', newChunk.substring(0, 50) + '...');
        
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.type === 'bot' && lastMessage.isLoading) {
            lastMessage.text += newChunk;
          }
          return newMessages;
        });
      }
      processedLength = currentText.length;
    };

    // 요청 완료 처리
    xhr.onload = () => {
      console.log('✅ Request completed with status:', xhr.status);
      setIsLoading(false);
      
      // 로딩 상태 제거
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.isLoading) {
          delete lastMessage.isLoading;
        }
        return newMessages;
      });

      if (xhr.status < 200 || xhr.status >= 300) {
        let errorDetail = '알 수 없는 오류가 발생했습니다.';
        try {
          const errorData = JSON.parse(xhr.responseText);
          errorDetail = errorData.detail || xhr.responseText;
        } catch (e) {
          errorDetail = xhr.responseText;
        }
        Alert.alert('오류', `HTTP ${xhr.status}: ${errorDetail}`);
        
        // 에러 시 메시지 제거
        setMessages(prev => prev.filter(m => 
          m.id !== userMessage.id && m.id !== botMessagePlaceholder.id
        ));
      }

      // 마지막 청크 처리
      const finalText = xhr.responseText;
      const finalChunk = finalText.substring(processedLength);
      if (finalChunk) {
        console.log('📨 Final chunk:', finalChunk.substring(0, 50) + '...');
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.type === 'bot') {
            lastMessage.text += finalChunk;
          }
          return newMessages;
        });
      }
    };

    // 네트워크 에러 처리
    xhr.onerror = () => {
      console.error('❌ Chat API error:', xhr.status, xhr.responseText);
      setIsLoading(false);
      Alert.alert('오류', '챗봇 서비스에 연결할 수 없습니다.');
      
      // 에러 시 메시지 제거
      setMessages(prev => prev.filter(m => 
        m.id !== userMessage.id && m.id !== botMessagePlaceholder.id
      ));
    };

    xhr.send(JSON.stringify(requestBody));
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6956E5" />
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>인공지능 고향이</Text>
            {/* 디버깅용: 현재 세션 ID 표시 */}
            {sessionId && (
              <Text style={styles.sessionDebug}>Session: {sessionId}</Text>
            )}
          </View>
          <View style={{width: 40}} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={styles.messagesContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesList}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.type === 'user' ? styles.userMessage : styles.botMessage,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.type === 'user' ? styles.userBubble : styles.botBubble,
                ]}
              >
                <Text style={[
                  styles.messageText,
                  message.type === 'user' ? styles.userMessageText : styles.botMessageText
                ]}>
                  {message.text || (message.isLoading ? '응답을 기다리는 중...' : '...')}
                </Text>
                <Text style={[
                  styles.timestamp,
                  message.type === 'user' ? styles.userTimestamp : styles.botTimestamp
                ]}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="메시지를 입력하세요..."
            placeholderTextColor="#999"
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={[styles.sendButton, isLoading && styles.sendButtonDisabled]} 
            onPress={handleSendMessage}
            disabled={isLoading}
          >
            <Text style={styles.sendButtonText}>
              {isLoading ? '전송중...' : '전송'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
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
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  sessionDebug: {
    fontSize: 12,
    color: '#E0E0E0',
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    marginVertical: 5,
    flexDirection: 'row',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#6956E5',
    borderBottomRightRadius: 5,
  },
  botBubble: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  userMessageText: {
    color: '#FFF',
  },
  botMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: '#E0E0E0',
  },
  botTimestamp: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    backgroundColor: '#FFF',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#6956E5',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatbotScreen;