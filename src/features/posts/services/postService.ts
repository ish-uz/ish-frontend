import api from '@/services/api';
import { Post, PostCreate, PostStatus } from '@/types';

const toSnakeCase = (data: PostCreate) => ({
  title: data.title,
  content: data.content,
  company_id: data.companyId,
  status: data.status,
});

const toCamelCase = (data: any): Post => {
  const company = data.company
    ? {
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
      }
    : undefined;

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
    companyId: data.company_id,
    title: data.title,
    content: data.content,
    image: data.image || undefined,
    status: data.status,
    likesCount: data.likes_count ?? 0,
    liked: data.liked,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    company,
    author,
  };
};

export const postService = {
  getPosts: async (
    skip = 0,
    limit = 20,
    search?: string,
    status?: string
  ): Promise<{ posts: Post[]; total: number }> => {
    const params: Record<string, unknown> = { skip, limit };
    if (search?.trim()) params.search = search.trim();
    if (status) params.status = status;

    const response = await api.get('/v1/posts', { params });
    if (Array.isArray(response.data)) {
      return { posts: response.data.map(toCamelCase), total: response.data.length };
    }
    return {
      posts: response.data.items.map(toCamelCase),
      total: response.data.total,
    };
  },

  getPost: async (id: string | number): Promise<Post> => {
    const response = await api.get(`/v1/posts/${id}`);
    return toCamelCase(response.data);
  },

  getMyPosts: async (
    skip = 0,
    limit = 20,
    status?: string
  ): Promise<{ posts: Post[]; total: number }> => {
    const response = await api.get('/v1/posts/my-posts', {
      params: { skip, limit, status },
    });
    if (Array.isArray(response.data)) {
      return { posts: response.data.map(toCamelCase), total: response.data.length };
    }
    return {
      posts: response.data.items.map(toCamelCase),
      total: response.data.total,
    };
  },

  createPost: async (data: PostCreate): Promise<Post> => {
    const response = await api.post('/v1/posts', toSnakeCase(data));
    return toCamelCase(response.data);
  },

  updatePost: async (
    id: number,
    data: Partial<PostCreate & { status: PostStatus; image?: string | null; companyId?: number | null }>
  ): Promise<Post> => {
    const snakeData: Record<string, unknown> = {};
    if (data.title !== undefined) snakeData.title = data.title;
    if (data.content !== undefined) snakeData.content = data.content;
    if (data.companyId !== undefined) snakeData.company_id = data.companyId;
    if (data.status !== undefined) snakeData.status = data.status;
    if (data.image !== undefined) snakeData.image = data.image;

    const response = await api.put(`/v1/posts/${id}`, snakeData);
    return toCamelCase(response.data);
  },

  deletePost: async (id: number): Promise<void> => {
    await api.delete(`/v1/posts/${id}`);
  },

  uploadPostImage: async (id: number, file: File): Promise<Post> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/v1/posts/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return toCamelCase(response.data);
  },

  deletePostImage: async (id: number): Promise<Post> => {
    const response = await api.delete(`/v1/posts/${id}/image`);
    return toCamelCase(response.data);
  },

  likePost: async (id: number): Promise<void> => {
    await api.post(`/v1/posts/${id}/like`);
  },

  unlikePost: async (id: number): Promise<void> => {
    await api.delete(`/v1/posts/${id}/like`);
  },

  checkPostLiked: async (id: number): Promise<boolean> => {
    try {
      const response = await api.get(`/v1/posts/${id}/liked`);
      return response.data.liked || false;
    } catch {
      return false;
    }
  },
};
