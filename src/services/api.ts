/**
 * API Service Layer
 * 
 * This module provides a mock API layer that simulates backend responses.
 * When the real backend is ready, replace the mock implementations with
 * actual API calls using fetch or axios.
 * 
 * The interface remains the same, ensuring seamless integration.
 */

import { 
  User, 
  Sender, 
  Receiver, 
  Transaction, 
  DashboardStats,
  ApiResponse,
  TransactionFilters,
  SendMoneyForm,
  AuthUser 
} from '@/types';
import { 
  mockUsers, 
  mockSenders, 
  mockReceivers, 
  mockTransactions,
  mockDashboardStats 
} from './mockData';
import { sleep, generateId, generateTransactionId, calculateTransferSummary } from '@/utils/helpers';

// Simulated delay for realistic UX
const API_DELAY = 500;

// In-memory store (simulates database)
let users = [...mockUsers];
let senders = [...mockSenders];
let receivers = [...mockReceivers];
let transactions = [...mockTransactions];

// Rate limiting store (simulates Redis)
const rateLimitStore: Map<string, { count: number; resetAt: number }> = new Map();

/**
 * Check rate limit (simulates Redis rate limiting)
 */
function checkRateLimit(key: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

// ============ AUTH API ============

export const authApi = {
  /**
   * Request OTP for email
   */
  async requestOtp(email: string): Promise<ApiResponse<{ expiresIn: number }>> {
    await sleep(API_DELAY);
    
    // Check rate limit
    if (!checkRateLimit(`otp:${email}`)) {
      return {
        success: false,
        error: 'Too many OTP requests. Please try again later.',
      };
    }
    
    // Simulate OTP generation (in real app, this sends email)
    console.log(`[Mock] OTP for ${email}: 123456`);
    
    return {
      success: true,
      data: { expiresIn: 300 },
      message: 'OTP sent successfully',
    };
  },

  /**
   * Verify OTP
   */
  async verifyOtp(email: string, otp: string): Promise<ApiResponse<{ user: AuthUser; token: string }>> {
    await sleep(API_DELAY);
    
    // Mock OTP verification (accept 123456 for demo)
    if (otp !== '123456') {
      return {
        success: false,
        error: 'Invalid OTP. Please try again.',
      };
    }
    
    // Find or create user
    const user = users.find(u => u.email === email);
    
    const authUser: AuthUser = user ? {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    } : {
      id: generateId('USR'),
      email,
      fullName: email.split('@')[0],
      role: 'viewer',
    };
    
    return {
      success: true,
      data: {
        user: authUser,
        token: `mock-jwt-token-${Date.now()}`,
      },
      message: 'Login successful',
    };
  },

  /**
   * Logout
   */
  async logout(): Promise<ApiResponse<null>> {
    await sleep(200);
    return { success: true, message: 'Logged out successfully' };
  },
};

// ============ USERS API ============

export const usersApi = {
  /**
   * Get all users
   */
  async getAll(): Promise<ApiResponse<User[]>> {
    await sleep(API_DELAY);
    return { success: true, data: users };
  },

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<ApiResponse<User>> {
    await sleep(API_DELAY);
    const user = users.find(u => u.id === id);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    return { success: true, data: user };
  },

  /**
   * Create user
   */
  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<User>> {
    await sleep(API_DELAY);
    
    // Check for duplicate email
    if (users.some(u => u.email === data.email)) {
      return { success: false, error: 'Email already exists' };
    }
    
    const newUser: User = {
      ...data,
      id: generateId('USR'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    return { success: true, data: newUser, message: 'User created successfully' };
  },

  /**
   * Update user
   */
  async update(id: string, data: Partial<User>, updatedBy?: string): Promise<ApiResponse<User>> {
    await sleep(API_DELAY);
    
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      return { success: false, error: 'User not found' };
    }
    
    users[index] = {
      ...users[index],
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy,
    };
    
    return { success: true, data: users[index], message: 'User updated successfully' };
  },

  /**
   * Deactivate user
   */
  async deactivate(id: string, updatedBy?: string): Promise<ApiResponse<User>> {
    return this.update(id, { status: 'inactive' }, updatedBy);
  },
};

// ============ SENDERS API ============

export const sendersApi = {
  async getAll(): Promise<ApiResponse<Sender[]>> {
    await sleep(API_DELAY);
    return { success: true, data: senders };
  },

  async getById(id: string): Promise<ApiResponse<Sender>> {
    await sleep(API_DELAY);
    const sender = senders.find(s => s.id === id);
    if (!sender) {
      return { success: false, error: 'Sender not found' };
    }
    return { success: true, data: sender };
  },

  async create(data: Omit<Sender, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Sender>> {
    await sleep(API_DELAY);
    
    const newSender: Sender = {
      ...data,
      id: generateId('SND'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    senders.push(newSender);
    return { success: true, data: newSender, message: 'Sender created successfully' };
  },

  async update(id: string, data: Partial<Sender>, updatedBy?: string): Promise<ApiResponse<Sender>> {
    await sleep(API_DELAY);
    
    const index = senders.findIndex(s => s.id === id);
    if (index === -1) {
      return { success: false, error: 'Sender not found' };
    }
    
    senders[index] = {
      ...senders[index],
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy,
    };
    
    return { success: true, data: senders[index], message: 'Sender updated successfully' };
  },

  async deactivate(id: string, updatedBy?: string): Promise<ApiResponse<Sender>> {
    return this.update(id, { status: 'inactive' }, updatedBy);
  },
};

// ============ RECEIVERS API ============

export const receiversApi = {
  async getAll(): Promise<ApiResponse<Receiver[]>> {
    await sleep(API_DELAY);
    return { success: true, data: receivers };
  },

  async getBySenderId(senderId: string): Promise<ApiResponse<Receiver[]>> {
    await sleep(API_DELAY);
    const senderReceivers = receivers.filter(r => r.senderId === senderId);
    return { success: true, data: senderReceivers };
  },

  async getById(id: string): Promise<ApiResponse<Receiver>> {
    await sleep(API_DELAY);
    const receiver = receivers.find(r => r.id === id);
    if (!receiver) {
      return { success: false, error: 'Receiver not found' };
    }
    return { success: true, data: receiver };
  },

  async create(data: Omit<Receiver, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Receiver>> {
    await sleep(API_DELAY);
    
    const newReceiver: Receiver = {
      ...data,
      id: generateId('RCV'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    receivers.push(newReceiver);
    return { success: true, data: newReceiver, message: 'Receiver created successfully' };
  },

  async update(id: string, data: Partial<Receiver>, updatedBy?: string): Promise<ApiResponse<Receiver>> {
    await sleep(API_DELAY);
    
    const index = receivers.findIndex(r => r.id === id);
    if (index === -1) {
      return { success: false, error: 'Receiver not found' };
    }
    
    receivers[index] = {
      ...receivers[index],
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy,
    };
    
    return { success: true, data: receivers[index], message: 'Receiver updated successfully' };
  },

  async deactivate(id: string, updatedBy?: string): Promise<ApiResponse<Receiver>> {
    return this.update(id, { status: 'inactive' }, updatedBy);
  },
};

// ============ TRANSACTIONS API ============

export const transactionsApi = {
  async getAll(filters?: TransactionFilters): Promise<ApiResponse<Transaction[]>> {
    await sleep(API_DELAY);
    
    let filtered = [...transactions];
    
    if (filters) {
      if (filters.startDate) {
        filtered = filtered.filter(t => new Date(t.createdAt) >= new Date(filters.startDate!));
      }
      if (filters.endDate) {
        filtered = filtered.filter(t => new Date(t.createdAt) <= new Date(filters.endDate!));
      }
      if (filters.senderId) {
        filtered = filtered.filter(t => t.senderId === filters.senderId);
      }
      if (filters.receiverId) {
        filtered = filtered.filter(t => t.receiverId === filters.receiverId);
      }
      if (filters.status) {
        filtered = filtered.filter(t => t.status === filters.status);
      }
      if (filters.minAmount) {
        filtered = filtered.filter(t => t.amountJPY >= filters.minAmount!);
      }
      if (filters.maxAmount) {
        filtered = filtered.filter(t => t.amountJPY <= filters.maxAmount!);
      }
    }
    
    // Sort by date descending
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return { success: true, data: filtered };
  },

  async getById(id: string): Promise<ApiResponse<Transaction>> {
    await sleep(API_DELAY);
    const transaction = transactions.find(t => t.id === id || t.transactionId === id);
    if (!transaction) {
      return { success: false, error: 'Transaction not found' };
    }
    return { success: true, data: transaction };
  },

  async create(data: SendMoneyForm): Promise<ApiResponse<Transaction>> {
    await sleep(API_DELAY * 2); // Longer delay for transaction
    
    const sender = senders.find(s => s.id === data.senderId);
    const receiver = receivers.find(r => r.id === data.receiverId);
    
    if (!sender || !receiver) {
      return { success: false, error: 'Invalid sender or receiver' };
    }
    
    const summary = calculateTransferSummary(data.amountJPY);
    
    const newTransaction: Transaction = {
      id: generateId('TXN'),
      transactionId: generateTransactionId(),
      senderId: data.senderId,
      senderName: sender.fullName,
      receiverId: data.receiverId,
      receiverName: receiver.fullName,
      amountJPY: summary.amountJPY,
      amountNPR: summary.amountNPR,
      serviceFee: summary.serviceFee,
      exchangeRate: summary.exchangeRate,
      totalAmountJPY: Math.ceil(summary.totalJPY),
      status: 'pending',
      purpose: data.purpose,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    transactions.unshift(newTransaction);
    
    // Simulate Kafka message (in real app, this would be produced to Kafka)
    console.log('[Mock Kafka] Transaction produced:', newTransaction.transactionId);
    
    return { 
      success: true, 
      data: newTransaction, 
      message: 'Transaction created successfully' 
    };
  },
};

// ============ DASHBOARD API ============

export const dashboardApi = {
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    await sleep(API_DELAY);
    
    // Calculate real stats from transactions
    const today = new Date().toISOString().split('T')[0];
    const completedToday = transactions.filter(
      t => t.status === 'completed' && t.completedAt?.startsWith(today)
    ).length;
    
    const stats: DashboardStats = {
      ...mockDashboardStats,
      totalTransactions: transactions.length,
      pendingTransactions: transactions.filter(t => t.status === 'pending').length,
      completedToday,
      activeUsers: users.filter(u => u.status === 'active').length,
      activeSenders: senders.filter(s => s.status === 'active').length,
    };
    
    return { success: true, data: stats };
  },
};
