import type { Category, CurrencyCode, PaymentChannel, Transaction } from "../types";
import { addDays, addMonthsClamped, startOfToday, toISODate } from "../utils/date";

// Everything here is fictional: account numbers, merchants' descriptors and amounts.
// Dates are generated relative to today so the feed always looks current.

// The demo account's own currency and home region. Sample payments are the same
// whichever partner bank the demo user picks.
export const ACCOUNT: Record<string, { currency: CurrencyCode }> = {
  usr_maya: { currency: "USD" },
  usr_aarav: { currency: "EUR" },
  usr_sofia: { currency: "EUR" },
};

export const STARTING_BALANCE: Record<string, number> = {
  usr_maya: 2140.55,
  usr_aarav: 18.4,
  usr_sofia: 1860.2,
};

export interface MerchantSeed {
  key: string;
  merchant: string;
  descriptor: string;
  channel: PaymentChannel;
  currency: CurrencyCode;
  category: Category;
  /** Monthly charge amounts, oldest first. The last one is the current price. */
  amounts?: number[];
  /** Days from today until the next expected charge. */
  nextInDays?: number;
  /** A 0.00 card check this many days ago, which is how most free trials start. */
  trialCheckDaysAgo?: number;
  /** Demo only: this provider keeps charging after the customer says they stopped. */
  keepsChargingAfterStop?: boolean;
}

export const repeat = (value: number, times: number) => Array.from({ length: times }, () => value);

export const MERCHANTS: Record<string, MerchantSeed[]> = {
  usr_maya: [
    { key: "spotify", merchant: "Spotify", descriptor: "SPOTIFY P2F7A1C0", channel: "card", currency: "USD", category: "Entertainment", amounts: [10.99, 10.99, 11.99, 11.99, 11.99, 11.99], nextInDays: 2 },
    { key: "figma", merchant: "Figma", descriptor: "FIGMA MONTHLY", channel: "card", currency: "USD", category: "Design", amounts: repeat(15, 6), nextInDays: 5 },
    { key: "netflix", merchant: "Netflix", descriptor: "NETFLIX.COM", channel: "card", currency: "USD", category: "Entertainment", amounts: [13.99, 13.99, 13.99, 13.99, 15.49, 15.49], nextInDays: 9 },
    { key: "icloud", merchant: "iCloud+", descriptor: "APPLE.COM/BILL ICLOUD", channel: "app-store", currency: "USD", category: "Cloud & storage", amounts: repeat(2.99, 6), nextInDays: 14 },
    { key: "headspace", merchant: "Headspace", descriptor: "HEADSPACE.COM", channel: "card", currency: "USD", category: "Health", amounts: repeat(12.99, 6), nextInDays: 22, keepsChargingAfterStop: true },
    { key: "audible", merchant: "Audible", descriptor: "AUDIBLE*MEMBERSHIP", channel: "card", currency: "USD", category: "News & reading", amounts: repeat(14.95, 6), nextInDays: 16 },
    { key: "app-store", merchant: "App Store", descriptor: "APPLE.COM/BILL", channel: "app-store", currency: "USD", category: "Other", amounts: repeat(4.99, 5), nextInDays: 12 },
    { key: "adobe-cc", merchant: "Adobe Creative Cloud", descriptor: "ADOBE *CREATIVE CLD", channel: "card", currency: "USD", category: "Design", trialCheckDaysAgo: 3 },
  ],
  usr_aarav: [
    { key: "github", merchant: "GitHub", descriptor: "GITHUB, INC. SAN FRANCISCO", channel: "card", currency: "USD", category: "Development", amounts: repeat(10, 6), nextInDays: 1 },
    { key: "netflix", merchant: "Netflix", descriptor: "NETFLIX.COM", channel: "card", currency: "EUR", category: "Entertainment", amounts: repeat(13.99, 6), nextInDays: 6 },
    { key: "digitalocean", merchant: "DigitalOcean", descriptor: "DIGITALOCEAN.COM", channel: "card", currency: "USD", category: "Cloud & storage", amounts: [4, 4, 4, 6, 6, 6], nextInDays: 11, keepsChargingAfterStop: true },
    { key: "spotify", merchant: "Spotify", descriptor: "REVOLUT*SPOTIFY", channel: "revolut", currency: "EUR", category: "Entertainment", amounts: repeat(11.99, 6), nextInDays: 17 },
    { key: "vercel", merchant: "Vercel", descriptor: "VERCEL INC.", channel: "card", currency: "USD", category: "Development", amounts: repeat(20, 6), nextInDays: 25 },
    { key: "youtube", merchant: "YouTube Premium", descriptor: "REVOLUT*GOOGLE YOUTUBE", channel: "revolut", currency: "EUR", category: "Entertainment", amounts: repeat(12.99, 5), nextInDays: 8 },
    { key: "google-play", merchant: "Google Play", descriptor: "GOOGLE *Play Store", channel: "google-play", currency: "EUR", category: "Other", amounts: repeat(4.99, 4), nextInDays: 14 },
    { key: "canva", merchant: "Canva", descriptor: "CANVA* 0X93KD", channel: "card", currency: "EUR", category: "Design", trialCheckDaysAgo: 2 },
  ],
  usr_sofia: [
    { key: "spotify", merchant: "Spotify", descriptor: "SPOTIFY AB STOCKHOLM", channel: "card", currency: "EUR", category: "Entertainment", amounts: [16.99, 16.99, 16.99, 17.99, 17.99, 17.99], nextInDays: 3 },
    { key: "netflix", merchant: "Netflix", descriptor: "NETFLIX.COM", channel: "card", currency: "EUR", category: "Entertainment", amounts: repeat(13.99, 6), nextInDays: 12 },
    { key: "storytel", merchant: "Storytel", descriptor: "STORYTEL AB", channel: "card", currency: "EUR", category: "News & reading", amounts: repeat(16.99, 6), nextInDays: 8, keepsChargingAfterStop: true },
    { key: "amazon-prime", merchant: "Amazon Prime", descriptor: "AMZN PRIME DE", channel: "card", currency: "EUR", category: "Entertainment", amounts: repeat(8.99, 6), nextInDays: 20 },
    { key: "disney", merchant: "Disney+", descriptor: "PAYPAL *DISNEYPLUS", channel: "paypal", currency: "EUR", category: "Entertainment", amounts: repeat(9.99, 4), nextInDays: 15 },
    { key: "app-store", merchant: "App Store", descriptor: "APPLE.COM/BILL", channel: "app-store", currency: "EUR", category: "Other", amounts: repeat(2.99, 6), nextInDays: 4 },
    { key: "nytimes", merchant: "The New York Times", descriptor: "NYTIMES DIGITAL", channel: "card", currency: "EUR", category: "News & reading", trialCheckDaysAgo: 1 },
  ],
};

const PURCHASES: Record<string, { merchant: string; amount: number; daysAgo: number }[]> = {
  usr_maya: [
    { merchant: "Whole Foods Market", amount: 84.12, daysAgo: 1 },
    { merchant: "Blue Bottle Coffee", amount: 6.5, daysAgo: 2 },
    { merchant: "Uber", amount: 18.4, daysAgo: 4 },
    { merchant: "Amazon.com", amount: 42.99, daysAgo: 6 },
    { merchant: "Shell", amount: 51.2, daysAgo: 9 },
    { merchant: "Target", amount: 63.05, daysAgo: 13 },
    { merchant: "Trader Joe's", amount: 57.3, daysAgo: 18 },
  ],
  usr_aarav: [
    { merchant: "K-Citymarket", amount: 64.2, daysAgo: 1 },
    { merchant: "Robert's Coffee", amount: 5.4, daysAgo: 2 },
    { merchant: "HSL", amount: 3.1, daysAgo: 3 },
    { merchant: "Wolt", amount: 24.5, daysAgo: 5 },
    { merchant: "Verkkokauppa.com", amount: 89, daysAgo: 9 },
    { merchant: "S-Market", amount: 38.9, daysAgo: 12 },
  ],
  usr_sofia: [
    { merchant: "ICA Maxi", amount: 76.4, daysAgo: 1 },
    { merchant: "Espresso House", amount: 4.9, daysAgo: 2 },
    { merchant: "SL Access", amount: 39, daysAgo: 5 },
    { merchant: "Apotek Hjärtat", amount: 22.5, daysAgo: 8 },
    { merchant: "Coop", amount: 58.75, daysAgo: 12 },
  ],
};

export const INCOME: Record<string, { merchant: string; amount: number; dayOfMonth: number }> = {
  usr_maya: { merchant: "Payroll · Fieldnote Studio", amount: 4200, dayOfMonth: 1 },
  usr_aarav: { merchant: "Palkka · Pahad Labs Oy", amount: 3900, dayOfMonth: 28 },
  usr_sofia: { merchant: "Lön · Solna Kommun", amount: 3350, dayOfMonth: 25 },
};

export function chargeDatesFor(seed: MerchantSeed, today = startOfToday()): Date[] {
  if (!seed.amounts || seed.nextInDays === undefined) return [];
  const next = addDays(today, seed.nextInDays);
  return seed.amounts.map((_, index) => addMonthsClamped(next, -(seed.amounts!.length - index)));
}

export function buildTransactions(userId: string, today = startOfToday()): Transaction[] {
  const list: Transaction[] = [];
  let counter = 0;
  const id = () => `${userId}_txn_${++counter}`;

  for (const seed of MERCHANTS[userId] ?? []) {
    chargeDatesFor(seed, today).forEach((date, index) => {
      list.push({
        id: id(),
        date: toISODate(date),
        descriptor: seed.descriptor,
        merchant: seed.merchant,
        merchantKey: seed.key,
        amount: seed.amounts![index],
        currency: seed.currency,
        channel: seed.channel,
        kind: "charge",
      });
    });
    if (seed.trialCheckDaysAgo !== undefined) {
      list.push({
        id: id(),
        date: toISODate(addDays(today, -seed.trialCheckDaysAgo)),
        descriptor: seed.descriptor,
        merchant: seed.merchant,
        merchantKey: seed.key,
        amount: 0,
        currency: seed.currency,
        channel: seed.channel,
        kind: "card-check",
      });
    }
  }

  for (const purchase of PURCHASES[userId] ?? []) {
    list.push({
      id: id(),
      date: toISODate(addDays(today, -purchase.daysAgo)),
      descriptor: purchase.merchant.toUpperCase(),
      merchant: purchase.merchant,
      merchantKey: `purchase-${counter}`,
      amount: purchase.amount,
      currency: ACCOUNT[userId]?.currency ?? "USD",
      channel: "card",
      kind: "purchase",
    });
  }

  const income = INCOME[userId];
  if (income) {
    for (let k = 0; k < 6; k += 1) {
      const date = new Date(today.getFullYear(), today.getMonth() - k, income.dayOfMonth);
      if (date > today) continue;
      list.push({
        id: id(),
        date: toISODate(date),
        descriptor: income.merchant.toUpperCase(),
        merchant: income.merchant,
        merchantKey: "income",
        amount: income.amount,
        currency: ACCOUNT[userId]?.currency ?? "USD",
        channel: "bank-transfer",
        kind: "income",
      });
    }
  }

  return list.sort((a, b) => b.date.localeCompare(a.date));
}

export function merchantSeed(userId: string, key: string): MerchantSeed | undefined {
  return MERCHANTS[userId]?.find((seed) => seed.key === key);
}
