import type { PaymentChannel, Subscription, SubscriptionInput } from "../types";
import { isoInDays } from "../utils/date";

// Renewal dates are relative to today so the demo always has something coming up.
// merchantKey ties a subscription to the matching transactions in the mock bank feed.
type Seed = Omit<SubscriptionInput, "renewalDate" | "status" | "channel" | "source"> & {
  inDays: number;
  channel?: PaymentChannel;
};

const SEEDS: Record<string, Seed[]> = {
  usr_maya: [
    { name: "Spotify Premium", price: 11.99, currency: "USD", billingCycle: "monthly", inDays: 2, category: "Entertainment", merchantKey: "spotify" },
    { name: "Figma Professional", price: 15, currency: "USD", billingCycle: "monthly", inDays: 5, category: "Design", merchantKey: "figma", notes: "Billed to personal card, expense at end of month." },
    { name: "Netflix Standard", price: 15.49, currency: "USD", billingCycle: "monthly", inDays: 9, category: "Entertainment", merchantKey: "netflix" },
    { name: "Notion Plus", price: 96, currency: "USD", billingCycle: "yearly", inDays: 41, category: "Productivity", merchantKey: "notion" },
    { name: "iCloud+ 200 GB", price: 2.99, currency: "USD", billingCycle: "monthly", inDays: 14, category: "Cloud & storage", merchantKey: "icloud", channel: "app-store" },
    { name: "Adobe Lightroom", price: 119.88, currency: "USD", billingCycle: "yearly", inDays: 112, category: "Design", merchantKey: "lightroom", notes: "Only use it for travel photos. Reconsider before renewal." },
    { name: "The Atlantic", price: 79.99, currency: "USD", billingCycle: "yearly", inDays: 203, category: "News & reading", merchantKey: "atlantic" },
    { name: "Headspace", price: 12.99, currency: "USD", billingCycle: "monthly", inDays: 22, category: "Health", merchantKey: "headspace" },
    { name: "Duolingo Super", price: 59.99, currency: "USD", billingCycle: "yearly", inDays: 67, category: "Education", merchantKey: "duolingo", channel: "app-store" },
  ],
  usr_aarav: [
    { name: "GitHub Copilot", price: 10, currency: "USD", billingCycle: "monthly", inDays: 1, category: "Development", merchantKey: "github" },
    { name: "Netflix Standard", price: 13.99, currency: "EUR", billingCycle: "monthly", inDays: 6, category: "Entertainment", merchantKey: "netflix" },
    { name: "JetBrains All Products", price: 289, currency: "USD", billingCycle: "yearly", inDays: 34, category: "Development", merchantKey: "jetbrains", notes: "Second year price drops. Check the loyalty discount." },
    { name: "DigitalOcean Droplet", price: 6, currency: "USD", billingCycle: "monthly", inDays: 11, category: "Cloud & storage", merchantKey: "digitalocean", notes: "Side project API." },
    { name: "Spotify Premium", price: 11.99, currency: "EUR", billingCycle: "monthly", inDays: 17, category: "Entertainment", merchantKey: "spotify", channel: "revolut" },
    { name: "Google One 100 GB", price: 19.99, currency: "EUR", billingCycle: "yearly", inDays: 88, category: "Cloud & storage", merchantKey: "google-one", channel: "google-play" },
    { name: "Vercel Pro", price: 20, currency: "USD", billingCycle: "monthly", inDays: 25, category: "Development", merchantKey: "vercel" },
  ],
  usr_sofia: [
    { name: "Spotify Family", price: 17.99, currency: "EUR", billingCycle: "monthly", inDays: 3, category: "Entertainment", merchantKey: "spotify", notes: "Shared with Erik and the kids." },
    { name: "Netflix Standard", price: 13.99, currency: "EUR", billingCycle: "monthly", inDays: 12, category: "Entertainment", merchantKey: "netflix" },
    { name: "Microsoft 365 Family", price: 99, currency: "EUR", billingCycle: "yearly", inDays: 19, category: "Productivity", merchantKey: "microsoft" },
    { name: "Storytel", price: 16.99, currency: "EUR", billingCycle: "monthly", inDays: 8, category: "News & reading", merchantKey: "storytel" },
    { name: "Strava", price: 59.99, currency: "EUR", billingCycle: "yearly", inDays: 145, category: "Health", merchantKey: "strava", channel: "app-store" },
    { name: "Canva Pro", price: 109.99, currency: "EUR", billingCycle: "yearly", inDays: 58, category: "Design", merchantKey: "canva", notes: "Used for class materials." },
  ],
};

export function buildSeedSubscriptions(userId: string): Subscription[] {
  const createdAt = new Date().toISOString();
  return (SEEDS[userId] ?? []).map(({ inDays, channel = "card", ...seed }, index) => ({
    ...seed,
    id: `${userId}_seed_${index + 1}`,
    userId,
    renewalDate: isoInDays(inDays),
    status: "active",
    channel,
    source: "manual",
    createdAt,
  }));
}
