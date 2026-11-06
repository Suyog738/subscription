import { Pencil, Plus, Search, StickyNote, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "../../components/dashboard/EmptyState";
import { RenewalBadge } from "../../components/dashboard/RenewalBadge";
import { Button } from "../../components/ui/Button";
import { Input, Segmented, Select } from "../../components/ui/Field";
import { ServiceMark } from "../../components/ui/ServiceMark";
import { useEditor } from "../../contexts/EditorContext";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import { monthlyEquivalentIn, summarizeSpending } from "../../utils/billing";
import { cycleSuffix, formatCycle, formatMoney, formatShortDate } from "../../utils/format";

type CycleFilter = "all" | "monthly" | "yearly";
type SortKey = "renewal" | "cost" | "name";

export function SubscriptionsPage() {
  const { upcoming, currency, reminderDays } = useDashboardStats();
  const { openCreate, openEdit, requestDelete } = useEditor();
  const [query, setQuery] = useState("");
  const [cycle, setCycle] = useState<CycleFilter>("all");
  const [sort, setSort] = useState<SortKey>("renewal");

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = upcoming.filter(({ subscription: sub }) => {
      if (cycle !== "all" && sub.billingCycle !== cycle) return false;
      if (!needle) return true;
      return [sub.name, sub.category, sub.notes ?? ""].some((value) => value.toLowerCase().includes(needle));
    });
    if (sort === "cost") {
      return [...filtered].sort(
        (a, b) => monthlyEquivalentIn(b.subscription, currency) - monthlyEquivalentIn(a.subscription, currency),
      );
    }
    if (sort === "name") return [...filtered].sort((a, b) => a.subscription.name.localeCompare(b.subscription.name));
    return filtered;
  }, [upcoming, query, cycle, sort, currency]);

  const filteredSummary = summarizeSpending(
    rows.map((row) => row.subscription),
    currency,
  );

  if (upcoming.length === 0) {
    return (
      <EmptyState
        title="Your list is empty"
        body="Add a subscription to start tracking renewal dates and what you spend each month."
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Add subscription
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="md:w-72">
          <Input
            type="search"
            aria-label="Search subscriptions"
            placeholder="Search name, category or notes"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            leading={<Search className="size-4" />}
          />
        </div>
        <div className="flex gap-3">
          <Segmented<CycleFilter>
            label="Filter by billing frequency"
            value={cycle}
            onChange={setCycle}
            options={[
              { value: "all", label: "All" },
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
            ]}
            className="flex-1 md:flex-none"
          />
          <div className="w-40">
            <Select aria-label="Sort by" value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
              <option value="renewal">Next renewal</option>
              <option value="cost">Monthly cost</option>
              <option value="name">Name</option>
            </Select>
          </div>
        </div>
        <p className="text-[13px] text-paper-faint md:ml-auto">
          {rows.length} {rows.length === 1 ? "subscription" : "subscriptions"} ·{" "}
          <span className="font-semibold tabular-nums text-paper-muted">{formatMoney(filteredSummary.monthly, currency)}</span>/mo
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No matches"
            body="Nothing matches that search or filter. Try a different word, or clear the filters."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setCycle("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-6 hidden card overflow-hidden rounded-2xl md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line text-[12px] text-paper-faint">
                  <th className="py-2.5 pl-5 font-normal">Name</th>
                  <th className="py-2.5 font-normal">Billing</th>
                  <th className="py-2.5 font-normal">Next renewal</th>
                  <th className="py-2.5 text-right font-normal">Price</th>
                  <th className="py-2.5 text-right font-normal">Per month ({currency})</th>
                  <th className="w-24 py-2.5 pr-5">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map(({ subscription: sub, nextDate, daysUntil }) => (
                  <tr key={sub.id} className="group transition-colors hover:bg-ink-850">
                    <td className="py-3 pl-5">
                      <div className="flex items-center gap-3">
                        <ServiceMark name={sub.name} />
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 text-[14px]">
                            {sub.name}
                            {sub.notes && (
                              <span title={sub.notes} className="text-paper-faint">
                                <StickyNote className="size-3.5" aria-label="Has notes" />
                              </span>
                            )}
                          </p>
                          <p className="text-[12px] text-paper-faint">{sub.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-[13px] text-paper-muted">{formatCycle(sub.billingCycle)}</td>
                    <td className="py-3">
                      <p className="text-[13px]">{formatShortDate(nextDate)}</p>
                      <RenewalBadge daysUntil={daysUntil} reminderDays={reminderDays} />
                    </td>
                    <td className="py-3 text-right font-semibold tabular-nums text-[13px]">
                      {formatMoney(sub.price, sub.currency)}
                      <span className="text-paper-faint">{cycleSuffix(sub.billingCycle)}</span>
                      {sub.currency !== currency && <p className="text-[11px] text-paper-faint">{sub.currency}</p>}
                    </td>
                    <td className="py-3 text-right font-semibold tabular-nums text-[13px] text-paper-muted">
                      {formatMoney(monthlyEquivalentIn(sub, currency), currency)}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                        <button
                          type="button"
                          onClick={() => openEdit(sub)}
                          className="rounded-md p-2 text-paper-muted hover:bg-ink-800 hover:text-paper"
                          aria-label={`Edit ${sub.name}`}
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDelete(sub)}
                          className="rounded-md p-2 text-paper-muted hover:bg-clay-deep/60 hover:text-clay"
                          aria-label={`Delete ${sub.name}`}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-5 divide-y divide-line card overflow-hidden rounded-2xl md:hidden">
            {rows.map(({ subscription: sub, nextDate, daysUntil }) => (
              <li key={sub.id}>
                <button
                  type="button"
                  onClick={() => openEdit(sub)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-ink-850"
                >
                  <ServiceMark name={sub.name} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate text-[15px]">{sub.name}</p>
                      <p className="shrink-0 font-semibold tabular-nums text-[13.5px]">
                        {formatMoney(sub.price, sub.currency)}
                        <span className="text-paper-faint">{cycleSuffix(sub.billingCycle)}</span>
                      </p>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <RenewalBadge daysUntil={daysUntil} reminderDays={reminderDays} />
                      <p className="text-[12px] text-paper-faint">{formatShortDate(nextDate)}</p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-center text-[12px] text-paper-faint md:hidden">Tap a subscription to edit or delete it.</p>
        </>
      )}
    </>
  );
}
