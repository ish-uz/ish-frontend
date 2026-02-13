import api from '@/services/api';
import { ChatInvitation } from '@/types';

const toCamelCase = (data: any): ChatInvitation => ({
  id: data.id,
  fromUserId: data.from_user_id ?? data.fromUserId,
  toUserId: data.to_user_id ?? data.toUserId,
  message: data.message,
  status: data.status,
  conversationId: data.conversation_id ?? data.conversationId,
  createdAt: data.created_at ?? data.createdAt,
  fromUser: data.from_user ?? data.fromUser,
  toUser: data.to_user ?? data.toUser,
});

export const invitationService = {
  /**
   * Send a chat invitation to a user (e.g. from Employees page)
   */
  create: async (toUserId: number, message?: string): Promise<ChatInvitation> => {
    const response = await api.post('/v1/invitations', {
      toUserId,
      message: message || undefined,
    });
    return toCamelCase(response.data);
  },

  /**
   * List my invitations (received and/or sent)
   */
  list: async (params?: {
    skip?: number;
    limit?: number;
    received?: boolean;
    sent?: boolean;
  }): Promise<{ items: ChatInvitation[]; total: number }> => {
    const response = await api.get('/v1/invitations', { params: params ?? {} });
    return {
      items: (response.data.items || []).map(toCamelCase),
      total: response.data.total ?? 0,
    };
  },

  /**
   * List invitations I received (for accept/reject)
   */
  listReceived: async (skip = 0, limit = 50): Promise<{ items: ChatInvitation[]; total: number }> => {
    const response = await api.get('/v1/invitations/received', { params: { skip, limit } });
    return {
      items: (response.data.items || []).map(toCamelCase),
      total: response.data.total ?? 0,
    };
  },

  /**
   * Accept an invitation; returns invitation with conversationId. Navigate to /chat/{conversationId}.
   */
  accept: async (invitationId: number): Promise<ChatInvitation> => {
    const response = await api.post(`/v1/invitations/${invitationId}/accept`);
    return toCamelCase(response.data);
  },

  /**
   * Reject an invitation
   */
  reject: async (invitationId: number): Promise<ChatInvitation> => {
    const response = await api.post(`/v1/invitations/${invitationId}/reject`);
    return toCamelCase(response.data);
  },
};
