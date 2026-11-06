import type { Subscription } from "../types";

export interface StopGuide {
  where: string;
  steps: string[];
  tip?: string;
}

// Generic, channel-based guidance. Mohar never cancels anything itself; it points
// to the place where the subscription is actually managed.
export function stopGuideFor(sub: Pick<Subscription, "name" | "channel">): StopGuide {
  const name = sub.name;
  switch (sub.channel) {
    case "app-store":
      return {
        where: "Your phone's App Store settings",
        steps: ["Settings", "Your name", "Subscriptions", name, "Cancel subscription"],
        tip: "App Store subscriptions can't be stopped from the provider's website, only from the device's settings.",
      };
    case "google-play":
      return {
        where: "The Google Play Store app",
        steps: ["Play Store", "Profile", "Payments & subscriptions", "Subscriptions", name, "Cancel"],
        tip: "Uninstalling the app doesn't cancel the subscription.",
      };
    case "paypal":
      return {
        where: `${name}'s website or app`,
        steps: ["Sign in", "Account or billing", "Cancel plan", "Confirm"],
        tip: "It's paid through PayPal. Cancel with the provider first. Removing the PayPal automatic payment on its own may not end the plan.",
      };
    case "revolut":
      return {
        where: `${name}'s website or app`,
        steps: ["Sign in", "Account or billing", "Cancel plan", "Confirm"],
        tip: "It's paid with your Revolut card. Cancel with the provider first, then check the card's payments in the Revolut app to make sure nothing else is set to renew.",
      };
    case "bank-transfer":
      return {
        where: "Your bank app and the provider",
        steps: ["Tell the provider", "Bank app", "Standing orders", "Cancel"],
        tip: "Tell the provider first, so they don't treat the missing payment as a missed bill.",
      };
    default:
      return {
        where: `${name}'s website or app`,
        steps: ["Sign in", "Account or billing", "Cancel plan", "Confirm"],
        tip: "Many services offer a pause instead of cancelling. You'll usually see it on the same page.",
      };
  }
}
