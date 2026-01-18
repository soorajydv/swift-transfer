import { Request } from 'express';

export interface IUser {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'operator' | 'viewer';
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface ICreateUserData {
  email: string;
  fullName: string;
  role: 'admin' | 'operator' | 'viewer';
  status?: 'active' | 'inactive';
}

export interface IUpdateUserData {
  email?: string;
  fullName?: string;
  role?: 'admin' | 'operator' | 'viewer';
  status?: 'active' | 'inactive';
}

// OTP interfaces
export interface IOTPData {
  email: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
}

export interface IOTPRequest {
  email: string;
}

export interface IOTPVerify {
  email: string;
  otp: string;
}

// Auth interfaces
export interface ILoginResponse {
  user: IUser;
  token: string;
  refreshToken: string;
}

export interface IRefreshTokenResponse {
  token: string;
  refreshToken: string;
}

// API Response types
export interface AuthResponse {
  user: IUser;
  token: string;
  refreshToken: string;
}

export interface OTPResponse {
  expiresIn: number;
}

// Service result types
export interface ServiceResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
}

// Extended Express types
export interface AuthenticatedRequest extends Request {
  user?: IUser;
  userId?: string;
}
