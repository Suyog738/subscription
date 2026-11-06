import type { DetectedSubscription, Subscription, Transaction } from "../types";
import { addDays, addMonthsClamped, daysBetween, parseISODate, startOfToday, toISODate } from "./date";
import { formatLongDate, formatMoney } from "./format";

// Finds subscriptions in a transaction history using only what a bank can see:
// merchant, amount and date. It never guesses whether a service is used.
// In production this runs on the server; it's a pure function so it can move there as is.

const UNNAMED_KEYS = new Set(["app-store", "google-play"]);
const TRIAL_ASSUMED_DAYS = 7;
const TRIAL_LOOKBACK_DAYS = 14;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function detectSubscriptions(transactions: Transaction[], today = startOfToday()): DetectedSubscription[] {
  const groups = new Map<string, Transaction[]>();
  for (const txn of transactions) {
    if (txn.kind !== "charge" && txn.kind !== "card-check") continue;
    groups.set(txn.merchantKey, [...(groups.get(txn.merchantKey) ?? []), txn]);
  }

  const found: DetectedSubscription[] = [];
  for (const [merchantKey, group] of groups) {
    const charges = group.filter((t) => t.kind === "charge").sort((a, b) => a.date.localeCompare(b.date));
    const checks = group.filter((t) => t.kind === "card-check").sort((a, b) => a.date.localeCompare(b.date));
    const sample = group[0];

    if (charges.length >= 2) {
      const gaps = charges.slice(1).map((t, i) => daysBetween(parseISODate(charges[i].date), parseISODate(t.date)));
      const gap = median(gaps);
      const cycle = gap >= 25 && gap <= 35 ? "monthly" : gap >= 350 && gap <= 380 ? "yearly" : null;
      if (!cycle) continue;

      const last = charges[charges.length - 1];
      let priceChange: DetectedSubscription["priceChange"];
      for (let i = charges.length - 1; i > 0; i -= 1) {
        if (Math.abs(charges[i].amount - charges[i - 1].amount) > 0.005) {
          priceChange = { from: charges[i - 1].amount, to: charges[i].amount, date: charges[i].date };
          break;
        }
      }

      const unnamed = UNNAMED_KEYS.has(merchantKey);
      const money = formatMoney(last.amount, last.currency);
      found.push({
        merchantKey,
        merchant: sample.merchant,
        kind: unnamed ? "unnamed" : "recurring",
        amount: last.amount,
        currency: last.currency,
        cycle,
        channel: last.channel,
        lastChargeDate: last.date,
        nextExpectedDate: toISODate(addMonthsClamped(parseISODate(last.date), cycle === "monthly" ? 1 : 12)),
        charges,
        categoryGuess: unnamed ? "Other" : guessCategory(sample),
        priceChange,
        reason: unnamed
          ? `${charges.length} payments of ${money} through ${sample.merchant}, about a month apart. The statement only says "${sample.descriptor}", so the app's name isn't visible to your bank.`
          : `${charges.length} payments to ${sample.merchant}, about ${cycle === "monthly" ? "a month" : "a year"} apart. The last one was ${money} on ${formatLongDate(last.date)}.`,
      });
      continue;
    }

    const check = checks[checks.length - 1];
    if (check && charges.length === 0 && daysBetween(parseISODate(check.date), today) <= TRIAL_LOOKBACK_DAYS) {
      const firstCharge = toISODate(addDays(parseISODate(check.date), TRIAL_ASSUMED_DAYS));
      found.push({
        merchantKey,
        merchant: sample.merchant,
        kind: "trial",
        amount: 0,
        currency: check.currency,
        cycle: "monthly",
        channel: check.channel,
        lastChargeDate: check.date,
        nextExpectedDate: firstCharge,
        charges: [check],
        categoryGuess: guessCategory(sample),
        reason: `A ${formatMoney(0, check.currency)} card check from ${sample.merchant} on ${formatLongDate(check.date)}. That's usually how a free trial starts. If it's a ${TRIAL_ASSUMED_DAYS}-day trial, the first charge could come around ${formatLongDate(firstCharge)}.`,
      });
    }
  }

  return found.sort((a, b) => a.nextExpectedDate.localeCompare(b.nextExpectedDate));
}

function guessCategory(txn: Transaction): DetectedSubscription["categoryGuess"] {
  const text = `${txn.merchant} ${txn.descriptor}`.toLowerCase();
  if (/spotify|netflix|disney|prime|youtube|hbo/.test(text)) return "Entertainment";
  if (/audible|storytel|times|news|kindle/.test(text)) return "News & reading";
  if (/adobe|canva|figma/.test(text)) return "Design";
  if (/github|vercel|digitalocean|jetbrains/.test(text)) return "Development";
  if (/icloud|google one|dropbox/.test(text)) return "Cloud & storage";
  if (/headspace|strava|calm|gym/.test(text)) return "Health";
  return "Other";
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function findDetectionFor(sub: Subscription, detected: DetectedSubscription[]): DetectedSubscription | undefined {
  // A known merchant link is authoritative; name matching is only a fallback for
  // subscriptions added by hand, and it never claims an already-linked merchant.
  if (sub.merchantKey) return detected.find((d) => d.merchantKey === sub.merchantKey);
  const name = normalize(sub.name);
  return detected.find((d) => d.kind !== "unnamed" && name.includes(normalize(d.merchant).split(" ")[0]));
}

export function splitDetections(detected: DetectedSubscription[], subs: Subscription[], dismissed: string[]) {
  const tracked = new Map<string, DetectedSubscription>();
  for (const sub of subs) {
    const match = findDetectionFor(sub, detected);
    if (match) tracked.set(sub.id, match);
  }
  const trackedKeys = new Set([...tracked.values()].map((d) => d.merchantKey));
  const open = detected.filter((d) => !trackedKeys.has(d.merchantKey) && !dismissed.includes(d.merchantKey));
  return {
    tracked,
    suggestions: open.filter((d) => d.kind === "recurring"),
    trials: open.filter((d) => d.kind === "trial"),
    unnamed: open.filter((d) => d.kind === "unnamed"),
  };
}

export function chargesFor(sub: Subscription, transactions: Transaction[], detected?: DetectedSubscription) {
  const key = sub.merchantKey ?? detected?.merchantKey;
  if (!key) return [];
  return transactions.filter((t) => t.merchantKey === key && t.kind === "charge").sort((a, b) => a.date.localeCompare(b.date));
}
