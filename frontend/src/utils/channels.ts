import type { PaymentChannel } from "../types";

export const CHANNEL_LABELS: Record<PaymentChannel, string> = {
  card: "Card",
  paypal: "PayPal",
  "app-store": "App Store",
  "google-play": "Google Play",
  revolut: "Revolut",
  "bank-transfer": "Bank transfer",
};
