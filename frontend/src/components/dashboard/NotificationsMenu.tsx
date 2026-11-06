import { AnimatePresence, motion } from "framer-motion";
import { Bell, BellOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useCurrentUser } from "../../contexts/AuthContext";
import { useEditor } from "../../contexts/EditorContext";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import { useSeenReminders } from "../../hooks/useSeenReminders";
import { formatMoney, formatShortDate } from "../../utils/format";
import { RenewalBadge } from "./RenewalBadge";
import { ServiceMark } from "../ui/ServiceMark";

export function NotificationsMenu() {
  const user = useCurrentUser();
  const { withinReminder, reminderDays } = useDashboardStats();
  const { openEdit } = useEditor();
  const { isSeen, markSeen } = useSeenReminders(user.id);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const unseenCount = withinReminder.filter((item) => !isSeen(item)).length;

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle() {
    setOpen((value) => !value);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={unseenCount > 0 ? `Reminders, ${unseenCount} new` : "Reminders"}
        className={`relative grid size-9 place-items-center rounded-full border bg-ink-900 transition-colors ${
          open ? "border-line-strong bg-ink-800 text-paper" : "border-line text-paper-muted hover:border-line-strong hover:text-paper"
        }`}
      >
        <Bell className="size-4" />
        {unseenCount > 0 && (
          <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-amber px-1 text-[10px] font-bold text-white dark:text-ink-950">
            {unseenCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-3 top-16 z-50 origin-top-right overflow-hidden rounded-2xl border border-line-strong bg-ink-900 shadow-float sm:absolute sm:inset-x-auto sm:top-11 sm:right-0 sm:w-[360px]"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <p className="text-sm font-medium">Reminders</p>
                <p className="text-[12px] text-paper-faint">Renewing in the next {reminderDays} days</p>
              </div>
              {unseenCount > 0 && (
                <button
                  type="button"
                  onClick={() => markSeen(withinReminder)}
                  className="rounded-md px-2 py-1 text-[12px] text-paper-muted hover:bg-ink-700 hover:text-paper"
                >
                  Mark all as seen
                </button>
              )}
            </div>

            {withinReminder.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <BellOff className="mx-auto size-5 text-paper-faint" />
                <p className="mt-3 text-sm">Nothing renews in the next {reminderDays} days.</p>
              </div>
            ) : (
              <ul className="max-h-[50vh] divide-y divide-line overflow-y-auto">
                {withinReminder.map((item) => {
                  const { subscription: sub } = item;
                  const fresh = !isSeen(item);
                  return (
                    <li key={sub.id}>
                      <button
                        type="button"
                        onClick={() => {
                          markSeen([item]);
                          setOpen(false);
                          openEdit(sub);
                        }}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-ink-800"
                      >
                        <ServiceMark name={sub.name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-[13px] font-medium">{sub.name}</p>
                            {fresh && <span className="size-1.5 shrink-0 rounded-full bg-amber" aria-label="New" />}
                          </div>
                          <p className="mt-0.5 text-[12.5px] text-paper-muted">
                            {formatMoney(sub.price, sub.currency)} on {formatShortDate(item.nextDate)}
                          </p>
                          <div className="mt-1.5">
                            <RenewalBadge daysUntil={item.daysUntil} reminderDays={reminderDays} />
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-line bg-ink-900/60 px-4 py-2.5">
              <p className="text-[11.5px] leading-snug text-paper-faint">In-app only. Email reminders aren't connected yet.</p>
              <Link
                to="/app/renewals"
                onClick={() => setOpen(false)}
                className="shrink-0 text-[12px] font-medium text-paper-muted hover:text-paper"
              >
                All renewals
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
