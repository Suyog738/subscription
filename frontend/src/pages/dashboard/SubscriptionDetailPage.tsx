import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Hourglass, Landmark, Pencil, StickyNote, Trash2, TrendingUp, XCircle } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { EmptyState } from "../../components/dashboard/EmptyState";
import { RenewalBadge } from "../../components/dashboard/RenewalBadge";
import { StopStatusCard } from "../../components/dashboard/StopStatusCard";
import { Button } from "../../components/ui/Button";
import { ServiceMark } from "../../components/ui/ServiceMark";
import { useBank } from "../../contexts/BankContext";
import { useEditor } from "../../contexts/EditorContext";
import { useSubscriptions } from "../../contexts/SubscriptionsContext";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import type { Subscription, Transaction } from "../../types";
import { monthlyEquivalentIn, nextRenewalDate } from "../../utils/billing";
import { CHANNEL_LABELS } from "../../utils/channels";
import { addDays, daysBetween, parseISODate, startOfToday, toISODate } from "../../utils/date";
import { chargesFor } from "../../utils/detection";
import { cycleSuffix, formatCycle, formatLongDate, formatMoney, formatShortDate } from "../../utils/format";

export function SubscriptionDetailPage() {
  const { id } = useParams();
  const { subscriptions } = useSubscriptions();
  const sub = subscriptions.find((s) => s.id === id);

  if (!sub) {
    return (
      <EmptyState
        title="Subscription not found"
        body="It may have been deleted, or it belongs to a different account."
        action={
          <Button to="/app/subscriptions" variant="secondary">
            Back to subscriptions
          </Button>
        }
      />
    );
  }
  return <Detail sub={sub} />;
}

function Detail({ sub }: { sub: Subscription }) {
  const { openEdit, requestDelete, requestStop } = useEditor();
  const { connection, transactions, tracked } = useBank();
  const { currency, leadFor } = useDashboardStats();
  const [showReason, setShowReason] = useState(false);

  const detection = tracked.get(sub.id);
  const charges = chargesFor(sub, transactions, detection);
  const stopped = sub.status === "stopped";
  const next = nextRenewalDate(sub);
  const daysUntil = daysBetween(startOfToday(), parseISODate(next));
  const lead = leadFor(sub);
  const reminderOn = toISODate(addDays(parseISODate(next), -lead));
  const paidSoFar = charges.reduce((sum, t) => sum + t.amount, 0);
  const chargeCurrency = charges[0]?.currency ?? sub.currency;

  return (
    <div className="space-y-5">
      <Link to="/app/subscriptions" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-paper-muted hover:text-paper">
        <ArrowLeft className="size-4" /> All subscriptions
      </Link>

      <section className="card relative overflow-hidden rounded-3xl p-5 sm:p-7">
        <div className="absolute -top-20 -right-20 size-64 rounded-full bg-[radial-gradient(circle,var(--glow),transparent_70%)]" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <ServiceMark name={sub.name} size="lg" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[26px] leading-tight font-bold tracking-[-0.02em]">{sub.name}</h2>
                {sub.status === "trial" && <span className="rounded-full bg-amber-deep px-2.5 py-0.5 text-[12px] font-bold text-amber">Free trial</span>}
                {stopped && <span className="rounded-full bg-ink-800 px-2.5 py-0.5 text-[12px] font-bold text-paper-muted">Stopped</span>}
              </div>
              <p className="mt-1 text-[13.5px] text-paper-muted">
                {sub.category} · {formatCycle(sub.billingCycle)} · paid through {CHANNEL_LABELS[sub.channel]}
                {detection && (
                  <span className="mt-2 flex w-fit items-center gap-1 rounded-full bg-fern-deep px-2 py-0.5 text-[11.5px] font-bold text-fern sm:mt-0 sm:ml-2 sm:inline-flex">
                    <Landmark className="size-3" /> Linked to payments
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="md:text-right">
            <p className="font-display text-[34px] leading-none font-bold tabular-nums">
              {formatMoney(sub.price, sub.currency)}
              <span className="text-[16px] font-semibold text-paper-faint">{cycleSuffix(sub.billingCycle)}</span>
            </p>
            {sub.currency !== currency && (
              <p className="mt-1 text-[12.5px] text-paper-faint">≈ {formatMoney(monthlyEquivalentIn(sub, currency), currency)} a month</p>
            )}
          </div>
        </div>

        <div className="relative mt-6 flex flex-wrap gap-2">
          {!stopped && (
            <Button onClick={() => requestStop(sub)}>
              <XCircle className="size-4" /> Stop it
            </Button>
          )}
          <Button variant="secondary" onClick={() => openEdit(sub)}>
            <Pencil className="size-4" /> Edit
          </Button>
          <Button variant="ghost" className="text-clay hover:bg-clay-deep hover:text-clay" onClick={() => requestDelete(sub)}>
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      </section>

      {stopped && <StopStatusCard sub={sub} />}

      {sub.status === "trial" && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber/30 bg-amber-deep p-4">
          <Hourglass className="mt-0.5 size-5 shrink-0 text-amber" />
          <p className="text-[14px]">
            The trial turns into a <strong>{formatMoney(sub.price, sub.currency)}</strong> charge on <strong>{formatLongDate(next)}</strong>.
            We'll warn you on {formatLongDate(reminderOn)}.
          </p>
        </div>
      )}

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card rounded-2xl p-4">
          <dt className="text-[12.5px] font-semibold text-paper-muted">{stopped ? "Would have renewed" : "Next charge"}</dt>
          <dd className="mt-1 font-display text-[22px] font-bold">{formatLongDate(next)}</dd>
          {!stopped && (
            <dd className="mt-1">
              <RenewalBadge daysUntil={daysUntil} reminderDays={lead} />
            </dd>
          )}
        </div>
        <div className="card rounded-2xl p-4">
          <dt className="text-[12.5px] font-semibold text-paper-muted">Reminder</dt>
          <dd className="mt-1 font-display text-[22px] font-bold">{stopped ? "Off" : `${lead} days before`}</dd>
          {!stopped && <dd className="mt-1 text-[12.5px] text-paper-faint">On {formatLongDate(reminderOn)}</dd>}
        </div>
        <div className="card rounded-2xl p-4">
          <dt className="text-[12.5px] font-semibold text-paper-muted">Paid so far</dt>
          <dd className="mt-1 font-display text-[22px] font-bold tabular-nums">
            {charges.length ? formatMoney(paidSoFar, chargeCurrency) : "—"}
          </dd>
          <dd className="mt-1 text-[12.5px] text-paper-faint">
            {charges.length ? `${charges.length} payments in the last 6 months` : connection ? "No matching payments" : "Connect your bank to see this"}
          </dd>
        </div>
      </dl>

      <section className="card rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-bold">What you've paid</h3>
            <p className="mt-0.5 text-[13px] text-paper-muted">Each bar is a charge from your bank statement.</p>
          </div>
          {detection?.priceChange && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-deep px-2.5 py-1 text-[12px] font-bold text-amber">
              <TrendingUp className="size-3.5" />
              {formatMoney(detection.priceChange.from, detection.currency)} → {formatMoney(detection.priceChange.to, detection.currency)} on{" "}
              {formatShortDate(detection.priceChange.date)}
            </span>
          )}
        </div>
        {charges.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-line-strong px-4 py-8 text-center">
            <p className="text-[14px] font-semibold">{connection ? "No payments matched yet" : "No bank connected"}</p>
            <p className="mx-auto mt-1 max-w-sm text-[13px] text-paper-muted">
              {connection
                ? "We couldn't find charges for this subscription in the last 6 months of payments."
                : "Connect your bank and Mohar will show every charge for this subscription, including price rises."}
            </p>
            {!connection && (
              <Button to="/app/bank" size="sm" className="mt-4">
                Connect bank
              </Button>
            )}
          </div>
        ) : (
          <PaymentHistory charges={charges} next={stopped ? null : { date: next, amount: sub.price }} stoppedAt={sub.stop?.stoppedAt} />
        )}
      </section>

      {(detection || sub.notes) && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {detection && (
            <section className="card rounded-2xl p-5">
              <button type="button" onClick={() => setShowReason((v) => !v)} className="flex w-full items-center justify-between text-left">
                <span className="flex items-center gap-2 text-[14px] font-bold">
                  <Landmark className="size-4 text-fern" /> How we recognised this
                </span>
                <ChevronDown className={`size-4 transition-transform ${showReason ? "rotate-180" : ""}`} />
              </button>
              {showReason && <p className="mt-3 text-[13.5px] leading-relaxed text-paper-muted">{detection.reason}</p>}
            </section>
          )}
          {sub.notes && (
            <section className="card rounded-2xl p-5">
              <p className="flex items-center gap-2 text-[14px] font-bold">
                <StickyNote className="size-4 text-paper-muted" /> Notes
              </p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-paper-muted">{sub.notes}</p>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function PaymentHistory({
  charges,
  next,
  stoppedAt,
}: {
  charges: Transaction[];
  next: { date: string; amount: number } | null;
  stoppedAt?: string;
}) {
  const recent = charges.slice(-8);
  const max = Math.max(...recent.map((c) => c.amount), next?.amount ?? 0) || 1;
  const currency = recent[0].currency;

  return (
    <div className="mt-6 flex h-[200px] items-end gap-2 sm:gap-3">
      {recent.map((charge, index) => {
        const rose = index > 0 && charge.amount > recent[index - 1].amount + 0.005;
        const afterStop = stoppedAt && charge.date > stoppedAt;
        return (
          <div key={charge.id} className={`group flex h-full min-w-0 flex-1 flex-col items-center justify-end ${index < recent.length - 5 ? "max-sm:hidden" : ""}`}>
            <span className={`mb-1 text-[11px] font-bold tabular-nums ${rose ? "text-amber" : afterStop ? "text-clay" : "text-paper-muted"}`}>
              {rose && "↑ "}
              {formatMoney(charge.amount, currency)}
            </span>
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: index * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: `${(charge.amount / max) * 75}%`, originY: 1 }}
              className={`w-full max-w-12 rounded-t-md ${afterStop ? "bg-clay" : rose ? "bg-amber" : "bg-chart-1"}`}
              title={`${formatLongDate(charge.date)}: ${formatMoney(charge.amount, currency)}`}
            />
            <span className="mt-1.5 text-[11px] font-semibold text-paper-faint">{formatShortDate(charge.date).split(" ")[0]}</span>
          </div>
        );
      })}
      {next && (
        <div className="flex h-full flex-1 flex-col items-center justify-end">
          <span className="mb-1 text-[11px] font-bold text-paper-muted tabular-nums">{formatMoney(next.amount, currency)}</span>
          <div
            style={{ height: `${(next.amount / max) * 75}%` }}
            className="w-full max-w-12 rounded-t-md border-2 border-dashed border-fern/60 bg-fern-deep"
            title={`Next charge ${formatLongDate(next.date)}`}
          />
          <span className="mt-1.5 text-[11px] font-bold text-fern">Next</span>
        </div>
      )}
    </div>
  );
}
