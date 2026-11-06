import type { BankConnection, DetectedSubscription, NotificationEvent, Subscription, UserSettings } from "../types";
import { getUpcomingRenewals, isLive, leadDaysFor } from "./billing";
import { CHANNEL_LABELS } from "./channels";
import { convert } from "./currency";
import { addDays, daysBetween, parseISODate, startOfToday, toISODate } from "./date";
import { formatLongDate, formatMoney, formatRelativeDays } from "./format";

// Decides which reminders are due right now, given the user's data and preferences.
// Pure, so the same rules can run in a backend scheduler. Each candidate has a stable
// key, so delivering it twice is easy to prevent.

export interface ReminderCandidate {
  key: string;
  event: NotificationEvent;
  title: string;
  body: string;
  link: string;
  email: {
    subject: string;
    heading: string;
    paragraphs: string[];
    details?: [string, string][];
    cta: string;
  };
}

interface Input {
  subscriptions: Subscription[];
  settings: UserSettings;
  connection: BankConnection | null;
  tracked: Map<string, DetectedSubscription>;
  detectedTrials: DetectedSubscription[];
  today?: Date;
}

const PRICE_RISE_WINDOW_DAYS = 120;

export function dueReminders({ subscriptions, settings, connection, tracked, detectedTrials, today = startOfToday() }: Input): ReminderCandidate[] {
  const events = settings.notifications.events;
  const live = subscriptions.filter(isLive);
  const upcoming = getUpcomingRenewals(live, Number.POSITIVE_INFINITY, today);
  const out: ReminderCandidate[] = [];

  for (const item of upcoming) {
    const sub = item.subscription;
    const lead = leadDaysFor(sub, settings);
    if (item.daysUntil > lead) continue;
    const money = formatMoney(sub.price, sub.currency);
    const when = formatRelativeDays(item.daysUntil).toLowerCase();
    const deadline = formatLongDate(toISODate(addDays(parseISODate(item.nextDate), -1)));
    const details: [string, string][] = [
      ["Amount", money],
      ["Charge date", formatLongDate(item.nextDate)],
      ["Paid through", CHANNEL_LABELS[sub.channel]],
    ];

    if (sub.status === "trial") {
      if (!events.trials) continue;
      out.push({
        key: `trial:${sub.id}:${item.nextDate}`,
        event: "trials",
        title: `${sub.name} trial ends ${when}`,
        body: `It turns into a ${money} charge on ${formatLongDate(item.nextDate)}.`,
        link: `/app/subscriptions/${sub.id}`,
        email: {
          subject: `Your ${sub.name} free trial ends ${when}`,
          heading: `Your ${sub.name} trial turns paid ${when}`,
          paragraphs: [
            `Your free trial ends on ${formatLongDate(item.nextDate)}, and ${money} will be charged unless you stop it before ${deadline}.`,
            "If you want to keep it, there's nothing to do.",
          ],
          details,
          cta: "Review trial",
        },
      });
    } else {
      if (!events.renewals) continue;
      out.push({
        key: `renewal:${sub.id}:${item.nextDate}`,
        event: "renewals",
        title: `${sub.name} renews ${when}`,
        body: `${money} on ${formatLongDate(item.nextDate)}.`,
        link: `/app/subscriptions/${sub.id}`,
        email: {
          subject: `${sub.name} renews ${when} (${money})`,
          heading: `${sub.name} renews ${when}`,
          paragraphs: [
            `Heads-up: ${money} for ${sub.name} will be charged on ${formatLongDate(item.nextDate)}.`,
            `Still using it? If not, stop it before ${deadline} and you won't be charged.`,
          ],
          details,
          cta: "Keep or stop it",
        },
      });
    }
  }

  if (events.trials) {
    for (const trial of detectedTrials) {
      out.push({
        key: `detected-trial:${trial.merchantKey}:${trial.lastChargeDate}`,
        event: "trials",
        title: `A free trial may have started with ${trial.merchant}`,
        body: `We saw a ${formatMoney(0, trial.currency)} card check on ${formatLongDate(trial.lastChargeDate)}.`,
        link: "/app/bank",
        email: {
          subject: `Did you start a free trial with ${trial.merchant}?`,
          heading: `Looks like a free trial started with ${trial.merchant}`,
          paragraphs: [
            `Your bank shows a ${formatMoney(0, trial.currency)} card check from ${trial.merchant} on ${formatLongDate(trial.lastChargeDate)}. That's usually how a free trial starts.`,
            `If it's a 7-day trial, the first charge could come around ${formatLongDate(trial.nextExpectedDate)}. Track it and we'll remind you before then.`,
          ],
          cta: "Track this trial",
        },
      });
    }
  }

  if (events.priceRises) {
    for (const sub of live) {
      const detection = tracked.get(sub.id);
      const change = detection?.priceChange;
      if (!detection || !change || change.to <= change.from) continue;
      if (daysBetween(parseISODate(change.date), today) > PRICE_RISE_WINDOW_DAYS) continue;
      const from = formatMoney(change.from, detection.currency);
      const to = formatMoney(change.to, detection.currency);
      const yearly = formatMoney((change.to - change.from) * (detection.cycle === "monthly" ? 12 : 1), detection.currency);
      out.push({
        key: `price:${sub.id}:${change.date}`,
        event: "priceRises",
        title: `${sub.name} went up to ${to}`,
        body: `From ${from}. That's ${yearly} more a year.`,
        link: `/app/subscriptions/${sub.id}`,
        email: {
          subject: `${sub.name} raised its price to ${to}`,
          heading: `${sub.name} costs more now`,
          paragraphs: [`Your last charge was ${to}, up from ${from}. Over a year that adds ${yearly}.`],
          details: [
            ["Old price", from],
            ["New price", to],
            ["First charged", formatLongDate(change.date)],
          ],
          cta: "See payment history",
        },
      });
    }
  }

  if (events.balance && connection) {
    const week = upcoming.filter((item) => item.daysUntil <= 7);
    const due = week.reduce((sum, item) => sum + convert(item.subscription.price, item.subscription.currency, connection.currency), 0);
    if (week.length > 0 && due > connection.balance) {
      const dueText = formatMoney(due, connection.currency);
      const balance = formatMoney(connection.balance, connection.currency);
      out.push({
        key: `balance:${toISODate(today)}`,
        event: "balance",
        title: "Your balance may not cover this week's renewals",
        body: `${dueText} is due in the next 7 days. Your balance is ${balance}.`,
        link: "/app/renewals",
        email: {
          subject: `Heads-up: ${dueText} in renewals this week`,
          heading: "Your balance may not cover this week's renewals",
          paragraphs: [
            `${week.length} subscriptions renew in the next 7 days, adding up to ${dueText}. Your ${connection.bankName} balance is ${balance}.`,
            "Top up your account or stop anything you don't need, so a payment doesn't fail.",
          ],
          details: week.map((item) => [item.subscription.name, formatMoney(item.subscription.price, item.subscription.currency)]),
          cta: "See this week's renewals",
        },
      });
    }
  }

  if (events.stopChecks) {
    for (const sub of subscriptions) {
      const stop = sub.stop;
      if (sub.status !== "stopped" || !stop || stop.check === "pending") continue;
      const charged = stop.check === "charged";
      out.push({
        key: `stop:${sub.id}:${stop.stoppedAt}:${stop.check}`,
        event: "stopChecks",
        title: charged ? `${sub.name} charged you after you stopped it` : `${sub.name} stopped for good`,
        body: charged
          ? `Contact them${stop.reference ? ` with reference ${stop.reference}` : ""}, or dispute it with your bank.`
          : "No charge arrived after you cancelled.",
        link: `/app/subscriptions/${sub.id}`,
        email: {
          subject: charged ? `${sub.name} charged you again` : `Confirmed: ${sub.name} has stopped`,
          heading: charged ? `${sub.name} charged you after you stopped it` : `${sub.name} has stopped`,
          paragraphs: charged
            ? [
                `You stopped ${sub.name} on ${formatLongDate(stop.stoppedAt)}, but a charge still came in.`,
                `Contact ${sub.name}${stop.reference ? ` and quote your reference ${stop.reference}` : ""}. If they won't refund it, you can dispute the charge with your bank.`,
              ]
            : [`We checked your payments after the date ${sub.name} would have renewed. No charge arrived, so it's stopped for good.`],
          cta: "View details",
        },
      });
    }
  }

  return out;
}
