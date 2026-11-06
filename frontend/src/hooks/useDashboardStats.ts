import { useCallback, useMemo } from "react";
import { useSubscriptions } from "../contexts/SubscriptionsContext";
import type { Subscription } from "../types";
import {
  forecastCharges,
  getUpcomingRenewals,
  isLive,
  leadDaysFor,
  savingsFrom,
  spendingByCategory,
  summarizeSpending,
  sumRenewals,
} from "../utils/billing";

export function useDashboardStats() {
  const { subscriptions, settings } = useSubscriptions();
  const leadFor = useCallback((sub: Subscription) => leadDaysFor(sub, settings), [settings]);

  const stats = useMemo(() => {
    const currency = settings.displayCurrency;
    const live = subscriptions.filter(isLive);
    const stopped = subscriptions.filter((sub) => !isLive(sub));
    const upcoming = getUpcomingRenewals(live);
    const withinReminder = upcoming.filter((item) => item.daysUntil <= leadDaysFor(item.subscription, settings));
    const next30 = upcoming.filter((item) => item.daysUntil <= 30);
    return {
      currency,
      reminderDays: settings.reminderDays,
      settings,
      live,
      stopped,
      trials: live.filter((sub) => sub.status === "trial"),
      summary: summarizeSpending(live, currency),
      upcoming,
      withinReminder,
      withinReminderTotal: sumRenewals(withinReminder, currency),
      next30,
      next30Total: sumRenewals(next30, currency),
      categories: spendingByCategory(live, currency),
      forecast: forecastCharges(live, currency),
      savings: savingsFrom(subscriptions, currency),
    };
  }, [subscriptions, settings]);

  return { ...stats, leadFor };
}
