import api from '@/services/api';
import { Application, ApplicationCreate } from '@/types';

// Convert camelCase to snake_case for backend
const toSnakeCase = (data: ApplicationCreate) => ({
  job_id: data.jobId,
  cover_letter: data.coverLetter,
});

// Convert snake_case user to camelCase
const userToCamelCase = (data: any) => data ? {
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
} : null;

// Convert snake_case job to camelCase
const jobToCamelCase = (data: any) => data ? {
  id: data.id,
  authorId: data.author_id,
  companyId: data.company_id,
  title: data.title,
  description: data.description,
  location: data.location,
  salaryMin: data.salary_min,
  salaryMax: data.salary_max,
  salaryCurrency: data.salary_currency,
  jobType: data.job_type,
  status: data.status,
  requirements: data.requirements,
  isRemote: data.is_remote,
  viewsCount: data.views_count,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  company: data.company,
  author: data.author,
} : null;

// Convert snake_case response to camelCase
const toCamelCase = (data: any): Application => ({
  id: data.id,
  jobId: data.job_id,
  applicantId: data.applicant_id,
  coverLetter: data.cover_letter,
  status: data.status,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  job: jobToCamelCase(data.job) || undefined,
  applicant: userToCamelCase(data.applicant) || undefined,
  conversationId: data.conversation_id,
});

export const applicationService = {
  /**
   * Get my applications
   */
  getMyApplications: async (): Promise<Application[]> => {
    const response = await api.get('/v1/applications/my-applications');
    return response.data.map(toCamelCase);
  },

  /**
   * Get applications for a job (only job author can see)
   */
  getJobApplications: async (jobId: number): Promise<Application[]> => {
    const response = await api.get(`/v1/applications/job/${jobId}`);
    return response.data.map(toCamelCase);
  },

  /**
   * Get application by ID
   */
  getApplication: async (id: number): Promise<Application> => {
    const response = await api.get(`/v1/applications/${id}`);
    return toCamelCase(response.data);
  },

  /**
   * Create application (apply to job)
   */
  applyToJob: async (data: ApplicationCreate): Promise<Application> => {
    const response = await api.post('/v1/applications', toSnakeCase(data));
    return toCamelCase(response.data);
  },

  /**
   * Update application
   */
  updateApplication: async (id: number, data: Partial<Application>): Promise<Application> => {
    const snakeData: any = {};
    if (data.coverLetter !== undefined) snakeData.cover_letter = data.coverLetter;
    if (data.status !== undefined) snakeData.status = data.status;
    
    const response = await api.put(`/v1/applications/${id}`, snakeData);
    return toCamelCase(response.data);
  },

  /**
   * Withdraw application
   */
  withdrawApplication: async (id: number): Promise<void> => {
    await api.delete(`/v1/applications/${id}`);
  },
};
