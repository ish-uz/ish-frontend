import api from '@/services/api';
import { Conversation, Message, ChatWithUserResponse } from '@/types';

const toCamelCase = (data: any): any => {
  if (!data) return data;
  
  return {
    id: data.id,
    conversationId: data.conversation_id ?? data.conversationId,
    applicationId: data.application_id ?? data.applicationId,
    employerId: data.employer_id ?? data.employerId,
    applicantId: data.applicant_id ?? data.applicantId,
    senderId: data.sender_id ?? data.senderId,
    content: data.content,
    status: data.status,
    createdAt: data.created_at ?? data.createdAt,
    updatedAt: data.updated_at ?? data.updatedAt,
    readAt: data.read_at ?? data.readAt,
    unreadCount: data.unread_count ?? data.unreadCount ?? 0,
    jobTitle: data.job_title ?? data.jobTitle,
    jobId: data.job_id ?? data.jobId,
    employer: data.employer ? {
      id: data.employer.id,
      firstName: data.employer.first_name ?? data.employer.firstName,
      lastName: data.employer.last_name ?? data.employer.lastName,
      avatar: data.employer.avatar,
    } : undefined,
    applicant: data.applicant ? {
      id: data.applicant.id,
      firstName: data.applicant.first_name ?? data.applicant.firstName,
      lastName: data.applicant.last_name ?? data.applicant.lastName,
      avatar: data.applicant.avatar,
    } : undefined,
    lastMessage: data.last_message ?? data.lastMessage ? toCamelCase(data.last_message ?? data.lastMessage) : undefined,
    hasMore: data.has_more ?? data.hasMore,
  };
};

export const chatService = {
  /**
   * Get all conversations for current user
   */
  getConversations: async (skip = 0, limit = 20): Promise<{ conversations: Conversation[]; total: number }> => {
    const response = await api.get('/v1/chat', {
      params: { skip, limit },
    });
    return {
      conversations: response.data.items.map(toCamelCase),
      total: response.data.total,
    };
  },

  /**
   * Get conversation by ID
   */
  getConversation: async (conversationId: number): Promise<Conversation> => {
    const response = await api.get(`/v1/chat/${conversationId}`);
    return toCamelCase(response.data);
  },

  /**
   * Get conversation by application ID
   */
  getConversationByApplication: async (applicationId: number): Promise<Conversation | null> => {
    const response = await api.get(`/v1/chat/application/${applicationId}`);
    return response.data ? toCamelCase(response.data) : null;
  },

  /**
   * Get chat status with a user (conversation and/or pending invitations). Use for Employees/Profile to show Open chat vs Send invitation.
   */
  getChatWithUser: async (userId: number): Promise<ChatWithUserResponse> => {
    const response = await api.get(`/v1/chat/with-user/${userId}`);
    const d = response.data;
    const mapInv = (inv: any) =>
      inv
        ? {
            id: inv.id,
            fromUserId: inv.from_user_id ?? inv.fromUserId,
            toUserId: inv.to_user_id ?? inv.toUserId,
            message: inv.message,
            status: inv.status,
            conversationId: inv.conversation_id ?? inv.conversationId,
            createdAt: inv.created_at ?? inv.createdAt,
            fromUser: inv.from_user ?? inv.fromUser,
            toUser: inv.to_user ?? inv.toUser,
          }
        : undefined;
    return {
      conversation: d.conversation ? toCamelCase(d.conversation) : undefined,
      pendingInvitationFromMe: mapInv(d.pending_invitation_from_me ?? d.pendingInvitationFromMe),
      pendingInvitationFromThem: mapInv(d.pending_invitation_from_them ?? d.pendingInvitationFromThem),
    };
  },

  /**
   * Get messages for a conversation
   */
  getMessages: async (
    conversationId: number,
    skip = 0,
    limit = 50,
    beforeId?: number
  ): Promise<{ messages: Message[]; total: number; hasMore: boolean }> => {
    const params: any = { skip, limit };
    if (beforeId) params.before_id = beforeId;
    
    const response = await api.get(`/v1/chat/${conversationId}/messages`, { params });
    return {
      messages: response.data.items.map(toCamelCase),
      total: response.data.total,
      hasMore: response.data.has_more ?? response.data.hasMore ?? false,
    };
  },

  /**
   * Send a message
   */
  sendMessage: async (conversationId: number, content: string): Promise<Message> => {
    const response = await api.post(`/v1/chat/${conversationId}/messages`, { content });
    return toCamelCase(response.data);
  },

  /**
   * Mark all messages in conversation as read
   */
  markConversationAsRead: async (conversationId: number): Promise<{ markedAsRead: number }> => {
    const response = await api.put(`/v1/chat/${conversationId}/read`);
    return { markedAsRead: response.data.marked_as_read };
  },

  /**
   * Mark message as delivered
   */
  markMessageAsDelivered: async (messageId: number): Promise<Message> => {
    const response = await api.put(`/v1/chat/messages/${messageId}/delivered`);
    return toCamelCase(response.data);
  },

  /**
   * Mark message as read
   */
  markMessageAsRead: async (messageId: number): Promise<Message> => {
    const response = await api.put(`/v1/chat/messages/${messageId}/read`);
    return toCamelCase(response.data);
  },
};
