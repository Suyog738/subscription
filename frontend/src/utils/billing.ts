import type { CurrencyCode, Subscription, UpcomingRenewal, UserSettings } from "../types";
import { convert } from "./currency";
import { addMonthsClamped, daysBetween, parseISODate, startOfToday, toISODate } from "./date";

type Priced = Pick<Subscription, "price" | "billingCycle">;

export function monthlyEquivalent(sub: Priced): number {
  return sub.billingCycle === "monthly" ? sub.price : sub.price / 12;
}

export function yearlyEquivalent(sub: Priced): number {
  return sub.billingCycle === "monthly" ? sub.price * 12 : sub.price;
}

export function monthlyEquivalentIn(sub: Subscription, currency: CurrencyCode): number {
  return convert(monthlyEquivalent(sub), sub.currency, currency);
}

export interface SpendingSummary {
  monthly: number;
  yearly: number;
  count: number;
  currency: CurrencyCode;
  mixedCurrencies: boolean;
}

export function summarizeSpending(subs: Subscription[], currency: CurrencyCode): SpendingSummary {
  const yearly = subs.reduce((total, sub) => total + convert(yearlyEquivalent(sub), sub.currency, currency), 0);
  return {
    monthly: yearly / 12,
    yearly,
    count: subs.length,
    currency,
    mixedCurrencies: subs.some((sub) => sub.currency !== currency),
  };
}

// A stored renewal date can fall in the past (time moved on, or the user entered
// last cycle's date). Roll it forward by whole billing cycles from that anchor.
export function nextRenewalDate(
  sub: Pick<Subscription, "renewalDate" | "billingCycle">,
  today = startOfToday(),
): string {
  const anchor = parseISODate(sub.renewalDate);
  if (anchor >= today) return sub.renewalDate;
  const step = sub.billingCycle === "monthly" ? 1 : 12;
  let cycles = 1;
  let next = addMonthsClamped(anchor, step);
  while (next < today) {
    cycles += 1;
    next = addMonthsClamped(anchor, step * cycles);
  }
  return toISODate(next);
}

export function getUpcomingRenewals(
  subs: Subscription[],
  withinDays = Number.POSITIVE_INFINITY,
  today = startOfToday(),
): UpcomingRenewal[] {
  return subs
    .map((subscription) => {
      const nextDate = nextRenewalDate(subscription, today);
      return { subscription, nextDate, daysUntil: daysBetween(today, parseISODate(nextDate)) };
    })
    .filter((item) => item.daysUntil <= withinDays)
    .sort((a, b) => a.daysUntil - b.daysUntil || a.subscription.name.localeCompare(b.subscription.name));
}

export type RenewalUrgency = "today" | "soon" | "later";

export function renewalUrgency(daysUntil: number, reminderDays: number): RenewalUrgency {
  if (daysUntil <= 1) return "today";
  if (daysUntil <= reminderDays) return "soon";
  return "later";
}

export function sumRenewals(items: UpcomingRenewal[], currency: CurrencyCode): number {
  return items.reduce(
    (total, item) => total + convert(item.subscription.price, item.subscription.currency, currency),
    0,
  );
}

export function spendingByCategory(subs: Subscription[], currency: CurrencyCode) {
  const totals = new Map<string, number>();
  for (const sub of subs) {
    totals.set(sub.category, (totals.get(sub.category) ?? 0) + monthlyEquivalentIn(sub, currency));
  }
  return [...totals.entries()]
    .map(([category, monthly]) => ({ category, monthly }))
    .sort((a, b) => b.monthly - a.monthly);
}

export interface MonthForecast {
  key: string;
  label: string;
  monthly: number;
  yearly: number;
  total: number;
  yearlyNames: string[];
  isCurrent: boolean;
}

// Actual charges by calendar month, starting this month. Monthly plans land every
// month; yearly plans only in the month they renew, which is where spikes come from.
export function forecastCharges(subs: Subscription[], currency: CurrencyCode, months = 12, today = startOfToday()): MonthForecast[] {
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + months, 1);
  const buckets: MonthForecast[] = Array.from({ length: months }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth() + index, 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleString("en-US", { month: "short" }),
      monthly: 0,
      yearly: 0,
      total: 0,
      yearlyNames: [],
      isCurrent: index === 0,
    };
  });

  for (const sub of subs) {
    const amount = convert(sub.price, sub.currency, currency);
    const step = sub.billingCycle === "monthly" ? 1 : 12;
    const anchor = parseISODate(nextRenewalDate(sub, today));
    for (let k = 0; ; k += 1) {
      const charge = addMonthsClamped(anchor, step * k);
      if (charge >= end) break;
      const index = (charge.getFullYear() - start.getFullYear()) * 12 + charge.getMonth() - start.getMonth();
      const bucket = buckets[index];
      if (!bucket) continue;
      if (sub.billingCycle === "monthly") bucket.monthly += amount;
      else {
        bucket.yearly += amount;
        bucket.yearlyNames.push(sub.name);
      }
      bucket.total += amount;
    }
  }
  return buckets;
}

// Different kinds of charge deserve different notice: a trial turning paid or a
// yearly renewal is a bigger surprise than a regular monthly charge.
export function leadDaysFor(sub: Pick<Subscription, "status" | "billingCycle">, settings: UserSettings): number {
  if (sub.status === "trial") return settings.trialReminderDays;
  if (sub.billingCycle === "yearly") return settings.yearlyReminderDays;
  return settings.reminderDays;
}

export function isLive(sub: Subscription): boolean {
  return sub.status !== "stopped";
}

export interface Savings {
  monthly: number;
  soFar: number;
  count: number;
}

// Money not spent since each subscription was stopped. A stop that was followed by
// another charge doesn't count until it's resolved.
export function savingsFrom(subs: Subscription[], currency: CurrencyCode, today = startOfToday()): Savings {
  let monthly = 0;
  let soFar = 0;
  let count = 0;
  for (const sub of subs) {
    if (sub.status !== "stopped" || !sub.stop || sub.stop.check === "charged") continue;
    const perMonth = monthlyEquivalentIn(sub, currency);
    const months = Math.max(1, Math.floor(daysBetween(parseISODate(sub.stop.stoppedAt), today) / 30) + 1);
    monthly += perMonth;
    soFar += sub.billingCycle === "yearly" ? convert(sub.price, sub.currency, currency) : perMonth * months;
    count += 1;
  }
  return { monthly, soFar, count };
}
