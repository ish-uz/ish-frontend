import api from '@/services/api';
import { ServiceCreate, ServiceListing, ServiceStatus } from '@/types';

const toSnakeCase = (data: ServiceCreate) => ({
  title: data.title,
  description: data.description,
  location: data.location,
  category: data.category,
  price_min: data.priceMin,
  price_max: data.priceMax,
  price_currency: data.priceCurrency || 'UZS',
  price_type: data.priceType || 'negotiable',
  status: data.status,
});

const toCamelCase = (data: any): ServiceListing => {
  const author = data.author
    ? {
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
      }
    : undefined;

  return {
    id: data.id,
    authorId: data.author_id,
    title: data.title,
    description: data.description,
    location: data.location,
    category: data.category,
    priceMin: data.price_min,
    priceMax: data.price_max,
    priceCurrency: data.price_currency,
    priceType: data.price_type,
    status: data.status,
    image: data.image || undefined,
    viewsCount: data.views_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    author,
  };
};

export const serviceService = {
  getServices: async (
    skip = 0,
    limit = 20,
    filters?: {
      status?: string;
      search?: string;
      category?: string;
      location?: string;
      priceMin?: number;
      priceMax?: number;
    }
  ): Promise<{ services: ServiceListing[]; total: number }> => {
    const params: any = { skip, limit };
    if (filters?.status) params.status = filters.status;
    if (filters?.search?.trim()) params.search = filters.search.trim();
    if (filters?.category) params.category = filters.category;
    if (filters?.location?.trim()) params.location = filters.location.trim();
    if (filters?.priceMin !== undefined) params.price_min = filters.priceMin;
    if (filters?.priceMax !== undefined) params.price_max = filters.priceMax;

    const response = await api.get('/v1/services', { params });
    if (Array.isArray(response.data)) {
      return { services: response.data.map(toCamelCase), total: response.data.length };
    }
    return {
      services: response.data.items.map(toCamelCase),
      total: response.data.total,
    };
  },

  getService: async (id: string): Promise<ServiceListing> => {
    const response = await api.get(`/v1/services/${id}`);
    return toCamelCase(response.data);
  },

  getMyServices: async (
    skip = 0,
    limit = 20,
    status?: string
  ): Promise<{ services: ServiceListing[]; total: number }> => {
    const response = await api.get('/v1/services/my-services', {
      params: { skip, limit, status },
    });
    if (Array.isArray(response.data)) {
      return { services: response.data.map(toCamelCase), total: response.data.length };
    }
    return {
      services: response.data.items.map(toCamelCase),
      total: response.data.total,
    };
  },

  createService: async (data: ServiceCreate): Promise<ServiceListing> => {
    const response = await api.post('/v1/services', toSnakeCase(data));
    return toCamelCase(response.data);
  },

  uploadServiceImage: async (id: number, file: File): Promise<ServiceListing> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/v1/services/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return toCamelCase(response.data);
  },

  deleteServiceImage: async (id: number): Promise<ServiceListing> => {
    const response = await api.delete(`/v1/services/${id}/image`);
    return toCamelCase(response.data);
  },

  updateService: async (
    id: number,
    data: Partial<ServiceCreate & { status: ServiceStatus; image?: string | null }>
  ): Promise<ServiceListing> => {
    const snakeData: any = {};
    if (data.title !== undefined) snakeData.title = data.title;
    if (data.description !== undefined) snakeData.description = data.description;
    if (data.location !== undefined) snakeData.location = data.location;
    if (data.category !== undefined) snakeData.category = data.category;
    if (data.priceMin !== undefined) snakeData.price_min = data.priceMin;
    if (data.priceMax !== undefined) snakeData.price_max = data.priceMax;
    if (data.priceCurrency !== undefined) snakeData.price_currency = data.priceCurrency;
    if (data.priceType !== undefined) snakeData.price_type = data.priceType;
    if (data.status !== undefined) snakeData.status = data.status;
    if (data.image !== undefined) snakeData.image = data.image;

    const response = await api.put(`/v1/services/${id}`, snakeData);
    return toCamelCase(response.data);
  },

  deleteService: async (id: number): Promise<void> => {
    await api.delete(`/v1/services/${id}`);
  },

  incrementViews: async (id: number): Promise<void> => {
    await api.post(`/v1/services/${id}/view`);
  },
};
