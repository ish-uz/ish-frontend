import api from '@/services/api';
import { User } from '@/types';

// Convert snake_case response to camelCase
const toCamelCase = (data: any): User => ({
  id: data.id,
  email: data.email,
  phone: data.phone,
  firstName: data.first_name,
  lastName: data.last_name,
  avatar: data.avatar,
  telegramId: data.telegram_id ?? undefined,
  role: data.role,
  isActive: data.is_active,
  isVerified: data.is_verified,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

export const userService = {
  /**
   * Get current user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/v1/users/me');
    return toCamelCase(response.data);
  },

  /**
   * Upload avatar image (replaces existing). Returns updated user.
   */
  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/v1/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return toCamelCase(response.data);
  },

  /**
   * Remove current user's avatar
   */
  deleteAvatar: async (): Promise<User> => {
    const response = await api.delete('/v1/users/me/avatar');
    return toCamelCase(response.data);
  },

  /**
   * Change password (current user). Requires current password.
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/v1/users/me/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  /**
   * Permanently delete the current user's account. Requires password confirmation.
   */
  deleteAccount: async (password: string): Promise<void> => {
    await api.delete('/v1/users/me', {
      data: { password },
    });
  },

  /**
   * Update current user
   */
  updateCurrentUser: async (data: Partial<User>): Promise<User> => {
    // Convert camelCase to snake_case for backend
    const snakeData: any = {};
    if (data.firstName !== undefined) snakeData.first_name = data.firstName;
    if (data.lastName !== undefined) snakeData.last_name = data.lastName;
    if (data.email !== undefined) snakeData.email = data.email;
    if (data.phone !== undefined) snakeData.phone = data.phone;
    if (data.avatar !== undefined) snakeData.avatar = data.avatar;
    
    const response = await api.put('/v1/users/me', snakeData);
    return toCamelCase(response.data);
  },

  /**
   * Get employees (users who are open to work)
   */
  getEmployees: async (skip = 0, limit = 20, skills?: string[]): Promise<{ users: User[]; total: number }> => {
    const params: any = { skip, limit };
    if (skills && skills.length > 0) {
      params.skills = skills.join(',');
    }
    const response = await api.get('/v1/users/employees', { params });
    
    // Handle both old format (array) and new format (PaginatedResponse)
    if (Array.isArray(response.data)) {
      return { users: response.data.map(toCamelCase), total: response.data.length };
    }
    
    return {
      users: response.data.items.map(toCamelCase),
      total: response.data.total,
    };
  },
};
