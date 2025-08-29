import { useState, useCallback } from 'react';

// 대화 메시지의 구조를 정의합니다.
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// 챗봇의 상태와 로직을 관리하는 커스텀 훅입니다.
export const useChat = (initialMessages: ChatMessage[] = []) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (newMessageContent: string) => {
    setIsLoading(true);

    // 사용자의 새 메시지를 대화 목록에 추가합니다.
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: newMessageContent },
    ];
    setMessages(newMessages);

    // 어시스턴트의 답변을 받을 준비를 합니다. (빈 메시지 추가)
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/v1/chat/stream', { // Nginx가 이 요청을 백엔드로 프록시합니다.
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });
        
        // SSE 형식(data: <content>\n\n)을 파싱합니다.
        const lines = chunk.split('\n\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data.includes('[INTERNAL_SERVER_ERROR]')) {
               setMessages(prev => {
                  const lastMsg = { ...prev[prev.length - 1] };
                  lastMsg.content += "서버에서 오류가 발생했습니다.";
                  return [...prev.slice(0, -1), lastMsg];
               });
               break;
            }
            // 스트리밍으로 받은 내용을 마지막 메시지에 계속 추가합니다.
            setMessages(prev => {
              const lastMsg = { ...prev[prev.length - 1] };
              lastMsg.content += data;
              return [...prev.slice(0, -1), lastMsg];
            });
          }
        }
      }
    } catch (error) {
      console.error('챗 스트림 요청 중 오류 발생:', error);
       setMessages(prev => {
          const lastMsg = { ...prev[prev.length - 1] };
          lastMsg.content = "서버에 연결하지 못했습니다.";
          return [...prev.slice(0, -1), lastMsg];
       });
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return { messages, isLoading, sendMessage };
};