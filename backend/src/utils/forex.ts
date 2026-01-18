// Forex rates (should be configurable via admin panel in production)
export const EXCHANGE_RATES = {
  JPY_TO_NPR: parseFloat(process.env.EXCHANGE_RATE_JPY_TO_NPR || '0.92'),
} as const;

export function convertJPYToNPR(amountJPY: number): number {
  return Number((amountJPY * EXCHANGE_RATES.JPY_TO_NPR).toFixed(2));
}

export function convertNPRToJPY(amountNPR: number): number {
  return Number((amountNPR / EXCHANGE_RATES.JPY_TO_NPR).toFixed(2));
}

export function getCurrentExchangeRate(): number {
  return EXCHANGE_RATES.JPY_TO_NPR;
}
