import { ChevronRight, Landmark, PiggyBank, Plus, Search, StickyNote } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { EmptyState } from "../../components/dashboard/EmptyState";
import { RenewalBadge } from "../../components/dashboard/RenewalBadge";
import { Button } from "../../components/ui/Button";
import { Input, Segmented, Select } from "../../components/ui/Field";
import { ServiceMark } from "../../components/ui/ServiceMark";
import { useBank } from "../../contexts/BankContext";
import { useEditor } from "../../contexts/EditorContext";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import type { Subscription } from "../../types";
import { monthlyEquivalentIn, summarizeSpending } from "../../utils/billing";
import { CHANNEL_LABELS } from "../../utils/channels";
import { cycleSuffix, formatCycle, formatLongDate, formatMoney, formatShortDate } from "../../utils/format";

type View = "active" | "stopped";
type Filter = "all" | "monthly" | "yearly" | "trial";
type SortKey = "renewal" | "cost" | "name";

function StatusPill({ sub }: { sub: Subscription }) {
  if (sub.status === "trial") return <span className="rounded-full bg-amber-deep px-2 py-0.5 text-[11px] font-bold text-amber">Trial</span>;
  if (sub.status === "stopped") return <span className="rounded-full bg-ink-800 px-2 py-0.5 text-[11px] font-bold text-paper-muted">Stopped</span>;
  return null;
}

export function SubscriptionsPage() {
  const { upcoming, stopped, currency, leadFor, savings } = useDashboardStats();
  const { tracked } = useBank();
  const { openCreate } = useEditor();
  const navigate = useNavigate();
  const [view, setView] = useState<View>("active");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortKey>("renewal");

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = upcoming.filter(({ subscription: sub }) => {
      if (filter === "trial" && sub.status !== "trial") return false;
      if ((filter === "monthly" || filter === "yearly") && sub.billingCycle !== filter) return false;
      if (!needle) return true;
      return [sub.name, sub.category, sub.notes ?? "", CHANNEL_LABELS[sub.channel]].some((v) => v.toLowerCase().includes(needle));
    });
    if (sort === "cost") {
      return [...filtered].sort((a, b) => monthlyEquivalentIn(b.subscription, currency) - monthlyEquivalentIn(a.subscription, currency));
    }
    if (sort === "name") return [...filtered].sort((a, b) => a.subscription.name.localeCompare(b.subscription.name));
    return filtered;
  }, [upcoming, query, filter, sort, currency]);

  const filteredSummary = summarizeSpending(rows.map((row) => row.subscription), currency);
  const open = (sub: Subscription) => navigate(`/app/subscriptions/${sub.id}`);

  if (upcoming.length === 0 && stopped.length === 0) {
    return (
      <EmptyState
        title="Your list is empty"
        body="Add a subscription, or connect your bank and let Mohar find them for you."
        action={
          <div className="flex gap-2">
            <Button onClick={() => openCreate()}>
              <Plus className="size-4" /> Add subscription
            </Button>
            <Button to="/app/bank" variant="secondary">
              <Landmark className="size-4" /> Connect bank
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <>
      <div className="mb-5">
        <Segmented<View>
          label="Show"
          value={view}
          onChange={setView}
          options={[
            { value: "active", label: `Active · ${upcoming.length}` },
            { value: "stopped", label: `Stopped · ${stopped.length}` },
          ]}
        />
      </div>

      {view === "stopped" ? (
        <StoppedList subs={stopped} savingsMonthly={savings.monthly} savingsSoFar={savings.soFar} currency={currency} />
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="lg:w-72">
              <Input
                type="search"
                aria-label="Search subscriptions"
                placeholder="Search name, category, channel"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                leading={<Search className="size-4" />}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Segmented<Filter>
                label="Filter"
                value={filter}
                onChange={setFilter}
                options={[
                  { value: "all", label: "All" },
                  { value: "monthly", label: "Monthly" },
                  { value: "yearly", label: "Yearly" },
                  { value: "trial", label: "Trials" },
                ]}
              />
              <div className="w-40">
                <Select aria-label="Sort by" value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
                  <option value="renewal">Next renewal</option>
                  <option value="cost">Monthly cost</option>
                  <option value="name">Name</option>
                </Select>
              </div>
            </div>
            <p className="text-[13px] text-paper-faint lg:ml-auto">
              {rows.length} {rows.length === 1 ? "subscription" : "subscriptions"} ·{" "}
              <span className="font-semibold text-paper-muted tabular-nums">{formatMoney(filteredSummary.monthly, currency)}</span>/mo
            </p>
          </div>

          {rows.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="No matches"
                body="Nothing matches that search or filter."
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQuery("");
                      setFilter("all");
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            </div>
          ) : (
            <ul className="card mt-5 divide-y divide-line overflow-hidden rounded-2xl">
              <li className="hidden grid-cols-[minmax(0,1fr)_110px_130px_120px_120px_20px] gap-4 bg-ink-850/50 px-5 py-2.5 text-[12px] font-semibold text-paper-faint md:grid">
                <span>Name</span>
                <span>Paid through</span>
                <span>Next renewal</span>
                <span className="text-right">Price</span>
                <span className="text-right">Per month ({currency})</span>
                <span />
              </li>
              {rows.map(({ subscription: sub, nextDate, daysUntil }) => (
                <li key={sub.id}>
                  <button
                    type="button"
                    onClick={() => open(sub)}
                    className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-ink-850 md:grid-cols-[minmax(0,1fr)_110px_130px_120px_120px_20px] md:px-5"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <ServiceMark name={sub.name} size="lg" />
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-[14.5px] font-semibold">{sub.name}</span>
                          <StatusPill sub={sub} />
                          {tracked.has(sub.id) && <Landmark className="size-3.5 shrink-0 text-fern" aria-label="Linked to bank payments" />}
                          {sub.notes && <StickyNote className="size-3.5 shrink-0 text-paper-faint" aria-label="Has notes" />}
                        </span>
                        <span className="block text-[12px] text-paper-faint md:hidden">
                          <RenewalBadge daysUntil={daysUntil} reminderDays={leadFor(sub)} /> · {formatShortDate(nextDate)}
                        </span>
                        <span className="hidden text-[12px] text-paper-faint md:block">
                          {sub.category} · {formatCycle(sub.billingCycle)}
                        </span>
                      </span>
                    </span>
                    <span className="hidden text-[13px] text-paper-muted md:block">{CHANNEL_LABELS[sub.channel]}</span>
                    <span className="hidden flex-col md:flex">
                      <span className="text-[13px]">{formatShortDate(nextDate)}</span>
                      <RenewalBadge daysUntil={daysUntil} reminderDays={leadFor(sub)} />
                    </span>
                    <span className="text-right text-[13.5px] font-semibold tabular-nums">
                      {formatMoney(sub.price, sub.currency)}
                      <span className="font-normal text-paper-faint">{cycleSuffix(sub.billingCycle)}</span>
                    </span>
                    <span className="hidden text-right text-[13.5px] text-paper-muted tabular-nums md:block">
                      {formatMoney(monthlyEquivalentIn(sub, currency), currency)}
                    </span>
                    <ChevronRight className="hidden size-4 text-paper-faint md:block" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}

function StoppedList({
  subs,
  savingsMonthly,
  savingsSoFar,
  currency,
}: {
  subs: Subscription[];
  savingsMonthly: number;
  savingsSoFar: number;
  currency: Parameters<typeof formatMoney>[1];
}) {
  if (subs.length === 0) {
    return (
      <EmptyState
        title="Nothing stopped yet"
        body="When you stop a subscription it moves here, and Mohar checks that no charge comes in afterwards."
      />
    );
  }
  return (
    <div className="space-y-4">
      <div className="card relative overflow-hidden rounded-2xl p-5">
        <div className="absolute -top-12 -right-12 size-44 rounded-full bg-[radial-gradient(circle,var(--glow),transparent_70%)]" />
        <div className="relative flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-fern-deep text-fern">
            <PiggyBank className="size-6" />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-paper-muted">Saved so far</p>
            <p className="font-display text-[28px] leading-tight font-bold tabular-nums">{formatMoney(savingsSoFar, currency)}</p>
            <p className="text-[12.5px] text-paper-faint">{formatMoney(savingsMonthly, currency)} a month you're no longer paying</p>
          </div>
        </div>
      </div>
      <ul className="card divide-y divide-line overflow-hidden rounded-2xl">
        {subs.map((sub) => (
          <li key={sub.id}>
            <Link to={`/app/subscriptions/${sub.id}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-ink-850 sm:px-5">
              <ServiceMark name={sub.name} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14.5px] font-semibold">{sub.name}</p>
                <p className="text-[12px] text-paper-faint">Stopped {sub.stop ? formatLongDate(sub.stop.stoppedAt) : ""}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-bold ${
                  sub.stop?.check === "confirmed"
                    ? "bg-fern-deep text-fern"
                    : sub.stop?.check === "charged"
                      ? "bg-clay-deep text-clay"
                      : "bg-ink-800 text-paper-muted"
                }`}
              >
                {sub.stop?.check === "confirmed" ? "Confirmed" : sub.stop?.check === "charged" ? "Charged again" : "Checking"}
              </span>
              <span className="w-24 text-right text-[13.5px] font-semibold text-paper-faint line-through tabular-nums">
                {formatMoney(sub.price, sub.currency)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
