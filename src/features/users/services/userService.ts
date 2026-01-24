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
  getEmployees: async (skip = 0, limit = 100): Promise<User[]> => {
    const response = await api.get('/v1/users/employees', {
      params: { skip, limit },
    });
    return response.data.map(toCamelCase);
  },
};
