import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send, Check, CheckCheck, AlertCircle } from 'lucide-react';
import { chatService } from '../services/chatService';
import { useChatWebSocket } from '../hooks/useChatWebSocket';
import { Conversation, Message } from '@/types';
import { userService } from '@/features/users/services/userService';

export function ChatPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const conversationId = parseInt(id || '0');
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Reference to markAsRead function for use in callbacks
  const markAsReadRef = useRef<((conversationId: number) => void) | null>(null);

  // WebSocket handlers
  const handleNewMessage = useCallback((message: Message) => {
    if (message.conversationId === conversationId) {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
      
      // Mark as read via WebSocket if it's from the other user
      if (currentUserId && message.senderId !== currentUserId) {
        // Use WebSocket to notify sender that message was read
        if (markAsReadRef.current) {
          markAsReadRef.current(conversationId);
        }
      }
    }
  }, [conversationId, currentUserId]);

  const handleMessageDelivered = useCallback((messageId: number) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, status: 'delivered' as const } : m
    ));
  }, []);

  const handleMessagesRead = useCallback((convId: number, _count: number) => {
    if (convId === conversationId) {
      setMessages(prev => prev.map(m => 
        m.senderId === currentUserId ? { ...m, status: 'read' as const } : m
      ));
    }
  }, [conversationId, currentUserId]);

  const { 
    isConnected, 
    connect, 
    disconnect: _disconnect, 
    joinConversation, 
    leaveConversation,
    sendMessage: wsSendMessage,
    markAsRead 
  } = useChatWebSocket({
    onNewMessage: handleNewMessage,
    onMessageDelivered: handleMessageDelivered,
    onMessagesRead: handleMessagesRead,
  });

  // Update ref when markAsRead changes
  useEffect(() => {
    markAsReadRef.current = markAsRead;
  }, [markAsRead]);

  // Load current user
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await userService.getCurrentUser();
        setCurrentUserId(user.id);
      } catch (err) {
        navigate('/login');
      }
    };
    loadCurrentUser();
  }, [navigate]);

  // Load conversation and messages
  useEffect(() => {
    if (!conversationId || !currentUserId) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        
        const [convData, messagesData] = await Promise.all([
          chatService.getConversation(conversationId),
          chatService.getMessages(conversationId),
        ]);
        
        setConversation(convData);
        setMessages(messagesData.messages);
        setHasMore(messagesData.hasMore);
        
        // Mark as read so server count updates; notify layout to refresh badge
        await chatService.markConversationAsRead(conversationId);
        window.dispatchEvent(new CustomEvent('ish:refresh-message-unread'));
        
      } catch (err: any) {
        if (err.response?.status === 401) {
          navigate('/login');
        } else if (err.response?.status === 403 || err.response?.status === 404) {
          navigate('/chat');
        } else {
          setError(err.response?.data?.detail || 'Failed to load conversation');
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [conversationId, currentUserId, navigate]);

  // Connect WebSocket and join conversation
  useEffect(() => {
    if (!conversationId || !currentUserId) return;
    
    connect();
    
    return () => {
      leaveConversation(conversationId);
    };
  }, [conversationId, currentUserId, connect, leaveConversation]);

  // Join conversation when connected and mark as read
  useEffect(() => {
    if (isConnected && conversationId) {
      joinConversation(conversationId);
      // Mark messages as read via WebSocket to notify sender
      markAsRead(conversationId);
    }
  }, [isConnected, conversationId, joinConversation, markAsRead]);

  // Scroll to bottom: instant when opening chat (like messengers), smooth when new message at end
  const isInitialScrollDone = useRef(false);
  const lastMessageIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (messages.length === 0) return;
    const lastId = messages[messages.length - 1]?.id ?? null;
    const isNewMessageAtEnd = lastMessageIdRef.current !== lastId;
    lastMessageIdRef.current = lastId;

    const instant = !isInitialScrollDone.current;
    if (instant) {
      isInitialScrollDone.current = true;
      const rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = messagesContainerRef.current;
          if (el) el.scrollTop = el.scrollHeight;
          messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        });
      });
      return () => cancelAnimationFrame(rafId);
    }
    // Only scroll to bottom when a new message was added at end (send/receive), not when loading more
    if (isNewMessageAtEnd) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Reset when switching conversation
  useEffect(() => {
    isInitialScrollDone.current = false;
    lastMessageIdRef.current = null;
  }, [conversationId]);

  // Load more messages
  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore || messages.length === 0) return;
    
    try {
      setLoadingMore(true);
      const firstMessage = messages[0];
      const result = await chatService.getMessages(conversationId, 0, 50, firstMessage.id);
      
      setMessages(prev => [...result.messages, ...prev]);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Failed to load more messages:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Handle send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const content = newMessage.trim();
    if (!content || sending) return;
    
    setSending(true);
    setNewMessage('');
    
    // Try WebSocket first
    const sent = wsSendMessage(conversationId, content);
    
    if (!sent) {
      // Fallback to REST API
      try {
        const message = await chatService.sendMessage(conversationId, content);
        setMessages(prev => [...prev, message]);
      } catch (err: any) {
        setError(t('pages.chat.sendError'));
        setNewMessage(content); // Restore message
      }
    }
    
    setSending(false);
    inputRef.current?.focus();
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return t('pages.chat.today');
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return t('pages.chat.yesterday');
    }
    return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'read':
        return <CheckCheck className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <CheckCheck className="h-4 w-4 text-gray-400" />;
      default:
        return <Check className="h-4 w-4 text-gray-400" />;
    }
  };

  const getOtherParticipant = () => {
    if (!conversation || !currentUserId) return null;
    
    if (conversation.employerId === currentUserId) {
      return conversation.applicant;
    }
    return conversation.employer;
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';
    
    messages.forEach(message => {
      const messageDate = new Date(message.createdAt).toDateString();
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groups.push({ date: message.createdAt, messages: [message] });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });
    
    return groups;
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('pages.chat.loading')}</p>
        </div>
      </div>
    );
  }

  const participant = getOtherParticipant();
  const messageGroups = groupMessagesByDate();

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <Link
          to="/chat"
          className="mr-3 p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        
        <div className="flex items-center flex-1 min-w-0">
          {participant?.avatar ? (
            <img
              src={participant.avatar}
              alt={`${participant.firstName} ${participant.lastName}`}
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-3">
              <span className="text-white font-semibold">
                {participant?.firstName?.[0] || '?'}
              </span>
            </div>
          )}
          
          <div className="min-w-0">
            <h2 className="font-semibold text-slate-900 truncate">
              {participant ? `${participant.firstName} ${participant.lastName}` : t('pages.chat.unknownUser')}
            </h2>
            {conversation?.jobTitle && (
              <p className="text-xs text-blue-600 truncate">{conversation.jobTitle}</p>
            )}
          </div>
        </div>
        
        {/* Connection status */}
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4"
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          if (target.scrollTop < 100 && hasMore && !loadingMore) {
            loadMoreMessages();
          }
        }}
      >
        {loadingMore && (
          <div className="text-center py-2">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}
        
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <span className="px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
                {formatDate(group.date)}
              </span>
            </div>
            
            {/* Messages */}
            {group.messages.map((message) => {
              const isOwn = message.senderId === currentUserId;
              
              return (
                <div
                  key={message.id}
                  className={`flex mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-white text-slate-900 rounded-bl-md shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    <div className={`flex items-center justify-end mt-1 space-x-1 ${
                      isOwn ? 'text-blue-200' : 'text-gray-400'
                    }`}>
                      <span className="text-xs">{formatTime(message.createdAt)}</span>
                      {isOwn && getStatusIcon(message.status)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('pages.chat.placeholder')}
              rows={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32"
              style={{ minHeight: '48px' }}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
