import type { DemoUser } from "../types";

export const DEMO_PASSWORD = "mohar-demo";

export const DEMO_USERS: DemoUser[] = [
  { id: "usr_maya", name: "Maya Chen", email: "maya@mohar.app", defaultCurrency: "USD" },
  { id: "usr_aarav", name: "Aarav Shrestha", email: "aarav@mohar.app", defaultCurrency: "EUR" },
  { id: "usr_sofia", name: "Sofia Lindqvist", email: "sofia@mohar.app", defaultCurrency: "EUR" },
];

export const DEMO_USER_BLURBS: Record<string, string> = {
  usr_maya: "Product designer · 9 subscriptions in USD",
  usr_aarav: "Developer in Helsinki · EUR and USD, pays with Revolut",
  usr_sofia: "Teacher in Stockholm · mostly EUR, a few yearly",
};
