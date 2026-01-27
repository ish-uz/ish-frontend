import api from '@/services/api';
import { Profile } from '@/types';

export const profileService = {
  /**
   * Get current user's profile
   */
  getCurrentProfile: async (): Promise<Profile> => {
    const response = await api.get('/v1/profiles/me');
    return response.data;
  },

  /**
   * Get profile by user ID
   */
  getProfileByUserId: async (userId: number): Promise<Profile> => {
    const response = await api.get(`/v1/profiles/user/${userId}`);
    return response.data;
  },

  /**
   * Create profile
   */
  createProfile: async (data: Partial<Profile>): Promise<Profile> => {
    const response = await api.post('/v1/profiles', data);
    return response.data;
  },

  /**
   * Update profile
   */
  updateProfile: async (data: Partial<Profile>): Promise<Profile> => {
    const response = await api.put('/v1/profiles/me', data);
    return response.data;
  },

  /**
   * Update Open To Work status
   */
  updateOpenToWork: async (openToJobSeeker: boolean): Promise<Profile> => {
    const response = await api.patch('/v1/profiles/me/open-to-work', {
      open_to_job_seeker: openToJobSeeker,
    });
    return response.data;
  },

  /**
   * Upload CV file
   */
  uploadCV: async (file: File): Promise<Profile> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/v1/profiles/me/cv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete CV file
   */
  deleteCV: async (): Promise<Profile> => {
    const response = await api.delete('/v1/profiles/me/cv');
    return response.data;
  },
};
