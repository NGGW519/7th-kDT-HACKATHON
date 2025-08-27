import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useChat, ChatMessage } from './useChat';

const ChatScreen = () => {
  const [inputText, setInputText] = useState('');
  const { messages, isLoading, sendMessage } = useChat([
    { role: 'system', content: 'You are a helpful assistant.' }
  ]);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (inputText.trim() && !isLoading) {
      sendMessage(inputText);
      setInputText('');
    }
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    if (item.role === 'system') return null; // 시스템 메시지는 화면에 표시하지 않습니다.
    return (
      <View style={[styles.messageBubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
        <Text style={item.role === 'user' ? styles.userMessageText : styles.assistantMessageText}>
          {item.content}
        </Text>
        {item.role === 'assistant' && isLoading && messages[messages.length -1] === item && 
            <ActivityIndicator size="small" color="#666" style={{marginTop: 5}}/>
        }
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages.filter(m => m.role !== 'system')}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          style={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="메시지를 입력하세요..."
            editable={!isLoading}
            onSubmitEditing={handleSend} // 엔터키로 전송
          />
          <Button title="전송" onPress={handleSend} disabled={isLoading} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  messageList: { paddingHorizontal: 10 },
  inputContainer: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: '#ddd', backgroundColor: 'white' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10, backgroundColor: 'white' },
  messageBubble: { padding: 12, borderRadius: 18, marginVertical: 5, maxWidth: '80%' },
  userBubble: { backgroundColor: '#007bff', alignSelf: 'flex-end' },
  assistantBubble: { backgroundColor: '#e9e9eb', alignSelf: 'flex-start' },
  userMessageText: { color: 'white', fontSize: 16 },
  assistantMessageText: { color: 'black', fontSize: 16 },
});

export default ChatScreen;
