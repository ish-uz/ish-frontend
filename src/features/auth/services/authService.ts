import api from '@/services/api';

export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/v1/auth/login', credentials);
    return response.data;
  },

  /**
   * Login with Telegram code (from bot)
   */
  telegramLogin: async (code: string): Promise<AuthResponse> => {
    const response = await api.post('/v1/auth/telegram/login', { code: code.trim() });
    return response.data;
  },

  /**
   * Link Telegram to current account (requires auth). Submit code from bot.
   */
  telegramLink: async (code: string): Promise<any> => {
    const response = await api.post('/v1/auth/telegram/link', { code: code.trim() });
    return response.data;
  },

  /**
   * Register user
   * Converts camelCase to snake_case for backend
   */
  register: async (data: RegisterData): Promise<any> => {
    // Convert camelCase to snake_case
    const backendData = {
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      email: data.email,
      password: data.password,
    };
    
    const response = await api.post('/v1/auth/register', backendData);
    return response.data;
  },
};
