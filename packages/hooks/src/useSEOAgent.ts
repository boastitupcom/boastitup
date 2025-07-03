// hooks/useSEOAgent.ts

import { useState, useEffect, useRef, useCallback } from 'react';

interface Message {
  type: 'welcome' | 'response' | 'error' | 'typing' | 'cleared';
  message: string;
  session_id: string;
  timestamp: string;
  research?: any;
  strategy?: any;
  conversation_summary?: {
    total_messages: number;
    steps_taken: number;
    last_response: string;
    conversation_active: boolean;
  };
  metadata?: {
    steps_taken: number;
    total_messages: number;
  };
}

interface SendMessagePayload {
  message: string;
  topic: string;
  focusKeyword: string;
  targetAudience?: string;
}

interface UseSEOAgentReturn {
  messages: Message[];
  isConnected: boolean;
  isTyping: boolean;
  sendMessage: (payload: SendMessagePayload) => void;
  clearConversation: () => void;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  conversationSummary: Message['conversation_summary'] | null;
}

export const useSEOAgent = (sessionId: string = 'default'): UseSEOAgentReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [conversationSummary, setConversationSummary] = useState<Message['conversation_summary'] | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    
    const wsUrl = `ws://localhost:8000/ws/${sessionId}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log(`✅ WebSocket connected for session: ${sessionId}`);
      setIsConnected(true);
      setConnectionStatus('connected');
      reconnectAttempts.current = 0;
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message: Message = JSON.parse(event.data);

        if (message.type === 'typing') {
          setIsTyping(true);
          return;
        }

        if (message.type === 'response') {
          setIsTyping(false);
          if (message.conversation_summary) {
            setConversationSummary(message.conversation_summary);
          }
        }

        setMessages(prev => [...prev, message]);
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error);
      }
    };

    wsRef.current.onclose = (event) => {
      console.log('🔌 WebSocket disconnected:', event.code, event.reason);
      setIsConnected(false);
      setIsTyping(false);
      setConnectionStatus('disconnected');

      if (reconnectAttempts.current < maxReconnectAttempts) {
        const timeout = Math.pow(2, reconnectAttempts.current) * 1000;
        console.log(`⏳ Reconnecting in ${timeout}ms... (attempt ${reconnectAttempts.current + 1})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, timeout);
      } else {
        setConnectionStatus('error');
        console.error('🚫 Max reconnection attempts reached');
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('🛑 WebSocket error:', error);
      setConnectionStatus('error');
    };
  }, [sessionId]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const sendMessage = useCallback(
    ({ message, topic, focusKeyword, targetAudience }: SendMessagePayload) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const payload = {
          type: 'chat',
          session_id: sessionId,
          message: message.trim(),
          topic,
          focus_keyword: focusKeyword,
          target_audience: targetAudience || null,
          timestamp: new Date().toISOString()
        };

        wsRef.current.send(JSON.stringify(payload));

        const userMessage: Message = {
          type: 'response',
          message: `You: ${message}`,
          session_id: sessionId,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
      } else {
        console.error('WebSocket is not connected');
      }
    },
    [sessionId]
  );

  const clearConversation = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const payload = {
        type: 'clear',
        timestamp: new Date().toISOString()
      };

      wsRef.current.send(JSON.stringify(payload));
      setMessages([]);
      setConversationSummary(null);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    messages,
    isConnected,
    isTyping,
    sendMessage,
    clearConversation,
    connectionStatus,
    conversationSummary
  };
};
export default useSEOAgent;