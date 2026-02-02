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
const toCamelCase = (data: any): Job => {
  // Convert company if present
  const company = data.company ? {
    id: data.company.id,
    ownerId: data.company.owner_id,
    name: data.company.name,
    description: data.company.description,
    logo: data.company.logo,
    website: data.company.website,
    location: data.company.location,
    industry: data.company.industry,
    size: data.company.size,
    isVerified: data.company.is_verified,
    createdAt: data.company.created_at,
    updatedAt: data.company.updated_at,
  } : undefined;

  // Convert author if present
  const author = data.author ? {
    id: data.author.id,
    email: data.author.email,
    phone: data.author.phone,
    firstName: data.author.first_name,
    lastName: data.author.last_name,
    avatar: data.author.avatar,
    role: data.author.role,
    isActive: data.author.is_active,
    isVerified: data.author.is_verified,
    createdAt: data.author.created_at,
    updatedAt: data.author.updated_at,
  } : undefined;

  return {
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
    company,
    author,
  };
};

export const jobService = {
  /**
   * Get all jobs
   */
  getJobs: async (
    skip = 0,
    limit = 20,
    status?: string,
    skills?: string[],
    search?: string,
    jobType?: string,
    location?: string,
    salaryMin?: number,
    salaryMax?: number,
    isRemote?: boolean,
    dateFrom?: string
  ): Promise<{ jobs: Job[]; total: number }> => {
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
    
    // Handle both old format (array) and new format (PaginatedResponse)
    if (Array.isArray(response.data)) {
      return { jobs: response.data.map(toCamelCase), total: response.data.length };
    }
    
    return {
      jobs: response.data.items.map(toCamelCase),
      total: response.data.total,
    };
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
  getMyJobs: async (skip = 0, limit = 20, status?: string): Promise<{ jobs: Job[]; total: number }> => {
    const response = await api.get('/v1/jobs/my-jobs', {
      params: { skip, limit, status },
    });
    
    // Handle both old format (array) and new format (PaginatedResponse)
    if (Array.isArray(response.data)) {
      return { jobs: response.data.map(toCamelCase), total: response.data.length };
    }
    
    return {
      jobs: response.data.items.map(toCamelCase),
      total: response.data.total,
    };
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
  getSavedJobs: async (skip = 0, limit = 20): Promise<{ jobs: Job[]; total: number }> => {
    const response = await api.get('/v1/jobs/saved', {
      params: { skip, limit },
    });
    
    // Handle both old format (array) and new format (PaginatedResponse)
    if (Array.isArray(response.data)) {
      return { jobs: response.data.map(toCamelCase), total: response.data.length };
    }
    
    return {
      jobs: response.data.items.map(toCamelCase),
      total: response.data.total,
    };
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
