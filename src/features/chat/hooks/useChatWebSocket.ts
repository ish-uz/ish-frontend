import { useEffect, useRef, useCallback, useState } from 'react';
import { Message, WSMessage } from '@/types';
import {
  connectRealtime,
  disconnectRealtime,
  joinRealtimeConversation,
  leaveRealtimeConversation,
  markRealtimeDelivered,
  markRealtimeRead,
  parseRealtimeMessage,
  sendRealtimeMessage,
  subscribeRealtime,
  subscribeRealtimeConnection,
} from '../realtime';

interface UseChatWebSocketOptions {
  onNewMessage?: (message: Message) => void;
  onMessageDelivered?: (messageId: number) => void;
  onMessageRead?: (messageId: number) => void;
  onMessagesRead?: (conversationId: number, count: number) => void;
  onInvitation?: (data: Record<string, unknown>) => void;
  onApplication?: (data: Record<string, unknown>) => void;
  onNotification?: (data: Record<string, unknown>) => void;
  onError?: (error: string) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export function useChatWebSocket(options: UseChatWebSocketOptions = {}) {
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const unsubConn = subscribeRealtimeConnection((connected) => {
      setIsConnected(connected);
      optionsRef.current.onConnectionChange?.(connected);
    });
    const unsubMsg = subscribeRealtime((data: WSMessage) => {
      const opts = optionsRef.current;
      switch (data.type) {
        case 'new_message':
          opts.onNewMessage?.(parseRealtimeMessage(data.data));
          break;
        case 'message_delivered':
          opts.onMessageDelivered?.(data.data.messageId);
          break;
        case 'message_read':
          opts.onMessageRead?.(data.data.messageId);
          break;
        case 'messages_read':
          opts.onMessagesRead?.(data.data.conversationId, data.data.count);
          break;
        case 'invitation':
          opts.onInvitation?.(data.data);
          break;
        case 'application':
          opts.onApplication?.(data.data);
          break;
        case 'notification':
          opts.onNotification?.(data.data);
          break;
        case 'error':
          opts.onError?.(data.data.message);
          break;
      }
    });
    return () => {
      unsubConn();
      unsubMsg();
    };
  }, []);

  const connect = useCallback(() => {
    connectRealtime();
  }, []);

  const disconnect = useCallback(() => {
    disconnectRealtime();
  }, []);

  const joinConversation = useCallback((conversationId: number) => {
    joinRealtimeConversation(conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: number) => {
    leaveRealtimeConversation(conversationId);
  }, []);

  const sendMessage = useCallback((conversationId: number, content: string) => {
    return sendRealtimeMessage(conversationId, content);
  }, []);

  const markAsRead = useCallback((conversationId: number) => {
    markRealtimeRead(conversationId);
  }, []);

  const markAsDelivered = useCallback((messageId: number) => {
    markRealtimeDelivered(messageId);
  }, []);

  return {
    isConnected,
    connect,
    disconnect,
    joinConversation,
    leaveConversation,
    sendMessage,
    markAsRead,
    markAsDelivered,
  };
}
