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

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  defaultCurrency: CurrencyCode;
}

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  price: number;
  currency: CurrencyCode;
  billingCycle: BillingCycle;
  renewalDate: string;
  category: Category;
  notes?: string;
  createdAt: string;
}

export type SubscriptionInput = Omit<Subscription, "id" | "userId" | "createdAt">;

export interface UserSettings {
  displayCurrency: CurrencyCode;
  reminderDays: number;
}

export interface UpcomingRenewal {
  subscription: Subscription;
  nextDate: string;
  daysUntil: number;
}
