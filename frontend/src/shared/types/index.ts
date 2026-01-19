// User types
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Sender types
export interface Sender {
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
  createdBy?: string;
  updatedBy?: string;
}

// Receiver types
export interface Receiver {
  id: string;
  senderId: string;
  fullName: string;
  email?: string;
  phone: string;
  bankName: string;
  bankBranch: string;
  accountNumber: string;
  address: string;
  city: string;
  country: string;
  relationship: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Transaction types
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface Transaction {
  id: string;
  transactionId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  amountJPY: number;
  amountNPR: number;
  serviceFee: number;
  exchangeRate: number;
  totalAmountJPY: number;
  status: TransactionStatus;
  purpose: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledReason?: string;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'operator' | 'viewer';
}

export interface OTPRequest {
  email: string;
}

export interface OTPVerify {
  email: string;
  otp: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Filter types
export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  senderId?: string;
  receiverId?: string;
  status?: TransactionStatus;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

// Stats types
export interface DashboardStats {
  totalTransactions: number;
  totalVolumeJPY: number;
  totalVolumeNPR: number;
  totalServiceFees: number;
  pendingTransactions: number;
  completedToday: number;
  activeUsers: number;
  activeSenders: number;
}

// Form types
export interface SendMoneyForm {
  senderId: string;
  receiverId: string;
  amountJPY: number;
  purpose: string;
  notes?: string;
}
