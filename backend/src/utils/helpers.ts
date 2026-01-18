/**
 * Generate a unique ID with optional prefix
 * @param prefix - Optional prefix for the ID
 * @returns A unique string ID
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${random}`.toUpperCase();
}

/**
 * Generate a transaction ID
 * Format: TXN-YYYYMMDD-XXXXXX
 */
export function generateTransactionId(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${date}-${random}`;
}

/**
 * Calculate transfer fees and totals
 */
export interface TransferCalculation {
  amountJPY: number;
  amountNPR: number;
  serviceFee: number;
  exchangeRate: number;
  totalJPY: number;
}

export function calculateTransferSummary(amountJPY: number, exchangeRate: number = 0.92): TransferCalculation {
  // Service fee: 2% of amount or minimum 500 JPY
  const serviceFee = Math.max(amountJPY * 0.02, 500);
  const totalJPY = amountJPY + serviceFee;
  const amountNPR = amountJPY * exchangeRate;

  return {
    amountJPY,
    amountNPR,
    serviceFee,
    exchangeRate,
    totalJPY
  };
}

/**
 * Sleep utility for development/testing
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format currency amounts
 */
export function formatCurrency(amount: number, currency: string = 'JPY'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic validation)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Generate OTP code
 */
export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}
