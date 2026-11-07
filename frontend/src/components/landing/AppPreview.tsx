import { Bell, CalendarClock, Layers, LayoutGrid, Plus, Search, Settings } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { buildSeedSubscriptions } from "../../data/seedSubscriptions";
import { forecastCharges, getUpcomingRenewals, spendingByCategory, summarizeSpending, sumRenewals } from "../../utils/billing";
import { formatMoney } from "../../utils/format";
import { LogoMark } from "../brand/Logo";
import { CategoryBreakdown } from "../charts/CategoryBreakdown";
import { ChartLegend, SpendingForecastChart } from "../charts/SpendingForecastChart";
import { RenewalBadge } from "../dashboard/RenewalBadge";
import { ServiceMark } from "../ui/ServiceMark";

const REMINDER_DAYS = 7;

export function WindowFrame({ path, children, className = "" }: { path: string; children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[20px] border border-line-strong bg-ink-950 shadow-window ${className}`}>
      <div className="flex h-10 items-center gap-3 border-b border-line bg-ink-900 px-4">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto flex h-6 items-center rounded-full bg-ink-850 px-4 font-mono text-[11px] text-paper-faint">{path}</div>
        <div className="w-[52px]" />
      </div>
      {children}
    </div>
  );
}

export function AppPreview() {
  const data = useMemo(() => {
    const subs = buildSeedSubscriptions("usr_maya");
    const upcoming = getUpcomingRenewals(subs);
    const week = upcoming.filter((item) => item.daysUntil <= REMINDER_DAYS);
    return {
      summary: summarizeSpending(subs, "USD"),
      upcoming,
      week,
      weekTotal: sumRenewals(week, "USD"),
      forecast: forecastCharges(subs, "USD"),
      categories: spendingByCategory(subs, "USD"),
    };
  }, []);

  const nav = [
    { icon: LayoutGrid, label: "Overview", active: true },
    { icon: Layers, label: "Subscriptions", count: data.summary.count },
    { icon: CalendarClock, label: "Upcoming", count: data.week.length },
    { icon: Settings, label: "Settings" },
  ];

  const stats = [
    { label: "Monthly spending", value: formatMoney(data.summary.monthly, "USD"), tone: "bg-chart-1" },
    { label: "Per year", value: formatMoney(data.summary.yearly, "USD", true), tone: "bg-chart-2" },
    { label: "Active", value: String(data.summary.count), tone: "bg-chart-4" },
    { label: "Next 7 days", value: formatMoney(data.weekTotal, "USD"), tone: "bg-chart-3" },
  ];

  return (
    <WindowFrame path="app.mohar.app/overview">
      <div className="flex text-left" aria-hidden="true">
        <aside className="hidden w-48 shrink-0 flex-col border-r border-line bg-ink-900 p-3 md:flex">
          <div className="mb-5 flex items-center gap-2 px-1.5 pt-1">
            <LogoMark className="size-6" />
            <span className="font-display text-[14px] font-bold">Mohar</span>
          </div>
          <div className="space-y-0.5">
            {nav.map(({ icon: Icon, label, active, count }) => (
              <div
                key={label}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] font-medium ${
                  active ? "bg-fern-deep text-fern" : "text-paper-muted"
                }`}
              >
                <Icon className="size-3.5" />
                <span className="flex-1">{label}</span>
                {count !== undefined && <span className="text-[10.5px] text-paper-faint">{count}</span>}
              </div>
            ))}
          </div>
          <div className="mt-auto flex items-center gap-2 rounded-xl bg-ink-850 p-2">
            <span className="grid size-7 place-items-center rounded-full bg-chart-1 text-[10px] font-bold text-white">MC</span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[11.5px] font-semibold">Maya Chen</p>
              <p className="truncate text-[10px] text-paper-faint">maya@mohar.app</p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex h-12 items-center justify-between gap-3 border-b border-line bg-ink-900/60 px-4 sm:px-5">
            <p className="font-display text-[14px] font-bold">Good evening, Maya</p>
            <div className="flex items-center gap-2">
              <div className="hidden h-7 w-44 items-center gap-1.5 rounded-lg border border-line bg-ink-900 px-2.5 text-[11px] text-paper-faint sm:flex">
                <Search className="size-3" /> Search
              </div>
              <div className="relative grid size-7 place-items-center rounded-lg border border-line bg-ink-900 text-paper-muted">
                <Bell className="size-3.5" />
                <span className="absolute -top-1 -right-1 grid size-3.5 place-items-center rounded-full bg-amber text-[8px] font-bold text-white">2</span>
              </div>
              <div className="flex h-7 items-center gap-1 rounded-lg bg-fern px-2.5 text-[11px] font-semibold text-on-accent">
                <Plus className="size-3" strokeWidth={3} /> Add
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="card rounded-xl p-3">
                  <p className="flex items-center gap-1.5 text-[10.5px] font-medium text-paper-faint">
                    <span className={`size-1.5 rounded-full ${stat.tone}`} />
                    {stat.label}
                  </p>
                  <p className="mt-1 font-display text-[18px] font-bold tracking-tight sm:text-[21px]">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <div className="card rounded-xl p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[12.5px] font-bold">Next 12 months</p>
                  <ChartLegend
                    items={[
                      { label: "Monthly", color: "var(--chart-1)" },
                      { label: "Yearly", color: "var(--chart-2)" },
                    ]}
                  />
                </div>
                <SpendingForecastChart data={data.forecast} currency="USD" height={150} compact />
              </div>
              <div className="card hidden rounded-xl p-4 sm:block">
                <p className="mb-2 text-[12.5px] font-bold">Coming up</p>
                <div className="space-y-1">
                  {data.upcoming.slice(0, 4).map(({ subscription: sub, daysUntil }) => (
                    <div key={sub.id} className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5">
                      <ServiceMark name={sub.name} size="sm" />
                      <div className="min-w-0 flex-1 leading-tight">
                        <p className="truncate text-[11.5px] font-semibold">{sub.name}</p>
                        <RenewalBadge daysUntil={daysUntil} reminderDays={REMINDER_DAYS} />
                      </div>
                      <span className="text-[11.5px] font-semibold tabular-nums">{formatMoney(sub.price, sub.currency)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card hidden rounded-xl p-4 lg:block">
              <p className="mb-3 text-[12.5px] font-bold">Where it goes</p>
              <CategoryBreakdown categories={data.categories} currency="USD" horizontal />
            </div>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}
