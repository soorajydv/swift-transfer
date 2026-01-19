// Exchange rate: 1 JPY = 0.92 NPR
export const EXCHANGE_RATE = 0.92;

// Service fee tiers (in NPR)
export const SERVICE_FEE_TIERS = [
  { min: 0, max: 100000, fee: 500 },
  { min: 100000.01, max: 200000, fee: 1000 },
  { min: 200000.01, max: Infinity, fee: 3000 },
] as const;

// OTP expiry time in seconds
export const OTP_EXPIRY_SECONDS = 300; // 5 minutes

// Rate limiting
export const RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 60000, // 1 minute
} as const;

// API endpoints (for future integration)
export const API_ENDPOINTS = {
  auth: {
    requestOtp: '/api/auth/otp/request',
    verifyOtp: '/api/auth/otp/verify',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
  },
  users: {
    list: '/api/users',
    create: '/api/users',
    update: '/api/users/:id',
    delete: '/api/users/:id',
  },
  senders: {
    list: '/api/senders',
    create: '/api/senders',
    update: '/api/senders/:id',
    delete: '/api/senders/:id',
  },
  receivers: {
    list: '/api/receivers',
    create: '/api/receivers',
    update: '/api/receivers/:id',
    delete: '/api/receivers/:id',
  },
  transactions: {
    list: '/api/transactions',
    create: '/api/transactions',
    getById: '/api/transactions/:id',
  },
  reports: {
    transactions: '/api/reports/transactions',
    summary: '/api/reports/summary',
  },
} as const;

// Validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s-]{10,15}$/,
  otp: /^\d{6}$/,
} as const;

// Purposes for money transfer
export const TRANSFER_PURPOSES = [
  'Family Support',
  'Education',
  'Medical',
  'Property Purchase',
  'Business',
  'Gift',
  'Other',
] as const;

// Nepal banks (sample)
export const NEPAL_BANKS = [
  'Nepal Rastra Bank',
  'Nepal Bank Limited',
  'Rastriya Banijya Bank',
  'Nabil Bank',
  'Standard Chartered Bank Nepal',
  'Himalayan Bank',
  'Nepal SBI Bank',
  'Everest Bank',
  'Global IME Bank',
  'Mega Bank Nepal',
  'Citizens Bank International',
  'Prime Commercial Bank',
  'NIC Asia Bank',
  'Machhapuchchhre Bank',
  'Kumari Bank',
  'Laxmi Sunrise Bank',
  'Siddhartha Bank',
  'Agricultural Development Bank',
  'Sanima Bank',
  'NMB Bank',
] as const;
