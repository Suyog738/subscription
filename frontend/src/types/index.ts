export type BillingCycle = "monthly" | "yearly";

export const CURRENCIES = ["USD", "EUR", "GBP", "NPR", "INR", "CAD", "AUD", "JPY"] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

export const CATEGORIES = [
  "Entertainment",
  "Productivity",
  "Development",
  "Design",
  "Cloud & storage",
  "Health",
  "News & reading",
  "Education",
  "Other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const PAYMENT_CHANNELS = ["card", "paypal", "app-store", "google-play", "revolut", "bank-transfer"] as const;
export type PaymentChannel = (typeof PAYMENT_CHANNELS)[number];

export type SubscriptionStatus = "active" | "trial" | "stopped";

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  defaultCurrency: CurrencyCode;
}

export interface StopRecord {
  stoppedAt: string;
  checkOn: string;
  reference?: string;
  note?: string;
  check: "pending" | "confirmed" | "charged";
  checkedAt?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  price: number;
  currency: CurrencyCode;
  billingCycle: BillingCycle;
  /** Next charge date. For a free trial this is the day it turns paid. */
  renewalDate: string;
  category: Category;
  status: SubscriptionStatus;
  channel: PaymentChannel;
  source: "manual" | "bank";
  /** Links the subscription to bank transactions from the same merchant. */
  merchantKey?: string;
  notes?: string;
  stop?: StopRecord;
  createdAt: string;
}

export type SubscriptionInput = Omit<Subscription, "id" | "userId" | "createdAt" | "stop">;

export type NotificationEvent = "renewals" | "trials" | "priceRises" | "balance" | "stopChecks";

export interface NotificationPreferences {
  browser: boolean;
  email: boolean;
  events: Record<NotificationEvent, boolean>;
}

export interface UserSettings {
  displayCurrency: CurrencyCode;
  reminderDays: number;
  trialReminderDays: number;
  yearlyReminderDays: number;
  notifications: NotificationPreferences;
}

export type NotificationChannel = "in-app" | "browser" | "email";

export interface AppNotification {
  id: string;
  key: string;
  event: NotificationEvent | "test";
  title: string;
  body: string;
  link: string;
  createdAt: string;
  read: boolean;
  channels: NotificationChannel[];
}

export interface EmailMessage {
  id: string;
  notificationId: string;
  from: string;
  to: string;
  subject: string;
  preview: string;
  heading: string;
  paragraphs: string[];
  details?: [string, string][];
  cta: { label: string; link: string };
  sentAt: string;
  read: boolean;
}

export interface UpcomingRenewal {
  subscription: Subscription;
  nextDate: string;
  daysUntil: number;
}

export interface BankInstitution {
  id: string;
  name: string;
  country: string;
  kind: string;
  tone: 1 | 2 | 3 | 4 | 5;
}

export interface BankConnection {
  bankId: string;
  bankName: string;
  accountName: string;
  accountMask: string;
  balance: number;
  currency: CurrencyCode;
  connectedAt: string;
  lastSyncedAt: string;
}

export interface Transaction {
  id: string;
  date: string;
  descriptor: string;
  merchant: string;
  merchantKey: string;
  /** Always positive. `kind` says whether money went out or came in. */
  amount: number;
  currency: CurrencyCode;
  channel: PaymentChannel;
  kind: "charge" | "card-check" | "purchase" | "income";
}

export interface DetectedSubscription {
  merchantKey: string;
  merchant: string;
  kind: "recurring" | "trial" | "unnamed";
  amount: number;
  currency: CurrencyCode;
  cycle: BillingCycle;
  channel: PaymentChannel;
  lastChargeDate: string;
  nextExpectedDate: string;
  charges: Transaction[];
  reason: string;
  categoryGuess: Category;
  priceChange?: { from: number; to: number; date: string };
}
