import { useEffect, useRef, useCallback, useState } from 'react';
import { Message, WSMessage } from '@/types';

const WS_BASE_URL = 'ws://localhost:8000/ws';

interface UseChatWebSocketOptions {
  onNewMessage?: (message: Message) => void;
  onMessageDelivered?: (messageId: number) => void;
  onMessageRead?: (messageId: number) => void;
  onMessagesRead?: (conversationId: number, count: number) => void;
  onError?: (error: string) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export function useChatWebSocket(options: UseChatWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [isConnected, setIsConnected] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);

  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, cannot connect to WebSocket');
      return;
    }

    // Don't connect if already connected
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const ws = new WebSocket(`${WS_BASE_URL}/chat?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      options.onConnectionChange?.(true);
      
      // Rejoin conversation if we were in one
      if (currentConversationId) {
        ws.send(JSON.stringify({ type: 'join', conversation_id: currentConversationId }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data: WSMessage = JSON.parse(event.data);
        
        switch (data.type) {
          case 'new_message':
            const message: Message = {
              id: data.data.id,
              conversationId: data.data.conversationId,
              senderId: data.data.senderId,
              content: data.data.content,
              status: data.data.status,
              createdAt: data.data.createdAt,
              readAt: data.data.readAt,
            };
            options.onNewMessage?.(message);
            break;
            
          case 'message_delivered':
            options.onMessageDelivered?.(data.data.messageId);
            break;
            
          case 'message_read':
            options.onMessageRead?.(data.data.messageId);
            break;
            
          case 'messages_read':
            options.onMessagesRead?.(data.data.conversationId, data.data.count);
            break;
            
          case 'error':
            options.onError?.(data.data.message);
            break;
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      options.onConnectionChange?.(false);
      
      // Reconnect after 3 seconds if not intentionally closed
      if (event.code !== 1000) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [currentConversationId, options]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const joinConversation = useCallback((conversationId: number) => {
    setCurrentConversationId(conversationId);
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ 
        type: 'join', 
        conversation_id: conversationId 
      }));
    }
  }, []);

  const leaveConversation = useCallback((conversationId: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ 
        type: 'leave', 
        conversation_id: conversationId 
      }));
    }
    
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
    }
  }, [currentConversationId]);

  const sendMessage = useCallback((conversationId: number, content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ 
        type: 'message', 
        conversation_id: conversationId,
        content 
      }));
      return true;
    }
    return false;
  }, []);

  const markAsRead = useCallback((conversationId: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ 
        type: 'read', 
        conversation_id: conversationId 
      }));
    }
  }, []);

  const markAsDelivered = useCallback((messageId: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ 
        type: 'delivered', 
        message_id: messageId 
      }));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

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
