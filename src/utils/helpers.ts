import { EXCHANGE_RATE, SERVICE_FEE_TIERS } from './constants';

/**
 * Calculate service fee based on NPR amount
 */
export function calculateServiceFee(amountNPR: number): number {
  const tier = SERVICE_FEE_TIERS.find(
    (t) => amountNPR >= t.min && amountNPR <= t.max
  );
  return tier?.fee ?? 3000;
}

/**
 * Convert JPY to NPR
 */
export function convertJPYToNPR(amountJPY: number): number {
  return Number((amountJPY * EXCHANGE_RATE).toFixed(2));
}

/**
 * Convert NPR to JPY
 */
export function convertNPRToJPY(amountNPR: number): number {
  return Number((amountNPR / EXCHANGE_RATE).toFixed(2));
}

/**
 * Format currency with proper symbols
 */
export function formatCurrency(amount: number, currency: 'JPY' | 'NPR'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'JPY' ? 'JPY' : 'NPR',
    minimumFractionDigits: currency === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  });
  
  // Custom formatting for NPR
  if (currency === 'NPR') {
    return `NPR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }
  
  return formatter.format(amount);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date with time
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Generate a unique ID
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${randomStr}`.toUpperCase();
}

/**
 * Generate transaction ID
 */
export function generateTransactionId(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN${year}${month}${day}${random}`;
}

/**
 * Mask sensitive data
 */
export function maskData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) return data;
  return '•'.repeat(data.length - visibleChars) + data.slice(-visibleChars);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-]{10,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Get status color class
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-success/10 text-success',
    inactive: 'bg-muted text-muted-foreground',
    pending: 'bg-warning/10 text-warning',
    pending_verification: 'bg-warning/10 text-warning',
    processing: 'bg-primary/10 text-primary',
    completed: 'bg-success/10 text-success',
    failed: 'bg-destructive/10 text-destructive',
    cancelled: 'bg-muted text-muted-foreground',
  };
  return colors[status] ?? 'bg-muted text-muted-foreground';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Sleep utility for simulating API delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Calculate transfer summary
 */
export function calculateTransferSummary(amountJPY: number) {
  const amountNPR = convertJPYToNPR(amountJPY);
  const serviceFee = calculateServiceFee(amountNPR);
  const serviceFeeJPY = convertNPRToJPY(serviceFee);
  const totalJPY = amountJPY + serviceFeeJPY;
  
  return {
    amountJPY,
    amountNPR,
    serviceFee,
    serviceFeeJPY,
    totalJPY,
    exchangeRate: EXCHANGE_RATE,
  };
}
