import api from '@/services/api';

const FCM_TOKEN_KEY = 'fcmWebToken';

export const deviceService = {
  register: async (token: string, platform: 'android' | 'ios' | 'web') => {
    const response = await api.post('/v1/devices', { token, platform });
    return response.data;
  },

  unregister: async (token: string) => {
    await api.delete('/v1/devices', { params: { token } });
  },
};

export function getStoredFcmToken(): string | null {
  return localStorage.getItem(FCM_TOKEN_KEY);
}

export function storeFcmToken(token: string) {
  localStorage.setItem(FCM_TOKEN_KEY, token);
}

export function clearStoredFcmToken() {
  localStorage.removeItem(FCM_TOKEN_KEY);
}
