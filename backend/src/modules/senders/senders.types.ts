import { Request } from 'express';

export interface ISenderAttributes {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  identityType: 'passport' | 'residence_card' | 'drivers_license';
  identityNumber: string;
  status: 'active' | 'inactive' | 'pending_verification';
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface ICreateSenderData {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  identityType: 'passport' | 'residence_card' | 'drivers_license';
  identityNumber: string;
  status?: 'active' | 'inactive' | 'pending_verification';
}

export interface IUpdateSenderData {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  identityType?: 'passport' | 'residence_card' | 'drivers_license';
  identityNumber?: string;
  status?: 'active' | 'inactive' | 'pending_verification';
}

export interface ISenderData {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  identityType: 'passport' | 'residence_card' | 'drivers_license';
  identityNumber: string;
  status: 'active' | 'inactive' | 'pending_verification';
  createdAt: string;
  updatedAt: string;
  createdBy?: string | undefined;
  updatedBy?: string | undefined;
}

export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
  statusCode?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: any;
  userId?: string;
}
