// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Media Types
export interface Media {
  id: number;
  title: string;
  description?: string;
  category: MediaCategory;
  s3_url: string;
  thumbnail_url?: string;
  type: 'image' | 'video';
  file_size: number;
  file_name: string;
  mime_type: string;
  width?: number;
  height?: number;
  view_count: number;
  is_featured: boolean;
  is_public: boolean;
  sort_order: number;
  uploaded_at: string;
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
  phone?: string;
  subject: string;
  message: string;
}

// Booking Types
export type ServiceType =
  | 'portrait'
  | 'wedding'
  | 'event'
  | 'commercial'
  | 'sports'
  | 'nature';
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export interface BookingService {
  type: ServiceType;
  name: string;
  description: string;
  basePrice: number;
  pricePerHour: number;
}

export interface Booking {
  id: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  service_type: ServiceType;
  description?: string;
  location?: string;
  scheduled_date: string;
  duration: number; // in hours
  price: number;
  status: BookingStatus;
  notes?: string;
  stripe_session_id?: string;
  payment_status: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingFormData {
  client_name: string;
  client_email: string;
  client_phone: string;
  service_type: ServiceType;
  description?: string | undefined;
  location: string;
  scheduled_date: string;
  duration: number;
  notes?: string | undefined;
}

export interface StripeCheckoutResponse {
  checkout_url: string;
  session_id: string;
  booking_id: number;
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
