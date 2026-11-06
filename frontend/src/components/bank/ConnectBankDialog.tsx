import { motion } from "framer-motion";
import { Check, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useBank } from "../../contexts/BankContext";
import { useToast } from "../../contexts/ToastContext";
import type { BankInstitution } from "../../types";
import { detectSubscriptions } from "../../utils/detection";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";

const STEPS = ["Asking your bank for permission", "Reading the last 6 months of payments", "Looking for payments that repeat"];

export function ConnectBankDialog({ bank, onClose }: { bank: BankInstitution | null; onClose: () => void }) {
  return (
    <Dialog open={bank !== null} onClose={onClose} title={bank ? `Connect ${bank.name}` : "Connect"} size="sm">
      {bank && <ConnectFlow key={bank.id} bank={bank} onClose={onClose} />}
    </Dialog>
  );
}

function ConnectFlow({ bank, onClose }: { bank: BankInstitution; onClose: () => void }) {
  const { connect, transactions } = useBank();
  const { notify } = useToast();
  const [phase, setPhase] = useState<"consent" | "working" | "done">("consent");
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== "working") return;
    if (step < STEPS.length) {
      const timer = window.setTimeout(() => setStep((s) => s + 1), 750);
      return () => window.clearTimeout(timer);
    }
    setPhase("done");
  }, [phase, step]);

  async function start() {
    setError(null);
    setPhase("working");
    setStep(0);
    try {
      await connect(bank.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't connect. Try again.");
      setPhase("consent");
    }
  }

  if (phase === "consent") {
    return (
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-paper-muted">
          Mohar asks {bank.name} for read-only access to your everyday account through PSD2 open banking. You can disconnect at any time and the data is removed.
        </p>
        <div className="space-y-3 rounded-2xl border border-line bg-ink-950 p-4">
          <p className="flex items-center gap-2 text-[13px] font-bold">
            <Eye className="size-4 text-fern" /> Mohar will see
          </p>
          <ul className="space-y-1.5 pl-6 text-[13px] text-paper-muted">
            <li>Payments from the last 6 months: merchant, amount, date</li>
            <li>Your account balance</li>
          </ul>
          <p className="flex items-center gap-2 pt-1 text-[13px] font-bold">
            <EyeOff className="size-4 text-clay" /> Mohar can't
          </p>
          <ul className="space-y-1.5 pl-6 text-[13px] text-paper-muted">
            <li>Move money, pay, or cancel anything</li>
            <li>See how often you use an app</li>
            <li>See your banking password</li>
          </ul>
        </div>
        {error && <p className="text-[13px] text-clay">{error}</p>}
        <div className="flex gap-2 sm:justify-end">
          <Button variant="secondary" className="flex-1 sm:flex-none" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1 sm:flex-none" onClick={start}>
            <Lock className="size-4" /> Allow read-only access
          </Button>
        </div>
        <p className="text-center text-[11.5px] text-paper-faint">Prototype: no real bank is contacted. This connects to simulated sample data.</p>
      </div>
    );
  }

  if (phase === "working") {
    return (
      <ul className="space-y-3 py-2" aria-live="polite">
        {STEPS.map((label, index) => {
          const done = index < step;
          const active = index === step;
          return (
            <motion.li
              key={label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: index <= step ? 1 : 0.4, x: 0 }}
              className="flex items-center gap-3 text-[14px]"
            >
              <span
                className={`grid size-7 place-items-center rounded-full ${done ? "bg-fern text-on-accent" : "bg-ink-800 text-paper-muted"}`}
              >
                {done ? <Check className="size-4" strokeWidth={3} /> : active ? <Loader2 className="size-4 animate-spin" /> : index + 1}
              </span>
              <span className={done || active ? "font-semibold" : "text-paper-muted"}>{label}</span>
            </motion.li>
          );
        })}
      </ul>
    );
  }

  const found = detectSubscriptions(transactions);
  const counts = {
    recurring: found.filter((d) => d.kind === "recurring").length,
    trial: found.filter((d) => d.kind === "trial").length,
    unnamed: found.filter((d) => d.kind === "unnamed").length,
  };

  return (
    <div className="space-y-5 text-center">
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 16 }}
        className="mx-auto grid size-14 place-items-center rounded-2xl bg-fern text-on-accent shadow-[0_10px_30px_-10px_var(--accent)]"
      >
        <Check className="size-7" strokeWidth={3} />
      </motion.span>
      <div>
        <p className="font-display text-xl font-bold">Connected to {bank.name}</p>
        <p className="mt-1 text-sm text-paper-muted">We found {found.length} things that look like subscriptions.</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          [counts.recurring, "repeating"],
          [counts.trial, "free trials"],
          [counts.unnamed, "need a name"],
        ].map(([n, label]) => (
          <div key={String(label)} className="rounded-xl bg-ink-850 px-2 py-3">
            <p className="font-display text-2xl font-bold">{n}</p>
            <p className="text-[11.5px] text-paper-muted">{label}</p>
          </div>
        ))}
      </div>
      <Button
        className="w-full"
        onClick={() => {
          notify({ title: `${bank.name} connected`, description: "Review what we found below." });
          onClose();
        }}
      >
        Review what we found
      </Button>
    </div>
  );
}
