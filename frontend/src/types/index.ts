// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Media Types
export interface Media {
  id: string;
  title: string;
  description?: string;
  category: MediaCategory;
  url: string;
  thumbnail_url?: string;
  file_type: 'image' | 'video';
  file_size: number;
  width?: number;
  height?: number;
  views: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export type MediaCategory =
  | 'athletes'
  | 'food'
  | 'nature'
  | 'portraits'
  | 'action';

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  created_at: string;
  updated_at: string;
}

// Auth Types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Contact Types
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Booking Types
export interface BookingService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
}

export interface Booking {
  id: string;
  service_id: string;
  service: BookingService;
  client_name: string;
  client_email: string;
  client_phone: string;
  preferred_date: string;
  preferred_time: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  stripe_session_id?: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface BookingFormData {
  service_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  preferred_date: string;
  preferred_time: string;
  notes?: string;
}

// Gallery Types
export interface GalleryData {
  category: MediaCategory;
  media: Media[];
  total: number;
  page: number;
  limit: number;
}

// Upload Types
export interface UploadProgress {
  progress: number;
  file: File;
  status: 'uploading' | 'complete' | 'error';
}
