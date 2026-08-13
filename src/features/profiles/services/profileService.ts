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

  /**
   * Download CV for a user (authenticated). Opens in a new tab via blob URL.
   */
  downloadCV: async (userId?: number): Promise<void> => {
    const path = userId != null ? `/v1/profiles/user/${userId}/cv` : '/v1/profiles/me/cv';
    const response = await api.get(path, { responseType: 'blob' });
    const contentType = response.headers['content-type'] || 'application/pdf';
    const blob = new Blob([response.data], { type: contentType });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    // Revoke after the browser has a chance to load it
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  },

  /**
   * Get dashboard stats (profile views, jobs applied, connections, notifications)
   */
  getDashboardStats: async (): Promise<{
    profileViews: number;
    jobsApplied: number;
    connections: number;
    notifications: number;
  }> => {
    const response = await api.get('/v1/profiles/me/dashboard-stats');
    const d = response.data as Record<string, number>;
    return {
      profileViews: Number(d.profileViews ?? d.profile_views ?? 0),
      jobsApplied: Number(d.jobsApplied ?? d.jobs_applied ?? 0),
      connections: Number(d.connections ?? 0),
      notifications: Number(d.notifications ?? 0),
    };
  },
};
