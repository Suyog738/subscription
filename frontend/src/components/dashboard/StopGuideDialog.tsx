import { ChevronRight, Clock, Info, Loader2, ShieldCheck, TimerReset } from "lucide-react";
import { useState } from "react";
import { useBank } from "../../contexts/BankContext";
import { useSubscriptions } from "../../contexts/SubscriptionsContext";
import { useToast } from "../../contexts/ToastContext";
import { stopGuideFor } from "../../data/stopGuides";
import type { Subscription } from "../../types";
import { nextRenewalDate } from "../../utils/billing";
import { CHANNEL_LABELS } from "../../utils/channels";
import { addDays, parseISODate, startOfToday, toISODate } from "../../utils/date";
import { formatLongDate, formatMoney } from "../../utils/format";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { Field, Input, Textarea } from "../ui/Field";

export function StopGuideDialog({ subscription, onClose }: { subscription: Subscription | null; onClose: () => void }) {
  return (
    <Dialog open={subscription !== null} onClose={onClose} title={subscription ? `Stop ${subscription.name}` : "Stop"}>
      {subscription && <StopGuideBody key={subscription.id} sub={subscription} onClose={onClose} />}
    </Dialog>
  );
}

function StopGuideBody({ sub, onClose }: { sub: Subscription; onClose: () => void }) {
  const { setStop } = useSubscriptions();
  const { connection } = useBank();
  const { notify } = useToast();
  const [step, setStep] = useState<"guide" | "proof">("guide");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const guide = stopGuideFor(sub);
  const next = nextRenewalDate(sub);
  const deadline = toISODate(addDays(parseISODate(next), -1));
  const checkOn = toISODate(addDays(parseISODate(next), 1));
  const money = formatMoney(sub.price, sub.currency);
  const trial = sub.status === "trial";

  async function save() {
    setSaving(true);
    try {
      await setStop(sub.id, {
        stoppedAt: toISODate(startOfToday()),
        checkOn,
        reference: reference.trim() || undefined,
        note: note.trim() || undefined,
        check: "pending",
      });
      notify({
        title: `${sub.name} marked as stopped`,
        description: connection
          ? `We'll check your ${connection.bankName} payments on ${formatLongDate(checkOn)} to make sure no charge arrives.`
          : `On ${formatLongDate(checkOn)} we'll ask you whether a charge still came in.`,
      });
      onClose();
    } catch (err) {
      notify({ tone: "error", title: "Couldn't save", description: err instanceof Error ? err.message : undefined });
    } finally {
      setSaving(false);
    }
  }

  if (step === "proof") {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-paper-muted">
          Most providers send a confirmation email or show a reference number. Saving it here helps if you're charged
          again and need to dispute it.
        </p>
        <Field label="Confirmation reference" htmlFor="stop-ref" optional>
          <Input id="stop-ref" data-autofocus placeholder="e.g. CNX-48213" value={reference} onChange={(e) => setReference(e.target.value)} />
        </Field>
        <Field label="Note" htmlFor="stop-note" optional>
          <Textarea id="stop-note" placeholder="Who you spoke to, or how you cancelled" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <div className="flex gap-2 border-t border-line pt-4 sm:justify-end">
          <Button variant="secondary" className="flex-1 sm:flex-none" onClick={() => setStep("guide")}>
            Back
          </Button>
          <Button className="flex-1 sm:flex-none" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : "Mark as stopped"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-2xl border border-amber/30 bg-amber-deep px-4 py-3">
        <Clock className="mt-0.5 size-4 shrink-0 text-amber" />
        <p className="text-[14px] leading-snug">
          {trial ? (
            <>
              Stop before <strong>{formatLongDate(deadline)}</strong> so the trial doesn't turn into a {money} charge.
            </>
          ) : (
            <>
              Stop before <strong>{formatLongDate(deadline)}</strong> to avoid the {money} charge on {formatLongDate(next)}.
            </>
          )}
        </p>
      </div>

      <div>
        <p className="text-[13px] font-bold">Where it's managed</p>
        <p className="mt-1 text-[14px] text-paper-muted">
          Paid by {CHANNEL_LABELS[sub.channel].toLowerCase() === "card" ? "card" : CHANNEL_LABELS[sub.channel]}. Stop it in{" "}
          <span className="font-semibold text-paper">{guide.where}</span>.
        </p>
        <ol className="mt-3 flex flex-wrap items-center gap-1.5">
          {guide.steps.map((s, index) => (
            <li key={`${s}-${index}`} className="flex items-center gap-1.5">
              <span className="rounded-lg border border-line-strong bg-ink-950 px-2.5 py-1 text-[12.5px] font-semibold">{s}</span>
              {index < guide.steps.length - 1 && <ChevronRight className="size-3.5 text-paper-faint" />}
            </li>
          ))}
        </ol>
      </div>

      <ul className="space-y-2.5 text-[13.5px] text-paper-muted">
        <li className="flex gap-2.5">
          <TimerReset className="mt-0.5 size-4 shrink-0 text-fern" />
          You usually keep access until {formatLongDate(next)}, the end of the period you've paid for.
        </li>
        <li className="flex gap-2.5">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-fern" />
          {connection
            ? `On ${formatLongDate(checkOn)} we'll check your payments and tell you if a charge still arrived.`
            : `On ${formatLongDate(checkOn)} we'll ask you whether a charge still arrived. Connect your bank and we can check for you.`}
        </li>
        {guide.tip && (
          <li className="flex gap-2.5">
            <Info className="mt-0.5 size-4 shrink-0 text-fern" />
            {guide.tip}
          </li>
        )}
      </ul>

      <div className="flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>
          Not now
        </Button>
        <Button onClick={() => setStep("proof")}>I've stopped it</Button>
      </div>
      <p className="text-center text-[12px] text-paper-faint">Mohar never cancels anything for you. You stay in control.</p>
    </div>
  );
}
