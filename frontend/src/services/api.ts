import axios, { AxiosResponse } from 'axios';
import {
  ApiResponse,
  Media,
  MediaCategory,
  AuthResponse,
  LoginCredentials,
  User,
  ContactFormData,
  ContactMessage,
  BookingFormData,
  Booking,
  BookingService,
  StripeCheckoutResponse,
  GalleryData,
} from '../types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post(
      '/auth/login',
      credentials
    );
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async (): Promise<User> => {
    const response: AxiosResponse<ApiResponse<User>> =
      await api.get('/auth/me');
    return response.data.data;
  },
};

// Media API
export const mediaAPI = {
  getMediaByCategory: async (
    category: MediaCategory,
    page = 1,
    limit = 20
  ): Promise<GalleryData> => {
    const response: AxiosResponse<ApiResponse<GalleryData>> = await api.get(
      `/media/${category}`,
      {
        params: { page, limit },
      }
    );
    return response.data.data;
  },

  getMediaById: async (id: string): Promise<Media> => {
    const response: AxiosResponse<ApiResponse<Media>> = await api.get(
      `/media/item/${id}`
    );
    return response.data.data;
  },

  getAllMedia: async (page = 1, limit = 20): Promise<GalleryData> => {
    const response: AxiosResponse<ApiResponse<GalleryData>> = await api.get(
      '/media/admin/all',
      {
        params: { page, limit },
      }
    );
    return response.data.data;
  },

  uploadMedia: async (
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<Media> => {
    const response: AxiosResponse<ApiResponse<Media>> = await api.post(
      '/media/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      }
    );
    return response.data.data;
  },

  updateMedia: async (id: string, data: Partial<Media>): Promise<Media> => {
    const response: AxiosResponse<ApiResponse<Media>> = await api.put(
      `/media/${id}`,
      data
    );
    return response.data.data;
  },

  deleteMedia: async (id: string): Promise<void> => {
    await api.delete(`/media/${id}`);
  },

  bulkDeleteMedia: async (
    ids: string[]
  ): Promise<{ deleted_count: number }> => {
    const response: AxiosResponse<ApiResponse<{ deleted_count: number }>> =
      await api.delete('/media/bulk', { data: { ids } });
    return response.data.data;
  },
};

// Contact API
export const contactAPI = {
  submitContact: async (data: ContactFormData): Promise<void> => {
    await api.post('/contact', data);
  },

  getMessages: async (): Promise<ContactMessage[]> => {
    const response: AxiosResponse<ApiResponse<ContactMessage[]>> =
      await api.get('/contact/messages');
    return response.data.data;
  },

  markMessageAsRead: async (id: string): Promise<ContactMessage> => {
    const response: AxiosResponse<ApiResponse<ContactMessage>> = await api.put(
      `/contact/messages/${id}/read`
    );
    return response.data.data;
  },

  markMessageAsUnread: async (id: string): Promise<ContactMessage> => {
    const response: AxiosResponse<ApiResponse<ContactMessage>> = await api.put(
      `/contact/messages/${id}/unread`
    );
    return response.data.data;
  },

  deleteMessage: async (id: string): Promise<void> => {
    await api.delete(`/contact/messages/${id}`);
  },
};

// Booking API
export const bookingAPI = {
  getServices: (): BookingService[] => {
    return [
      {
        type: 'portrait',
        name: 'Portrait Photography',
        description:
          'Professional portrait photography for individuals and families',
        basePrice: 150,
        pricePerHour: 150,
      },
      {
        type: 'wedding',
        name: 'Wedding Photography',
        description: 'Complete wedding photography coverage',
        basePrice: 300,
        pricePerHour: 300,
      },
      {
        type: 'event',
        name: 'Event Photography',
        description: 'Professional event and celebration photography',
        basePrice: 200,
        pricePerHour: 200,
      },
      {
        type: 'commercial',
        name: 'Commercial Photography',
        description: 'Business and commercial photography services',
        basePrice: 250,
        pricePerHour: 250,
      },
      {
        type: 'sports',
        name: 'Sports Photography',
        description: 'Dynamic sports and action photography',
        basePrice: 180,
        pricePerHour: 180,
      },
      {
        type: 'nature',
        name: 'Nature Photography',
        description: 'Outdoor and nature photography sessions',
        basePrice: 120,
        pricePerHour: 120,
      },
    ];
  },

  createStripeSession: async (
    bookingData: BookingFormData
  ): Promise<StripeCheckoutResponse> => {
    const response: AxiosResponse<ApiResponse<StripeCheckoutResponse>> =
      await api.post('/stripe/checkout', bookingData);
    return response.data.data;
  },

  getBookingSuccess: async (sessionId: string): Promise<Booking> => {
    const response: AxiosResponse<ApiResponse<{ booking: Booking }>> =
      await api.get(`/stripe/success?session_id=${sessionId}`);
    return response.data.data.booking;
  },
};

// Admin API
export const adminAPI = {
  getDashboard: async (): Promise<{
    totalMedia: number;
    totalMessages: number;
    unreadMessages: number;
    recentMessages: ContactMessage[];
  }> => {
    const response: AxiosResponse<
      ApiResponse<{
        totalMedia: number;
        totalMessages: number;
        unreadMessages: number;
        recentMessages: ContactMessage[];
      }>
    > = await api.get('/admin/dashboard');
    return response.data.data;
  },

  getAnalytics: async (): Promise<{
    mediaByCategory: Record<string, number>;
    messagesThisMonth: number;
    popularCategories: Array<{ category: string; views: number }>;
  }> => {
    const response: AxiosResponse<
      ApiResponse<{
        mediaByCategory: Record<string, number>;
        messagesThisMonth: number;
        popularCategories: Array<{ category: string; views: number }>;
      }>
    > = await api.get('/admin/analytics');
    return response.data.data;
  },

  getContactMessages: async (
    page = 1,
    limit = 10,
    status?: 'read' | 'unread'
  ): Promise<{
    messages: ContactMessage[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> => {
    const response: AxiosResponse<
      ApiResponse<{
        messages: ContactMessage[];
        total: number;
        page: number;
        limit: number;
        pages: number;
      }>
    > = await api.get('/contact/messages', {
      params: { page, limit, status },
    });
    return response.data.data;
  },
};

// Health check
export const healthAPI = {
  check: async (): Promise<{ status: string }> => {
    const response: AxiosResponse<{ status: string }> =
      await api.get('/health');
    return response.data;
  },
};

export default api;
