import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronDown, FastForward, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useDemoClock } from "../../contexts/DemoClockContext";
import { useToast } from "../../contexts/ToastContext";
import { addDays, startOfToday, toISODate } from "../../utils/date";
import { formatLongDate } from "../../utils/format";

const PRESETS = [
  { days: 1, label: "1 day" },
  { days: 3, label: "3 days" },
  { days: 7, label: "1 week" },
  { days: 14, label: "2 weeks" },
  { days: 30, label: "1 month" },
];
const MAX_DAYS = 365;

export function FastForwardMenu() {
  const { offset, advance, reset } = useDemoClock();
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const today = startOfToday();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => !rootRef.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function jump(days: number) {
    const target = toISODate(addDays(today, days));
    setOpen(false);
    setCustom("");
    notify({
      tone: "info",
      title: `Fast-forwarded ${days} ${days === 1 ? "day" : "days"}`,
      description: `It's now ${formatLongDate(target)} in the demo. Renewals, bank payments and reminders have caught up.`,
    });
    advance(days);
  }

  function onCustom(event: FormEvent) {
    event.preventDefault();
    const days = Number(custom);
    if (!Number.isInteger(days) || days < 1) return setError("Enter a whole number of days.");
    if (offset + days > MAX_DAYS) return setError(`The demo can go up to ${MAX_DAYS} days ahead.`);
    setError(null);
    jump(days);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Fast forward the demo clock"
        className={`flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition-colors ${
          offset > 0 ? "border-amber/40 bg-amber-deep text-amber" : "border-line bg-ink-900 text-paper-muted hover:border-line-strong hover:text-paper"
        }`}
      >
        <FastForward className="size-4" />
        <span className="hidden md:inline">{offset > 0 ? formatLongDate(toISODate(today)) : "Fast forward"}</span>
        <ChevronDown className={`hidden size-3.5 transition-transform md:block ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-3 top-16 z-50 origin-top-right overflow-hidden rounded-2xl border border-line-strong bg-ink-900 shadow-float sm:absolute sm:inset-x-auto sm:top-11 sm:right-0 sm:w-[300px]"
          >
            <div className="border-b border-line px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-bold">
                <CalendarDays className="size-4 text-fern" /> Demo clock
              </p>
              <p className="mt-0.5 text-[12px] text-paper-muted">
                Today in the demo: <span className="font-semibold text-paper">{formatLongDate(toISODate(today))}</span>
                {offset > 0 && <> · {offset} days ahead</>}
              </p>
            </div>
            <ul className="p-1.5" role="menu">
              {PRESETS.map((preset) => (
                <li key={preset.days}>
                  <button
                    type="button"
                    role="menuitem"
                    disabled={offset + preset.days > MAX_DAYS}
                    onClick={() => jump(preset.days)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[13.5px] font-medium hover:bg-ink-850 disabled:opacity-40"
                  >
                    <span>Forward {preset.label}</span>
                    <span className="text-[12px] text-paper-faint">{formatLongDate(toISODate(addDays(today, preset.days)))}</span>
                  </button>
                </li>
              ))}
            </ul>
            <form onSubmit={onCustom} className="border-t border-line px-4 py-3" noValidate>
              <label htmlFor="ff-custom" className="text-[12px] font-bold text-paper-muted">
                Custom
              </label>
              <div className="mt-1.5 flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="ff-custom"
                    type="number"
                    min={1}
                    max={MAX_DAYS}
                    inputMode="numeric"
                    placeholder="e.g. 10"
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    className="h-9 w-full rounded-xl border border-line-strong bg-ink-950 pr-12 pl-3 text-sm outline-none focus:border-fern"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[12px] text-paper-faint">days</span>
                </div>
                <button type="submit" className="h-9 rounded-xl bg-fern px-3 text-[13px] font-bold text-on-accent hover:bg-fern-strong">
                  Go
                </button>
              </div>
              {error && <p className="mt-1.5 text-[12px] text-clay">{error}</p>}
            </form>
            {offset > 0 && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  reset();
                  notify({ tone: "info", title: "Back to today", description: "The demo clock is reset. Payments already posted stay in the history." });
                }}
                className="flex w-full items-center gap-2 border-t border-line px-4 py-3 text-left text-[13px] font-semibold text-paper-muted hover:bg-ink-850 hover:text-paper"
              >
                <RotateCcw className="size-3.5" /> Back to today
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
