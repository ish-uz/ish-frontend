import api from '@/services/api';
import { Job, JobCreate, JobStatus } from '@/types';

// Convert camelCase to snake_case for backend
const toSnakeCase = (data: JobCreate) => ({
  title: data.title,
  description: data.description,
  location: data.location,
  salary_min: data.salaryMin,
  salary_max: data.salaryMax,
  salary_currency: data.salaryCurrency || 'UZS',
  job_type: data.jobType,
  requirements: data.requirements,
  is_remote: data.isRemote || false,
  company_id: data.companyId,
});

// Convert snake_case response to camelCase
const toCamelCase = (data: any): Job => ({
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
});

export const jobService = {
  /**
   * Get all jobs
   */
  getJobs: async (
    skip = 0,
    limit = 100,
    status?: string,
    skills?: string[],
    search?: string,
    jobType?: string,
    location?: string,
    salaryMin?: number,
    salaryMax?: number,
    isRemote?: boolean,
    dateFrom?: string
  ): Promise<Job[]> => {
    const params: any = { skip, limit };
    if (status) params.status = status;
    if (skills && skills.length > 0) {
      params.skills = skills.join(',');
    }
    if (search && search.trim()) {
      params.search = search.trim();
    }
    if (jobType) params.job_type = jobType;
    if (location && location.trim()) {
      params.location = location.trim();
    }
    if (salaryMin !== undefined && salaryMin !== null) {
      params.salary_min = salaryMin;
    }
    if (salaryMax !== undefined && salaryMax !== null) {
      params.salary_max = salaryMax;
    }
    if (isRemote !== undefined && isRemote !== null) {
      params.is_remote = isRemote;
    }
    if (dateFrom) {
      params.date_from = dateFrom;
    }
    const response = await api.get('/v1/jobs', { params });
    return response.data.map(toCamelCase);
  },

  /**
   * Get job by ID
   */
  getJob: async (id: string): Promise<Job> => {
    const response = await api.get(`/v1/jobs/${id}`);
    return toCamelCase(response.data);
  },

  /**
   * Get my jobs (jobs I posted)
   */
  getMyJobs: async (skip = 0, limit = 100, status?: string): Promise<Job[]> => {
    const response = await api.get('/v1/jobs/my-jobs', {
      params: { skip, limit, status },
    });
    return response.data.map(toCamelCase);
  },

  /**
   * Create job
   */
  createJob: async (data: JobCreate): Promise<Job> => {
    const response = await api.post('/v1/jobs', toSnakeCase(data));
    return toCamelCase(response.data);
  },

  /**
   * Update job
   */
  updateJob: async (id: number, data: Partial<JobCreate & { status: JobStatus }>): Promise<Job> => {
    const snakeData: any = {};
    if (data.title !== undefined) snakeData.title = data.title;
    if (data.description !== undefined) snakeData.description = data.description;
    if (data.location !== undefined) snakeData.location = data.location;
    if (data.salaryMin !== undefined) snakeData.salary_min = data.salaryMin;
    if (data.salaryMax !== undefined) snakeData.salary_max = data.salaryMax;
    if (data.salaryCurrency !== undefined) snakeData.salary_currency = data.salaryCurrency;
    if (data.jobType !== undefined) snakeData.job_type = data.jobType;
    if (data.requirements !== undefined) snakeData.requirements = data.requirements;
    if (data.isRemote !== undefined) snakeData.is_remote = data.isRemote;
    if (data.status !== undefined) snakeData.status = data.status;
    
    const response = await api.put(`/v1/jobs/${id}`, snakeData);
    return toCamelCase(response.data);
  },

  /**
   * Delete job
   */
  deleteJob: async (id: number): Promise<void> => {
    await api.delete(`/v1/jobs/${id}`);
  },

  /**
   * Increment job views
   */
  incrementViews: async (id: number): Promise<void> => {
    await api.post(`/v1/jobs/${id}/view`);
  },

  /**
   * Save a job
   */
  saveJob: async (id: number): Promise<void> => {
    await api.post(`/v1/jobs/${id}/save`);
  },

  /**
   * Unsave a job
   */
  unsaveJob: async (id: number): Promise<void> => {
    await api.delete(`/v1/jobs/${id}/save`);
  },

  /**
   * Get saved jobs
   */
  getSavedJobs: async (skip = 0, limit = 100): Promise<Job[]> => {
    const response = await api.get('/v1/jobs/saved', {
      params: { skip, limit },
    });
    return response.data.map(toCamelCase);
  },

  /**
   * Check if job is saved
   */
  checkJobSaved: async (id: number): Promise<boolean> => {
    try {
      const response = await api.get(`/v1/jobs/${id}/saved`);
      return response.data.saved || false;
    } catch {
      return false;
    }
  },
};
