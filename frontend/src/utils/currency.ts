import type { CurrencyCode } from "../types";

// Fixed, approximate rates relative to USD. Fine for a prototype estimate;
// the real build should get rates from the backend.
const USD_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  NPR: 133.5,
  INR: 83.4,
  CAD: 1.37,
  AUD: 1.52,
  JPY: 150.2,
};

export function convert(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return amount;
  return (amount / USD_RATES[from]) * USD_RATES[to];
}

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  USD: "US dollar",
  EUR: "Euro",
  GBP: "British pound",
  NPR: "Nepalese rupee",
  INR: "Indian rupee",
  CAD: "Canadian dollar",
  AUD: "Australian dollar",
  JPY: "Japanese yen",
};
