import {
  AlertTriangle,
  BadgeCheck,
  CircleHelp,
  Hourglass,
  Landmark,
  Search,
  Sparkles,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { useBank } from "../contexts/BankContext";
import { useEditor } from "../contexts/EditorContext";
import { CHANNEL_LABELS } from "../utils/channels";
import { convert } from "../utils/currency";
import { daysBetween, parseISODate, startOfToday } from "../utils/date";
import { formatLongDate, formatMoney, formatRelativeDays } from "../utils/format";
import { useDashboardStats } from "./useDashboardStats";

export type InsightTone = "danger" | "warning" | "info" | "good";

export interface Insight {
  id: string;
  tone: InsightTone;
  icon: LucideIcon;
  title: string;
  body: string;
  action?: { label: string; run: () => void };
}

const PRICE_RISE_WINDOW_DAYS = 120;

export function useInsights(): Insight[] {
  const navigate = useNavigate();
  const { openCreate, openEdit, requestStop } = useEditor();
  const { connection, tracked, suggestions, trials: detectedTrials, unnamed } = useBank();
  const { upcoming, stopped, live, settings, leadFor } = useDashboardStats();

  return useMemo(() => {
    const today = startOfToday();
    const list: Insight[] = [];
    const view = (id: string) => () => navigate(`/app/subscriptions/${id}`);

    if (connection) {
      const week = upcoming.filter((item) => item.daysUntil <= 7);
      const due = week.reduce((sum, item) => sum + convert(item.subscription.price, item.subscription.currency, connection.currency), 0);
      if (week.length > 0 && due > connection.balance) {
        list.push({
          id: "balance",
          tone: "danger",
          icon: Wallet,
          title: "Your balance may not cover this week's renewals",
          body: `${week.length} renewals add up to ${formatMoney(due, connection.currency)} in the next 7 days. Your ${connection.bankName} balance is ${formatMoney(connection.balance, connection.currency)}.`,
          action: { label: "See renewals", run: () => navigate("/app/renewals") },
        });
      }
    }

    for (const sub of stopped) {
      if (sub.stop?.check === "charged") {
        list.push({
          id: `charged-${sub.id}`,
          tone: "danger",
          icon: AlertTriangle,
          title: `${sub.name} charged you after you stopped it`,
          body: sub.stop.reference
            ? `Contact them and quote your reference ${sub.stop.reference}. If they won't refund it, dispute the charge with your bank.`
            : "Contact them for a refund. If they won't help, you can dispute the charge with your bank.",
          action: { label: "View", run: view(sub.id) },
        });
      }
    }

    for (const item of upcoming) {
      const sub = item.subscription;
      if (sub.status === "trial" && item.daysUntil <= leadFor(sub)) {
        list.push({
          id: `trial-${sub.id}`,
          tone: "warning",
          icon: Hourglass,
          title: `Your ${sub.name} trial turns paid ${formatRelativeDays(item.daysUntil).toLowerCase()}`,
          body: `${formatMoney(sub.price, sub.currency)} will be charged on ${formatLongDate(item.nextDate)} unless you stop it first.`,
          action: { label: "Stop it", run: () => requestStop(sub) },
        });
      }
    }

    for (const trial of detectedTrials) {
      list.push({
        id: `detected-trial-${trial.merchantKey}`,
        tone: "warning",
        icon: Sparkles,
        title: `Looks like a free trial started with ${trial.merchant}`,
        body: `We saw a ${formatMoney(0, trial.currency)} card check on ${formatLongDate(trial.lastChargeDate)}. Track it and we'll warn you before the first charge.`,
        action: {
          label: "Track trial",
          run: () =>
            openCreate({
              name: trial.merchant,
              status: "trial",
              renewalDate: trial.nextExpectedDate,
              currency: trial.currency,
              channel: trial.channel,
              category: trial.categoryGuess,
              merchantKey: trial.merchantKey,
              source: "bank",
            }),
        },
      });
    }

    for (const sub of live) {
      const detection = tracked.get(sub.id);
      const change = detection?.priceChange;
      if (!change || change.to <= change.from) continue;
      if (daysBetween(parseISODate(change.date), today) > PRICE_RISE_WINDOW_DAYS) continue;
      const yearly = (change.to - change.from) * (detection.cycle === "monthly" ? 12 : 1);
      const outdated = Math.abs(sub.price - change.to) > 0.005;
      list.push({
        id: `rise-${sub.id}`,
        tone: "info",
        icon: TrendingUp,
        title: `${sub.name} went up to ${formatMoney(change.to, detection.currency)}`,
        body: `It was ${formatMoney(change.from, detection.currency)} until ${formatLongDate(change.date)}. That's ${formatMoney(yearly, detection.currency)} more a year.${outdated ? " Your list still shows the old price." : ""}`,
        action: outdated
          ? { label: "Update price", run: () => openEdit(sub, { price: change.to }) }
          : { label: "View", run: view(sub.id) },
      });
    }

    for (const item of unnamed) {
      list.push({
        id: `unnamed-${item.merchantKey}`,
        tone: "info",
        icon: CircleHelp,
        title: `A ${formatMoney(item.amount, item.currency)} ${CHANNEL_LABELS[item.channel]} payment needs a name`,
        body: `Your statement only says "${item.charges[0]?.descriptor}". Check your phone's subscription list to see which app it is.`,
        action: {
          label: "Name it",
          run: () =>
            openCreate({
              price: item.amount,
              currency: item.currency,
              billingCycle: item.cycle,
              renewalDate: item.nextExpectedDate,
              channel: item.channel,
              merchantKey: item.merchantKey,
              source: "bank",
            }),
        },
      });
    }

    if (suggestions.length > 0) {
      list.push({
        id: "suggestions",
        tone: "info",
        icon: Search,
        title: `We found ${suggestions.length} ${suggestions.length === 1 ? "subscription" : "subscriptions"} you're not tracking`,
        body: `${suggestions.map((s) => s.merchant).join(", ")}. They repeat in your payments but aren't on your list yet.`,
        action: { label: "Review", run: () => navigate("/app/bank") },
      });
    }

    for (const sub of stopped) {
      if (sub.stop?.check === "pending") {
        list.push({
          id: `pending-${sub.id}`,
          tone: "info",
          icon: Hourglass,
          title: `Checking that ${sub.name} really stopped`,
          body: `We'll look for a charge on ${formatLongDate(sub.stop.checkOn)}.`,
          action: { label: "View", run: view(sub.id) },
        });
      } else if (sub.stop?.check === "confirmed" && sub.stop.checkedAt && daysBetween(parseISODate(sub.stop.checkedAt), today) <= 30) {
        list.push({
          id: `confirmed-${sub.id}`,
          tone: "good",
          icon: BadgeCheck,
          title: `${sub.name} stopped for good`,
          body: "No charge arrived after you cancelled. It's no longer in your totals.",
          action: { label: "View", run: view(sub.id) },
        });
      }
    }

    if (!connection) {
      list.push({
        id: "connect",
        tone: "info",
        icon: Landmark,
        title: "Connect your bank to find what you've missed",
        body: "Mohar reads your payments, read-only, to spot subscriptions, free trials, app store charges and price rises.",
        action: { label: "Connect", run: () => navigate("/app/bank") },
      });
    }

    return list;
  }, [connection, upcoming, stopped, live, tracked, suggestions, detectedTrials, unnamed, leadFor, navigate, openCreate, openEdit, requestStop, settings]);
}
