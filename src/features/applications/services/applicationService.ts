import api from '@/services/api';
import { Application, ApplicationCreate } from '@/types';

export const applicationService = {
  /**
   * Get my applications
   */
  getMyApplications: async (): Promise<Application[]> => {
    const response = await api.get('/v1/applications/my-applications');
    return response.data;
  },

  /**
   * Get applications for a job (only job author can see)
   */
  getJobApplications: async (jobId: number): Promise<Application[]> => {
    const response = await api.get(`/v1/applications/job/${jobId}`);
    return response.data;
  },

  /**
   * Get application by ID
   */
  getApplication: async (id: number): Promise<Application> => {
    const response = await api.get(`/v1/applications/${id}`);
    return response.data;
  },

  /**
   * Create application (apply to job)
   */
  applyToJob: async (data: ApplicationCreate): Promise<Application> => {
    const response = await api.post('/v1/applications', data);
    return response.data;
  },

  /**
   * Update application
   */
  updateApplication: async (id: number, data: Partial<Application>): Promise<Application> => {
    const response = await api.put(`/v1/applications/${id}`, data);
    return response.data;
  },

  /**
   * Withdraw application
   */
  withdrawApplication: async (id: number): Promise<void> => {
    await api.delete(`/v1/applications/${id}`);
  },
};
