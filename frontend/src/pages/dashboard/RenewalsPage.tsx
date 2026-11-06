import { BellRing, Clock } from "lucide-react";
import { Link } from "react-router";
import { EmptyState } from "../../components/dashboard/EmptyState";
import { RenewalBadge } from "../../components/dashboard/RenewalBadge";
import { ServiceMark } from "../../components/ui/ServiceMark";
import { useNavigate } from "react-router";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import type { UpcomingRenewal } from "../../types";
import { sumRenewals } from "../../utils/billing";
import { addDays, parseISODate, toISODate } from "../../utils/date";
import { formatCycle, formatDateParts, formatMoney, formatShortDate } from "../../utils/format";

export function RenewalsPage() {
  const { upcoming, reminderDays, currency, leadFor, settings } = useDashboardStats();
  const navigate = useNavigate();

  if (upcoming.length === 0) {
    return <EmptyState title="Nothing to show yet" body="Once you add subscriptions, their renewal dates will be listed here in order." />;
  }

  const groups: { label: string; items: UpcomingRenewal[] }[] = [
    { label: `Next ${reminderDays} days`, items: upcoming.filter((i) => i.daysUntil <= reminderDays) },
    { label: "Within 30 days", items: upcoming.filter((i) => i.daysUntil > reminderDays && i.daysUntil <= 30) },
    { label: "Within 3 months", items: upcoming.filter((i) => i.daysUntil > 30 && i.daysUntil <= 90) },
    { label: "Later", items: upcoming.filter((i) => i.daysUntil > 90) },
  ].filter((group) => group.items.length > 0);

  return (
    <>
      <div className="flex flex-col gap-3 rounded-2xl border border-amber/25 bg-amber-deep/60 px-4 py-3.5 sm:flex-row sm:items-center sm:px-5">
        <BellRing className="size-4 shrink-0 text-amber" />
        <p className="flex-1 text-[13.5px] text-paper-muted">
          In-app reminders come {reminderDays} days before monthly renewals, {settings.yearlyReminderDays} before yearly ones and{" "}
          {settings.trialReminderDays} before a free trial turns paid. Change channels (in-app, browser, email) in Settings.
        </p>
        <Link to="/app/settings" className="text-[13px] font-medium text-paper hover:text-fern">
          Change timing
        </Link>
      </div>

      <div className="mt-8 space-y-10">
        {groups.map((group) => (
          <section key={group.label}>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-semibold tabular-nums text-[12px] tracking-wide text-paper-faint uppercase">{group.label}</h2>
              <p className="font-semibold tabular-nums text-[12.5px] text-paper-muted">{formatMoney(sumRenewals(group.items, currency), currency)}</p>
            </div>
            <ul className="card divide-y divide-line overflow-hidden rounded-2xl">
              {group.items.map((item) => {
                const { subscription: sub, nextDate, daysUntil } = item;
                const parts = formatDateParts(nextDate);
                const lead = leadFor(sub);
                const reminderDate = toISODate(addDays(parseISODate(nextDate), -lead));
                const reminderActive = daysUntil <= lead;
                return (
                  <li key={sub.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/app/subscriptions/${sub.id}`)}
                      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-ink-850 sm:gap-5 sm:px-5 ${
                        reminderActive ? "bg-amber-deep/40" : ""
                      }`}
                    >
                      <div className="w-10 shrink-0 text-center leading-none">
                        <p className="font-semibold tabular-nums text-[10.5px] text-paper-faint">{parts.month}</p>
                        <p className="mt-1 font-semibold tabular-nums text-[19px]">{parts.day}</p>
                      </div>
                      <ServiceMark name={sub.name} />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 truncate text-[14.5px] font-semibold">{sub.name}{sub.status === "trial" && <span className="rounded-full bg-amber-deep px-1.5 text-[10.5px] font-bold text-amber">Trial ends</span>}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-paper-faint">
                          {reminderActive ? (
                            <>
                              <BellRing className="size-3 text-amber" /> Reminder active
                            </>
                          ) : (
                            <>
                              <Clock className="size-3" /> Reminder on {formatShortDate(reminderDate)}
                            </>
                          )}
                          <span className="hidden sm:inline">· {formatCycle(sub.billingCycle)}</span>
                        </p>
                      </div>
                      <span className="hidden sm:block">
                        <RenewalBadge daysUntil={daysUntil} reminderDays={lead} variant="pill" />
                      </span>
                      <span className="w-24 shrink-0 text-right font-semibold tabular-nums text-[13.5px]">
                        {formatMoney(sub.price, sub.currency)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
