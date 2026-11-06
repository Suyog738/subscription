import { CATEGORIES, CURRENCIES, type SubscriptionInput } from "../types";
import { isValidISODate } from "./date";

export interface SubscriptionFormValues {
  name: string;
  price: string;
  currency: string;
  billingCycle: string;
  renewalDate: string;
  category: string;
  notes: string;
}

export type SubscriptionFormErrors = Partial<Record<keyof SubscriptionFormValues, string>>;

export const NAME_MAX = 60;
export const NOTES_MAX = 280;
const PRICE_MAX = 1_000_000;

export function validateSubscription(values: SubscriptionFormValues): SubscriptionFormErrors {
  const errors: SubscriptionFormErrors = {};

  const name = values.name.trim();
  if (!name) errors.name = "Give the subscription a name.";
  else if (name.length > NAME_MAX) errors.name = `Keep it under ${NAME_MAX} characters.`;

  const priceText = values.price.trim();
  if (!priceText) errors.price = "Enter a price.";
  else if (!/^\d+(\.\d{1,2})?$/.test(priceText)) errors.price = "Use a number like 9.99.";
  else if (Number(priceText) <= 0) errors.price = "Price must be more than zero.";
  else if (Number(priceText) > PRICE_MAX) errors.price = "That looks too high. Check the amount.";

  if (!(CURRENCIES as readonly string[]).includes(values.currency)) errors.currency = "Choose a currency.";
  if (values.billingCycle !== "monthly" && values.billingCycle !== "yearly") {
    errors.billingCycle = "Choose how often it bills.";
  }

  if (!values.renewalDate) errors.renewalDate = "Pick the next renewal date.";
  else if (!isValidISODate(values.renewalDate)) errors.renewalDate = "That date isn't valid.";

  if (!(CATEGORIES as readonly string[]).includes(values.category)) errors.category = "Choose a category.";
  if (values.notes.length > NOTES_MAX) errors.notes = `Notes can be up to ${NOTES_MAX} characters.`;

  return errors;
}

export function toSubscriptionInput(values: SubscriptionFormValues): SubscriptionInput {
  const notes = values.notes.trim();
  return {
    name: values.name.trim(),
    price: Math.round(Number(values.price) * 100) / 100,
    currency: values.currency as SubscriptionInput["currency"],
    billingCycle: values.billingCycle as SubscriptionInput["billingCycle"],
    renewalDate: values.renewalDate,
    category: values.category as SubscriptionInput["category"],
    notes: notes || undefined,
  };
}
