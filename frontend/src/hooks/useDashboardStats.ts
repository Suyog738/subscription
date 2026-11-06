import { useMemo } from "react";
import { useSubscriptions } from "../contexts/SubscriptionsContext";
import { forecastCharges, getUpcomingRenewals, spendingByCategory, summarizeSpending, sumRenewals } from "../utils/billing";

export function useDashboardStats() {
  const { subscriptions, settings } = useSubscriptions();

  return useMemo(() => {
    const currency = settings.displayCurrency;
    const upcoming = getUpcomingRenewals(subscriptions);
    const withinReminder = upcoming.filter((item) => item.daysUntil <= settings.reminderDays);
    const next30 = upcoming.filter((item) => item.daysUntil <= 30);
    return {
      currency,
      reminderDays: settings.reminderDays,
      summary: summarizeSpending(subscriptions, currency),
      upcoming,
      withinReminder,
      withinReminderTotal: sumRenewals(withinReminder, currency),
      next30,
      next30Total: sumRenewals(next30, currency),
      categories: spendingByCategory(subscriptions, currency),
      forecast: forecastCharges(subscriptions, currency),
    };
  }, [subscriptions, settings]);
}
