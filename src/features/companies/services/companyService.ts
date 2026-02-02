import api from '@/services/api';
import { Company } from '@/types';

// Convert snake_case response to camelCase
const toCamelCase = (data: any): Company => ({
  id: data.id,
  ownerId: data.owner_id,
  name: data.name,
  description: data.description,
  logo: data.logo,
  website: data.website,
  location: data.location,
  industry: data.industry,
  size: data.size,
  isVerified: data.is_verified,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

// Convert camelCase to snake_case for backend
const toSnakeCase = (data: any, includeOwnerId: boolean = true) => {
  const result: any = {
    name: data.name,
    description: data.description,
    logo: data.logo,
    website: data.website,
    location: data.location,
    industry: data.industry,
    size: data.size,
  };
  
  // Only include owner_id if explicitly requested (for create)
  if (includeOwnerId && data.ownerId !== undefined) {
    result.owner_id = data.ownerId;
  }
  
  return result;
};

export const companyService = {
  /**
   * Get current user's companies (where user is owner or member)
   */
  getMyCompanies: async (): Promise<Company[]> => {
    const response = await api.get('/v1/companies/my-companies');
    return response.data.map(toCamelCase);
  },

  /**
   * Create new company
   */
  createCompany: async (data: any): Promise<Company> => {
    const response = await api.post('/v1/companies', toSnakeCase(data));
    return toCamelCase(response.data);
  },

  /**
   * Get company by ID
   */
  getCompany: async (companyId: number): Promise<Company> => {
    const response = await api.get(`/v1/companies/${companyId}`);
    return toCamelCase(response.data);
  },

  /**
   * Update company
   */
  updateCompany: async (companyId: number, data: any): Promise<Company> => {
    const response = await api.put(`/v1/companies/${companyId}`, toSnakeCase(data, false));
    return toCamelCase(response.data);
  },

  /**
   * Delete company
   */
  deleteCompany: async (companyId: number): Promise<void> => {
    await api.delete(`/v1/companies/${companyId}`);
  },

  /**
   * Add member to company
   */
  addMember: async (companyId: number, userId: number, role: string = 'member'): Promise<void> => {
    await api.post(`/v1/companies/${companyId}/members`, {
      user_id: userId,
      role: role,
    });
  },

  /**
   * Get company members
   */
  getCompanyMembers: async (companyId: number): Promise<any[]> => {
    const response = await api.get(`/v1/companies/${companyId}/members`);
    return response.data;
  },

  /**
   * Remove member from company
   */
  removeMember: async (companyId: number, userId: number): Promise<void> => {
    await api.delete(`/v1/companies/${companyId}/members/${userId}`);
  },
};
