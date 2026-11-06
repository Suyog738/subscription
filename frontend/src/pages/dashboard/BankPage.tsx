import { motion } from "framer-motion";
import { ArrowDownLeft, ChevronDown, Landmark, Loader2, RefreshCw, ShieldCheck, Unplug } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ConnectBankDialog } from "../../components/bank/ConnectBankDialog";
import { PartnerDirectory } from "../../components/bank/PartnerDirectory";
import { EmptyState, Panel } from "../../components/dashboard/EmptyState";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { Segmented } from "../../components/ui/Field";
import { ServiceMark } from "../../components/ui/ServiceMark";
import { useBank } from "../../contexts/BankContext";
import { useEditor } from "../../contexts/EditorContext";
import { useSubscriptions } from "../../contexts/SubscriptionsContext";
import { useToast } from "../../contexts/ToastContext";
import type { BankInstitution, DetectedSubscription } from "../../types";
import { CHANNEL_LABELS } from "../../utils/channels";
import { cycleSuffix, formatLongDate, formatMoney, formatShortDate } from "../../utils/format";

export function BankPage() {
  const { connection, loading } = useBank();
  const [selected, setSelected] = useState<BankInstitution | null>(null);
  if (loading) return null;
  return (
    <>
      {connection ? <Connected /> : <NotConnected onSelect={setSelected} />}
      <ConnectBankDialog bank={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function NotConnected({ onSelect }: { onSelect: (bank: BankInstitution) => void }) {
  const { institutions } = useBank();

  return (
    <div className="space-y-5">
      <section className="card relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="absolute inset-0 hero-grid opacity-70" />
        <div className="relative grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <span className="grid size-12 place-items-center rounded-2xl bg-fern text-on-accent shadow-[0_10px_30px_-10px_var(--accent)]">
              <Landmark className="size-6" />
            </span>
            <h2 className="mt-5 text-[28px] leading-tight font-extrabold tracking-[-0.02em] sm:text-[34px]">
              Connect your bank. <span className="text-fern">Mohar finds the rest.</span>
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-paper-muted">
              Your bank already sees every subscription you pay for. With read-only access, Mohar spots them for you,
              including free trials, app store charges and price rises.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-2.5 lg:w-[380px]">
            {[
              ["Repeating payments", "Matched to your list"],
              ["Free trials", "From the card check"],
              ["Price rises", "Flagged that month"],
              ["Balance warnings", "Before it's too late"],
            ].map(([title, body]) => (
              <li key={title} className="rounded-2xl border border-line bg-ink-900/80 p-3 backdrop-blur">
                <p className="text-[13.5px] font-bold">{title}</p>
                <p className="mt-0.5 text-[12px] text-paper-muted">{body}</p>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative mt-6 flex items-center gap-2 text-[13px] text-paper-muted">
          <ShieldCheck className="size-4 text-fern" /> Read-only. Mohar can't move money or cancel anything.
        </p>
      </section>

      <PartnerDirectory banks={institutions} onSelect={onSelect} />
    </div>
  );
}

function Connected() {
  const { connection, sync, disconnect, suggestions, trials, unnamed, tracked, transactions, detected } = useBank();
  const { subscriptions } = useSubscriptions();
  const { notify } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [filter, setFilter] = useState<"all" | "subscriptions" | "other">("all");

  const recurringKeys = useMemo(() => new Set(detected.map((d) => d.merchantKey)), [detected]);
  const shown = transactions
    .filter((t) => (filter === "all" ? true : filter === "subscriptions" ? recurringKeys.has(t.merchantKey) : !recurringKeys.has(t.merchantKey)))
    .slice(0, 30);
  const findings = [...trials, ...unnamed, ...suggestions];
  const linked = subscriptions.filter((sub) => tracked.has(sub.id));

  if (!connection) return null;

  async function handleSync() {
    setSyncing(true);
    await sync();
    setSyncing(false);
    notify({ title: "Up to date", description: `Synced with ${connection?.bankName}.` });
  }

  return (
    <div className="space-y-5">
      <section className="card relative overflow-hidden rounded-3xl p-5 sm:p-6">
        <div className="absolute -top-16 -right-16 size-56 rounded-full bg-[radial-gradient(circle,var(--glow),transparent_70%)]" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-2xl bg-fern text-on-accent">
              <Landmark className="size-6" />
            </span>
            <div>
              <p className="text-[15px] font-bold">{connection.bankName}</p>
              <p className="text-[13px] text-paper-muted">
                {connection.accountName} {connection.accountMask} · synced {formatShortDate(connection.lastSyncedAt.slice(0, 10))}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="sm:text-right">
              <p className="text-[12px] font-semibold text-paper-faint">Balance</p>
              <p className="font-display text-[26px] font-bold tabular-nums">{formatMoney(connection.balance, connection.currency)}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleSync} disabled={syncing} aria-label="Sync now">
                {syncing ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
                <span className="hidden sm:inline">Sync</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmDisconnect(true)} aria-label="Disconnect">
                <Unplug className="size-3.5" />
                <span className="hidden sm:inline">Disconnect</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-[15px] font-bold">
          Found in your payments
          <span className="rounded-full bg-fern-deep px-2 py-0.5 text-[11.5px] font-bold text-fern">{findings.length}</span>
        </h2>
        {findings.length === 0 ? (
          <EmptyState title="All caught up" body="Everything that repeats in your payments is either on your list or marked as not a subscription." />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {findings.map((item, index) => (
              <DetectionCard key={item.merchantKey} item={item} index={index} />
            ))}
          </ul>
        )}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Panel
          title="Recent payments"
          aside={
            <Segmented
              label="Filter payments"
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "All" },
                { value: "subscriptions", label: "Repeating" },
                { value: "other", label: "Other" },
              ]}
            />
          }
        >
          <ul className="divide-y divide-line">
            {shown.map((txn) => {
              const repeating = recurringKeys.has(txn.merchantKey);
              const income = txn.kind === "income";
              return (
                <li key={txn.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                  <span className="w-12 shrink-0 text-[12px] font-semibold text-paper-faint">{formatShortDate(txn.date)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold">{txn.merchant}</p>
                    <p className="truncate font-mono text-[11px] text-paper-faint">{txn.descriptor}</p>
                  </div>
                  {repeating && (
                    <span className="hidden rounded-full bg-fern-deep px-2 py-0.5 text-[11px] font-bold text-fern sm:inline">
                      {txn.kind === "card-check" ? "Trial check" : "Repeats"}
                    </span>
                  )}
                  <span className={`w-24 shrink-0 text-right text-[13.5px] font-semibold tabular-nums ${income ? "text-fern" : ""}`}>
                    {income && <ArrowDownLeft className="mr-0.5 inline size-3.5" />}
                    {income ? "+" : txn.kind === "card-check" ? "" : "−"}
                    {formatMoney(txn.amount, txn.currency)}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Linked to your list" aside={<span className="text-[13px] font-bold">{linked.length}</span>}>
          {linked.length === 0 ? (
            <p className="px-5 py-6 text-sm text-paper-muted">None of your subscriptions match these payments yet.</p>
          ) : (
            <ul className="space-y-1 p-2">
              {linked.map((sub) => (
                <li key={sub.id}>
                  <Link to={`/app/subscriptions/${sub.id}`} className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-ink-850">
                    <ServiceMark name={sub.name} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold">{sub.name}</span>
                    <span className="text-[12px] text-paper-faint">{tracked.get(sub.id)?.charges.length} payments</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Dialog open={confirmDisconnect} onClose={() => setConfirmDisconnect(false)} title="Disconnect your bank?" size="sm">
        <p className="text-sm leading-relaxed text-paper-muted">
          Mohar will delete the payment data it read from {connection.bankName}. Your subscription list stays as it is.
        </p>
        <div className="mt-6 flex gap-2 sm:justify-end">
          <Button variant="secondary" className="flex-1 sm:flex-none" onClick={() => setConfirmDisconnect(false)} data-autofocus>
            Keep connected
          </Button>
          <Button
            variant="danger"
            className="flex-1 sm:flex-none"
            onClick={async () => {
              await disconnect();
              setConfirmDisconnect(false);
              notify({ tone: "info", title: "Bank disconnected", description: "Payment data was removed." });
            }}
          >
            Disconnect
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

function DetectionCard({ item, index }: { item: DetectedSubscription; index: number }) {
  const { openCreate } = useEditor();
  const { dismiss } = useBank();
  const [open, setOpen] = useState(false);

  const badge =
    item.kind === "trial"
      ? { label: "Free trial", className: "bg-amber-deep text-amber" }
      : item.kind === "unnamed"
        ? { label: "Needs a name", className: "bg-ink-800 text-paper-muted" }
        : { label: "Repeating", className: "bg-fern-deep text-fern" };

  function add() {
    openCreate({
      name: item.kind === "unnamed" ? "" : item.merchant,
      price: item.kind === "trial" ? undefined : item.amount,
      currency: item.currency,
      billingCycle: item.cycle,
      renewalDate: item.nextExpectedDate,
      category: item.categoryGuess,
      channel: item.channel,
      status: item.kind === "trial" ? "trial" : "active",
      merchantKey: item.merchantKey,
      source: "bank",
    });
  }

  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card flex flex-col rounded-2xl p-4"
    >
      <div className="flex items-start gap-3">
        <ServiceMark name={item.kind === "unnamed" ? "?" : item.merchant} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[15px] font-bold">{item.kind === "unnamed" ? `Unnamed ${CHANNEL_LABELS[item.channel]} payment` : item.merchant}</p>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${badge.className}`}>{badge.label}</span>
          </div>
          <p className="mt-0.5 text-[13px] text-paper-muted">
            {item.kind === "trial" ? (
              <>First charge could come around {formatLongDate(item.nextExpectedDate)}</>
            ) : (
              <>
                <span className="font-semibold text-paper tabular-nums">
                  {formatMoney(item.amount, item.currency)}
                  {cycleSuffix(item.cycle)}
                </span>{" "}
                · next around {formatShortDate(item.nextExpectedDate)} · {CHANNEL_LABELS[item.channel]}
              </>
            )}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-3 flex items-center gap-1 text-[12.5px] font-semibold text-paper-muted hover:text-paper"
      >
        How we recognised this <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="mt-1.5 rounded-xl bg-ink-850 px-3 py-2 text-[12.5px] leading-relaxed text-paper-muted">{item.reason}</p>}

      <div className="mt-4 flex gap-2">
        <Button size="sm" onClick={add}>
          {item.kind === "trial" ? "Track trial" : item.kind === "unnamed" ? "Name it" : "Add to my list"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => dismiss(item.merchantKey)}>
          Not a subscription
        </Button>
      </div>
    </motion.li>
  );
}
