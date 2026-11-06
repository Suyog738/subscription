import type { BillingCycle, CurrencyCode } from "../types";
import { parseISODate } from "./date";

const moneyFormatters = new Map<string, Intl.NumberFormat>();

export function formatMoney(amount: number, currency: CurrencyCode, compact = false): string {
  const key = `${currency}-${compact}`;
  let formatter = moneyFormatters.get(key);
  if (!formatter) {
    const digits = compact || currency === "JPY" ? 0 : 2;
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    moneyFormatters.set(key, formatter);
  }
  return formatter.format(amount);
}

const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const longDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const weekdayDate = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" });

export function formatShortDate(iso: string): string {
  return shortDate.format(parseISODate(iso));
}

export function formatLongDate(iso: string): string {
  return longDate.format(parseISODate(iso));
}

export function formatWeekdayDate(date: Date): string {
  return weekdayDate.format(date);
}

export function formatDateParts(iso: string): { month: string; day: string } {
  const date = parseISODate(iso);
  return {
    month: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: String(date.getDate()),
  };
}

export function formatRelativeDays(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days < 14) return `In ${days} days`;
  if (days < 60) return `In ${Math.round(days / 7)} weeks`;
  return `In ${Math.round(days / 30)} months`;
}

export function formatCycle(cycle: BillingCycle): string {
  return cycle === "monthly" ? "Monthly" : "Yearly";
}

export function cycleSuffix(cycle: BillingCycle): string {
  return cycle === "monthly" ? "/mo" : "/yr";
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
