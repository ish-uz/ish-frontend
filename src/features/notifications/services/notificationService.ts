import api from '@/services/api';

export interface InboxNotification {
  id: number;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  items: InboxNotification[];
  total: number;
  unreadCount: number;
}

export const notificationService = {
  list: async (skip = 0, limit = 50): Promise<NotificationListResponse> => {
    const response = await api.get('/v1/notifications', { params: { skip, limit } });
    const d = response.data;
    return {
      items: d.items ?? [],
      total: Number(d.total ?? 0),
      unreadCount: Number(d.unreadCount ?? d.unread_count ?? 0),
    };
  },

  markRead: async (id: number): Promise<InboxNotification> => {
    const response = await api.patch(`/v1/notifications/${id}/read`);
    return response.data;
  },

  markAllRead: async (): Promise<void> => {
    await api.patch('/v1/notifications/read-all');
  },
};
