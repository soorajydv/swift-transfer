import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from '@/hooks/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // Don't automatically handle 401 errors since we can't refresh HTTP-only cookies
    // Authentication should be handled explicitly through login/logout actions

    // Handle other errors - show them in toasts
    let errorMessage = 'An unexpected error occurred';
    let errorTitle = 'Error';

    if (error.response?.data) {
      const apiError = error.response.data as any;
      errorMessage = apiError.message || apiError.error || errorMessage;

      // Customize error titles based on status code
      switch (error.response.status) {
        case 400:
          errorTitle = 'Bad Request';
          break;
        case 401:
          // Clear auth state on 401 and redirect to login
          // This will happen when access token expires
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        case 403:
          errorTitle = 'Access Denied';
          break;
        case 404:
          errorTitle = 'Not Found';
          break;
        case 422:
          errorTitle = 'Validation Error';
          break;
        case 500:
          errorTitle = 'Server Error';
          break;
        default:
          errorTitle = 'Request Failed';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Show error toast for non-401 errors
    if (error.response?.status !== 401) {
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    }

    return Promise.reject(error);
  }
);

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
  error?: string;
}

// Utility functions
export const apiUtils = {
  // Handle API responses
  handleResponse: <T>(response: AxiosResponse<ApiResponse<T>>): T => {
    if (response.data.success) {
      return response.data.data as T;
    } else {
      throw new Error(response.data.message || 'API request failed');
    }
  },

  // Handle API errors
  handleError: (error: AxiosError): never => {
    if (error.response?.data) {
      const apiError = error.response.data as ApiResponse;
      throw new Error(apiError.message || apiError.error || 'An error occurred');
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Network error occurred');
    }
  },

  // Create form data for file uploads
  createFormData: (data: Record<string, any>): FormData => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, item);
          });
        } else if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    return formData;
  },

  // Check if user is authenticated (by making a test request)
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const response = await api.get('/api/auth/profile');
      return response.data.success;
    } catch {
      return false;
    }
  }
};

export default api;
