import type { DemoUser } from "../types";

export const DEMO_PASSWORD = "renewly-demo";

export const DEMO_USERS: DemoUser[] = [
  { id: "usr_maya", name: "Maya Chen", email: "maya@renewly.app", defaultCurrency: "USD" },
  { id: "usr_aarav", name: "Aarav Shrestha", email: "aarav@renewly.app", defaultCurrency: "NPR" },
  { id: "usr_sofia", name: "Sofia Lindqvist", email: "sofia@renewly.app", defaultCurrency: "EUR" },
];

export const DEMO_USER_BLURBS: Record<string, string> = {
  usr_maya: "Product designer · 9 subscriptions in USD",
  usr_aarav: "Developer in Kathmandu · mixed USD and NPR",
  usr_sofia: "Teacher in Stockholm · mostly EUR, a few yearly",
};
