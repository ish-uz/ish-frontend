import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Check, CheckCheck } from 'lucide-react';
import { chatService } from '../services/chatService';
import { Conversation } from '@/types';
import { userService } from '@/features/users/services/userService';

export function ChatsPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await userService.getCurrentUser();
        setCurrentUserId(user.id);
      } catch {
        navigate('/login');
      }
    };
    loadUser();
  }, [navigate]);

  useEffect(() => {
    if (currentUserId === null) return;
    loadConversations();
  }, [currentUserId]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const result = await chatService.getConversations();
      setConversations(result.conversations);
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.detail || 'Failed to load conversations');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than 24 hours
    if (diff < 86400000) {
      return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Less than 7 days
    if (diff < 604800000) {
      return date.toLocaleDateString('uz-UZ', { weekday: 'short' });
    }
    
    return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
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

  const getOtherParticipant = (conversation: Conversation) => {
    if (currentUserId === null) return undefined;
    // Show the other participant: if I'm employer → show applicant, else show employer
    return conversation.employerId === currentUserId ? conversation.applicant : conversation.employer;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 lg:py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <MessageCircle className="h-7 w-7 lg:h-8 lg:w-8 text-blue-600" />
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Messages</h1>
          </div>
          <p className="text-slate-600 text-sm lg:text-base">
            Your conversations with employers and candidates
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <MessageCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-500 mb-4">
              Conversations appear when your job applications are accepted or when you accept a chat invitation from the Employees page.
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden divide-y divide-gray-100">
            {conversations.map((conversation) => {
              const participant = getOtherParticipant(conversation);
              const lastMessage = conversation.lastMessage;
              
              return (
                <Link
                  key={conversation.id}
                  to={`/chat/${conversation.id}`}
                  className="flex items-center p-4 hover:bg-slate-50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 mr-4">
                    {participant?.avatar ? (
                      <img
                        src={participant.avatar}
                        alt={`${participant.firstName} ${participant.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {participant?.firstName?.[0] || '?'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {participant ? `${participant.firstName} ${participant.lastName}` : 'Unknown User'}
                      </h3>
                      {lastMessage && (
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatTime(lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    {conversation.jobTitle && (
                      <p className="text-xs text-blue-600 mb-1 truncate">
                        {conversation.jobTitle}
                      </p>
                    )}
                    
                    {lastMessage && (
                      <div className="flex items-center">
                        <p className="text-sm text-gray-600 truncate flex-1">
                          {lastMessage.content}
                        </p>
                        <span className="ml-2 flex-shrink-0">
                          {getStatusIcon(lastMessage.status)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Unread badge */}
                  {conversation.unreadCount > 0 && (
                    <div className="ml-3 flex-shrink-0">
                      <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-semibold text-white bg-blue-600 rounded-full">
                        {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
