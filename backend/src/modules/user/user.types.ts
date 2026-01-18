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

export interface ServiceResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  userId?: string;
}
