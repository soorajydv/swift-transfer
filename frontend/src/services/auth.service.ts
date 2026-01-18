import api, { ApiResponse } from './api';
import { AuthUser } from '@/types';

export interface LoginResponse {
  user: AuthUser;
}

export interface OtpResponse {
  expiresIn: number;
}

export class AuthService {
  /**
   * Request OTP for email
   */
  static async requestOtp(email: string): Promise<ApiResponse<OtpResponse>> {
    const response = await api.post('/api/auth/otp/request', { email });
    return response.data;
  }

  /**
   * Verify OTP and login
   */
  static async verifyOtp(email: string, otp: string): Promise<ApiResponse<LoginResponse>> {
    const response = await api.post('/api/auth/otp/verify', { email, otp });
    return response.data;
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<ApiResponse<AuthUser>> {
    const response = await api.get('/api/auth/profile');
    return response.data;
  }

  /**
   * Logout user
   */
  static async logout(): Promise<ApiResponse<null>> {
    const response = await api.post('/api/auth/logout');
    return response.data;
  }
}

export default AuthService;
