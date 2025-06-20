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
  GalleryData,
} from '@/types';

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

  markMessageAsRead: async (id: string): Promise<void> => {
    await api.put(`/contact/messages/${id}/read`);
  },

  deleteMessage: async (id: string): Promise<void> => {
    await api.delete(`/contact/messages/${id}`);
  },
};

// Booking API
export const bookingAPI = {
  getServices: async (): Promise<BookingService[]> => {
    const response: AxiosResponse<ApiResponse<BookingService[]>> =
      await api.get('/booking/services');
    return response.data.data;
  },

  createBooking: async (data: BookingFormData): Promise<Booking> => {
    const response: AxiosResponse<ApiResponse<Booking>> = await api.post(
      '/booking',
      data
    );
    return response.data.data;
  },

  createStripeSession: async (
    serviceId: string,
    bookingData: BookingFormData
  ): Promise<{ url: string }> => {
    const response: AxiosResponse<ApiResponse<{ url: string }>> =
      await api.post('/stripe/checkout', {
        ...bookingData,
        service_id: serviceId,
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
