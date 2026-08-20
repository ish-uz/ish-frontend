import { Message, WSMessage } from '@/types';

function getWebSocketUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const base = apiUrl.replace(/\/api\/?$/, '');
  const wsProtocol = base.startsWith('https') ? 'wss' : 'ws';
  const wsHost = base.replace(/^https?:\/\//, '');
  return `${wsProtocol}://${wsHost}/ws`;
}

const WS_BASE_URL = getWebSocketUrl();

type MessageListener = (data: WSMessage) => void;
type ConnectionListener = (connected: boolean) => void;

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let wantOpen = false;
let joinedConversationId: number | null = null;
let authenticated = false;

const messageListeners = new Set<MessageListener>();
const connectionListeners = new Set<ConnectionListener>();

function setConnected(connected: boolean) {
  connectionListeners.forEach((fn) => fn(connected));
}

function dispatch(data: WSMessage) {
  messageListeners.forEach((fn) => fn(data));
}

function sendJson(payload: Record<string, unknown>) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

function joinIfNeeded() {
  if (authenticated && joinedConversationId != null) {
    sendJson({ type: 'join', conversation_id: joinedConversationId });
  }
}

export function subscribeRealtime(listener: MessageListener) {
  messageListeners.add(listener);
  return () => {
    messageListeners.delete(listener);
  };
}

export function subscribeRealtimeConnection(listener: ConnectionListener) {
  connectionListeners.add(listener);
  listener(socket?.readyState === WebSocket.OPEN && authenticated);
  return () => {
    connectionListeners.delete(listener);
  };
}

export function connectRealtime() {
  wantOpen = true;
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    return;
  }

  authenticated = false;
  const ws = new WebSocket(`${WS_BASE_URL}/chat`);
  socket = ws;

  ws.onopen = () => {
    sendJson({ type: 'auth', token });
  };

  ws.onmessage = (event) => {
    try {
      const data: WSMessage = JSON.parse(event.data);
      if (data.type === 'auth_ok') {
        authenticated = true;
        setConnected(true);
        joinIfNeeded();
        return;
      }
      dispatch(data);
    } catch (err) {
      console.error('Failed to parse WebSocket message:', err);
    }
  };

  ws.onclose = (event) => {
    authenticated = false;
    setConnected(false);
    if (socket === ws) {
      socket = null;
    }
    if (wantOpen && event.code !== 1000 && event.code !== 4001) {
      reconnectTimer = setTimeout(() => {
        connectRealtime();
      }, 3000);
    }
  };

  ws.onerror = () => {
    // onclose handles reconnect
  };
}

export function disconnectRealtime() {
  wantOpen = false;
  authenticated = false;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (socket) {
    socket.close(1000, 'User disconnected');
    socket = null;
  }
  setConnected(false);
}

export function joinRealtimeConversation(conversationId: number) {
  joinedConversationId = conversationId;
  joinIfNeeded();
}

export function leaveRealtimeConversation(conversationId: number) {
  if (authenticated) {
    sendJson({ type: 'leave', conversation_id: conversationId });
  }
  if (joinedConversationId === conversationId) {
    joinedConversationId = null;
  }
}

export function sendRealtimeMessage(conversationId: number, content: string): boolean {
  if (socket?.readyState === WebSocket.OPEN && authenticated) {
    sendJson({ type: 'message', conversation_id: conversationId, content });
    return true;
  }
  return false;
}

export function markRealtimeRead(conversationId: number) {
  sendJson({ type: 'read', conversation_id: conversationId });
}

export function markRealtimeDelivered(messageId: number) {
  sendJson({ type: 'delivered', message_id: messageId });
}

export function parseRealtimeMessage(data: WSMessage['data']): Message {
  return {
    id: data.id,
    conversationId: data.conversationId,
    senderId: data.senderId,
    content: data.content,
    status: data.status,
    createdAt: data.createdAt,
    readAt: data.readAt,
  };
}
