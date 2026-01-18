import { Request } from 'express';

export interface IReceiverAttributes {
  id: string;
  senderId: string;
  fullName: string;
  email: string | null;
  phone: string;
  address: string;
  city: string;
  country: string;
  relationship: 'family' | 'friend' | 'business' | 'other';
  bankName: string;
  bankBranch: string;
  accountNumber: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface ICreateReceiverData {
  senderId: string;
  fullName: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  relationship: 'family' | 'friend' | 'business' | 'other';
  bankName: string;
  bankBranch: string;
  accountNumber: string;
  status?: 'active' | 'inactive';
}

export interface IUpdateReceiverData {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  relationship?: 'family' | 'friend' | 'business' | 'other';
  bankName?: string;
  bankBranch?: string;
  accountNumber?: string;
  status?: 'active' | 'inactive';
}

export interface IReceiverData {
  id: string;
  senderId: string;
  fullName: string;
  email?: string | undefined;
  phone: string;
  address: string;
  city: string;
  country: string;
  relationship: 'family' | 'friend' | 'business' | 'other';
  bankName: string;
  bankBranch: string;
  accountNumber: string;
  status: 'active' | 'inactive';
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
