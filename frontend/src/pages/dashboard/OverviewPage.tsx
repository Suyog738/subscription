import { ArrowRight, CalendarClock, Layers, Plus, Repeat, Wallet } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { CategoryBreakdown } from "../../components/charts/CategoryBreakdown";
import { ChartLegend, SpendingForecastChart } from "../../components/charts/SpendingForecastChart";
import { EmptyState, Panel } from "../../components/dashboard/EmptyState";
import { InsightsPanel } from "../../components/dashboard/InsightsPanel";
import { RenewalBadge } from "../../components/dashboard/RenewalBadge";
import { StatStrip } from "../../components/dashboard/StatStrip";
import { Button } from "../../components/ui/Button";
import { ServiceMark } from "../../components/ui/ServiceMark";
import { useCurrentUser } from "../../contexts/AuthContext";
import { useEditor } from "../../contexts/EditorContext";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import { useInsights } from "../../hooks/useInsights";
import { monthlyEquivalentIn } from "../../utils/billing";
import { startOfToday } from "../../utils/date";
import { cycleSuffix, formatMoney, formatShortDate, formatWeekdayDate, greeting } from "../../utils/format";

export function OverviewPage() {
  const user = useCurrentUser();
  const { openCreate } = useEditor();
  const navigate = useNavigate();
  const {
    summary,
    currency,
    reminderDays,
    upcoming,
    withinReminder,
    withinReminderTotal,
    next30,
    next30Total,
    categories,
    forecast,
    trials,
    leadFor,
  } = useDashboardStats();
  const insights = useInsights();
  const firstName = user.name.split(" ")[0];
  const yearlyCount = upcoming.filter((u) => u.subscription.billingCycle === "yearly").length;

  const header = (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end">
      <div>
        <p className="text-[13px] font-semibold text-paper-faint">{formatWeekdayDate(startOfToday())}</p>
        <h2 className="mt-1 text-[28px] font-bold tracking-[-0.02em] sm:text-[34px]">
          {greeting()}, <span className="text-fern">{firstName}</span>
        </h2>
        {summary.count > 0 && (
          <p className="mt-1 text-[14.5px] text-paper-muted">
            {withinReminder.length === 0
              ? `Nothing renews in the next ${reminderDays} days. Enjoy the quiet.`
              : `${withinReminder.length} ${withinReminder.length === 1 ? "renewal is" : "renewals are"} coming up in the next ${reminderDays} days.`}
          </p>
        )}
      </div>
    </div>
  );

  if (summary.count === 0) {
    return (
      <>
        {header}
        <InsightsPanel insights={insights} />
        <EmptyState
          title="No subscriptions yet"
          body="Add the first thing you pay for regularly. Your totals, charts and upcoming renewals will show up here."
          action={
            <Button onClick={() => openCreate()}>
              <Plus className="size-4" /> Add subscription
            </Button>
          }
        />
      </>
    );
  }

  const peak = forecast.reduce((best, month) => (month.total > best.total ? month : best), forecast[0]);
  const yearTotal = forecast.reduce((sum, month) => sum + month.total, 0);

  return (
    <>
      {header}

      <InsightsPanel insights={insights} />

      <StatStrip
        stats={[
          { label: "Monthly spending", value: formatMoney(summary.monthly, currency), note: "Yearly plans spread over 12 months", icon: Wallet, tone: 1 },
          {
            label: "Estimated per year",
            value: formatMoney(summary.yearly, currency, true),
            note: summary.mixedCurrencies ? `Converted to ${currency} at fixed rates` : "At current prices",
            icon: Repeat,
            tone: 2,
          },
          { label: "Active subscriptions", value: summary.count, note: trials.length ? `${trials.length} on a free trial · ${yearlyCount} yearly` : `${yearlyCount} billed yearly`, icon: Layers, tone: 4 },
          {
            label: `Next ${reminderDays} days`,
            value: formatMoney(withinReminderTotal, currency),
            note: `${withinReminder.length} ${withinReminder.length === 1 ? "renewal" : "renewals"} due`,
            icon: CalendarClock,
            tone: 3,
          },
        ]}
      />

      <div className="mt-5 grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="card rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-[15px] font-bold tracking-[-0.01em]">Next 12 months</h2>
              <p className="mt-0.5 text-[13px] text-paper-muted">
                What you'll actually be charged each month.{" "}
                {peak.yearly > 0 && (
                  <>
                    Busiest: <span className="font-semibold text-paper">{peak.label}</span> ({formatMoney(peak.total, currency)}).
                  </>
                )}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="font-display text-[22px] font-bold tabular-nums">{formatMoney(yearTotal, currency)}</p>
              <p className="text-[12px] text-paper-faint">total over 12 months</p>
            </div>
          </div>
          <div className="mt-6">
            <SpendingForecastChart data={forecast} currency={currency} height={240} />
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
            <ChartLegend
              items={[
                { label: "Monthly plans", color: "var(--chart-1)" },
                { label: "Yearly renewals", color: "var(--chart-2)" },
              ]}
            />
            <p className="hidden text-[12px] text-paper-faint sm:block">Hover a month for details</p>
          </div>
        </section>

        <section className="card rounded-2xl p-4 sm:p-6">
          <h2 className="text-[15px] font-bold tracking-[-0.01em]">Where it goes</h2>
          <p className="mt-0.5 mb-5 text-[13px] text-paper-muted">Monthly cost by category</p>
          <CategoryBreakdown categories={categories} currency={currency} />
        </section>
      </div>

      <div className="mt-5 grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Panel
          title="Subscriptions"
          aside={
            <Link to="/app/subscriptions" className="flex items-center gap-1 text-[13px] font-semibold text-fern hover:text-fern-strong">
              View all <ArrowRight className="size-3.5" />
            </Link>
          }
        >
          <div className="hidden grid-cols-[minmax(0,1fr)_110px_110px_110px] gap-4 border-b border-line bg-ink-850/50 px-5 py-2 text-[12px] font-semibold text-paper-faint sm:grid">
            <span>Name</span>
            <span>Next renewal</span>
            <span className="text-right">Price</span>
            <span className="text-right">Per month</span>
          </div>
          <ul className="divide-y divide-line">
            {upcoming.slice(0, 6).map(({ subscription: sub, nextDate, daysUntil }) => (
              <li key={sub.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/app/subscriptions/${sub.id}`)}
                  className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-ink-850 sm:grid-cols-[minmax(0,1fr)_110px_110px_110px] sm:px-5"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <ServiceMark name={sub.name} />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5"><span className="truncate text-[14px] font-semibold">{sub.name}</span>{sub.status === "trial" && <span className="rounded-full bg-amber-deep px-1.5 text-[10.5px] font-bold text-amber">Trial</span>}</span>
                      <span className="block text-[12px] text-paper-faint sm:hidden">
                        <RenewalBadge daysUntil={daysUntil} reminderDays={leadFor(sub)} />
                      </span>
                      <span className="hidden text-[12px] text-paper-faint sm:block">{sub.category}</span>
                    </span>
                  </span>
                  <span className="hidden flex-col sm:flex">
                    <span className="text-[13px]">{formatShortDate(nextDate)}</span>
                    <RenewalBadge daysUntil={daysUntil} reminderDays={leadFor(sub)} />
                  </span>
                  <span className="text-right text-[13.5px] font-semibold tabular-nums">
                    {formatMoney(sub.price, sub.currency)}
                    <span className="font-normal text-paper-faint">{cycleSuffix(sub.billingCycle)}</span>
                  </span>
                  <span className="hidden text-right text-[13.5px] text-paper-muted tabular-nums sm:block">
                    {formatMoney(monthlyEquivalentIn(sub, currency), currency)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {upcoming.length > 6 && (
            <Link
              to="/app/subscriptions"
              className="block border-t border-line px-5 py-3 text-center text-[13px] font-medium text-paper-muted hover:bg-ink-850 hover:text-paper"
            >
              {upcoming.length - 6} more
            </Link>
          )}
        </Panel>

        <Panel title="Next 30 days" aside={<span className="text-[13px] font-bold tabular-nums">{formatMoney(next30Total, currency)}</span>}>
          {next30.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-paper-muted">Nothing renews in the next 30 days.</p>
          ) : (
            <ul className="space-y-1 p-2">
              {next30.map(({ subscription: sub, nextDate, daysUntil }) => {
                const inWindow = daysUntil <= leadFor(sub);
                return (
                  <li key={sub.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/app/subscriptions/${sub.id}`)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-ink-850 ${
                        inWindow ? "bg-amber-deep/50" : ""
                      }`}
                    >
                      <span className="w-11 shrink-0 text-center leading-tight">
                        <span className="block text-[10.5px] font-bold text-paper-faint uppercase">{formatShortDate(nextDate).split(" ")[0]}</span>
                        <span className="block font-display text-[18px] font-bold">{formatShortDate(nextDate).split(" ")[1]}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-semibold">{sub.name}</span>
                        <RenewalBadge daysUntil={daysUntil} reminderDays={leadFor(sub)} />
                      </span>
                      <span className="text-[13px] font-semibold tabular-nums">{formatMoney(sub.price, sub.currency)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
