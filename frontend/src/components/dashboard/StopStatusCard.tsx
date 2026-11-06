import { AlertTriangle, CheckCircle2, FastForward, Hourglass, Loader2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useBank } from "../../contexts/BankContext";
import { useDemoClock } from "../../contexts/DemoClockContext";
import { useSubscriptions } from "../../contexts/SubscriptionsContext";
import { useToast } from "../../contexts/ToastContext";
import type { Subscription } from "../../types";
import { daysBetween, parseISODate, startOfToday, toISODate } from "../../utils/date";
import { formatLongDate, formatMoney } from "../../utils/format";
import { Button } from "../ui/Button";

export function StopStatusCard({ sub }: { sub: Subscription }) {
  const { setStop } = useSubscriptions();
  const { connection, transactions } = useBank();
  const { advance } = useDemoClock();
  const { notify } = useToast();
  const [busy, setBusy] = useState(false);
  const stop = sub.stop;
  if (!stop) return null;

  const money = formatMoney(sub.price, sub.currency);
  const canAutoCheck = Boolean(connection && sub.merchantKey);
  const lateCharge = transactions.find((t) => t.merchantKey === sub.merchantKey && t.kind === "charge" && t.date > stop.stoppedAt);

  async function record(check: "confirmed" | "charged") {
    if (!stop) return;
    await setStop(sub.id, { ...stop, check, checkedAt: toISODate(startOfToday()) });
  }

  function fastForwardToCheck() {
    if (!stop) return;
    const days = Math.max(1, daysBetween(startOfToday(), parseISODate(stop.checkOn)));
    notify({ tone: "info", title: `Fast-forwarding ${days} days`, description: `Jumping to ${formatLongDate(stop.checkOn)} to run the check.` });
    advance(days);
  }

  async function restart() {
    setBusy(true);
    await setStop(sub.id, null);
    setBusy(false);
    notify({ title: `${sub.name} is back on your list` });
  }

  const styles = {
    pending: { box: "border-line-strong bg-ink-850", icon: <Hourglass className="size-5 text-paper-muted" /> },
    confirmed: { box: "border-fern/30 bg-fern-deep", icon: <CheckCircle2 className="size-5 text-fern" /> },
    charged: { box: "border-clay/30 bg-clay-deep", icon: <AlertTriangle className="size-5 text-clay" /> },
  }[stop.check];

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${styles.box}`}>
      <div className="flex items-start gap-3">
        {styles.icon}
        <div className="min-w-0 flex-1">
          {stop.check === "pending" && (
            <>
              <p className="font-bold">Waiting to confirm it stopped</p>
              <p className="mt-1 text-[13.5px] text-paper-muted">
                You stopped it on {formatLongDate(stop.stoppedAt)}.{" "}
                {canAutoCheck
                  ? `On ${formatLongDate(stop.checkOn)} we'll look at your ${connection?.bankName} payments for a ${money} charge.`
                  : `On ${formatLongDate(stop.checkOn)}, check your statement and tell us whether a charge came in.`}
              </p>
            </>
          )}
          {stop.check === "confirmed" && (
            <>
              <p className="font-bold text-fern">Stopped for good</p>
              <p className="mt-1 text-[13.5px] text-paper-muted">
                No charge arrived after {formatLongDate(stop.stoppedAt)}. It no longer counts towards your totals.
              </p>
            </>
          )}
          {stop.check === "charged" && (
            <>
              <p className="font-bold text-clay">Charged after you stopped it</p>
              <p className="mt-1 text-[13.5px] text-paper-muted">
                {lateCharge ? `${formatMoney(lateCharge.amount, lateCharge.currency)} on ${formatLongDate(lateCharge.date)}. ` : ""}
                Contact {sub.name}
                {stop.reference ? ` and quote your reference ${stop.reference}` : ""}. If they won't refund it, you can dispute
                the charge with your bank.
              </p>
            </>
          )}
          {(stop.reference || stop.note) && (
            <p className="mt-2 text-[12.5px] text-paper-faint">
              {stop.reference && <>Reference: <span className="font-semibold text-paper-muted">{stop.reference}</span></>}
              {stop.reference && stop.note && " · "}
              {stop.note}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {stop.check === "pending" &&
              (canAutoCheck ? (
                <Button size="sm" onClick={fastForwardToCheck} disabled={busy}>
                  {busy ? <Loader2 className="size-3.5 animate-spin" /> : <FastForward className="size-3.5" />}
                  Fast forward to {formatLongDate(stop.checkOn)}
                </Button>
              ) : (
                <>
                  <Button size="sm" onClick={() => record("confirmed")}>No charge arrived</Button>
                  <Button size="sm" variant="secondary" onClick={() => record("charged")}>
                    I was charged
                  </Button>
                </>
              ))}
            {stop.check === "charged" && (
              <Button size="sm" variant="secondary" onClick={() => record("confirmed")}>
                It's sorted now
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={restart} disabled={busy}>
              <RotateCcw className="size-3.5" /> Still subscribed
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
