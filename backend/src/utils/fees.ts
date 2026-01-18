import { convertJPYToNPR, getCurrentExchangeRate } from './forex';

// Service fee tiers in NPR
export const SERVICE_FEE_TIERS = [
  { min: 0, max: 100000, fee: 500 },
  { min: 100000.01, max: 200000, fee: 1000 },
  { min: 200000.01, max: Infinity, fee: 3000 },
] as const;

export function calculateServiceFee(amountNPR: number): number {
  const tier = SERVICE_FEE_TIERS.find(
    (t) => amountNPR >= t.min && amountNPR <= t.max
  );
  return tier?.fee ?? 3000;
}

export function calculateTransferSummary(amountJPY: number) {
  const amountNPR = convertJPYToNPR(amountJPY);
  const serviceFee = calculateServiceFee(amountNPR);
  const serviceFeeJPY = convertJPYToNPR(serviceFee);
  const totalJPY = amountJPY + serviceFeeJPY;

  return {
    amountJPY,
    amountNPR,
    serviceFee,
    serviceFeeJPY,
    totalJPY,
    exchangeRate: getCurrentExchangeRate(),
  };
}

export function getServiceFeeTiers() {
  return SERVICE_FEE_TIERS;
}
