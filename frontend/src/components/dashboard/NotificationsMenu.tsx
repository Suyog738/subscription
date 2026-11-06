import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  BellOff,
  CalendarClock,
  Hourglass,
  Mail,
  MonitorSmartphone,
  Settings2,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useNotifications } from "../../contexts/NotificationsContext";
import type { AppNotification } from "../../types";

const ICONS: Record<AppNotification["event"], { icon: LucideIcon; tone: string }> = {
  renewals: { icon: CalendarClock, tone: "bg-fern-deep text-fern" },
  trials: { icon: Hourglass, tone: "bg-amber-deep text-amber" },
  priceRises: { icon: TrendingUp, tone: "bg-clay-deep text-clay" },
  balance: { icon: Wallet, tone: "bg-clay-deep text-clay" },
  stopChecks: { icon: BadgeCheck, tone: "bg-fern-deep text-fern" },
  test: { icon: Bell, tone: "bg-ink-800 text-paper-muted" },
};

export function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function NotificationsMenu() {
  const { notifications, unread, markRead } = useNotifications();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        className={`relative grid size-9 place-items-center rounded-full border bg-ink-900 transition-colors ${
          open ? "border-line-strong bg-ink-800 text-paper" : "border-line text-paper-muted hover:border-line-strong hover:text-paper"
        }`}
      >
        <motion.span key={unread} animate={unread ? { rotate: [0, -14, 12, -8, 0] } : undefined} transition={{ duration: 0.6 }}>
          <Bell className="size-4" />
        </motion.span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-amber px-1 text-[10px] font-bold text-white dark:text-ink-950">
            {unread > 9 ? "9+" : unread}
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
            className="fixed inset-x-3 top-16 z-50 origin-top-right overflow-hidden rounded-2xl border border-line-strong bg-ink-900 shadow-float sm:absolute sm:inset-x-auto sm:top-11 sm:right-0 sm:w-[380px]"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <p className="text-sm font-bold">Notifications</p>
                <p className="text-[12px] text-paper-faint">{unread ? `${unread} unread` : "You're all caught up"}</p>
              </div>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => markRead("all")}
                  className="rounded-md px-2 py-1 text-[12px] font-semibold text-fern hover:bg-fern-deep"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <BellOff className="mx-auto size-5 text-paper-faint" />
                <p className="mt-3 text-sm">No notifications yet.</p>
                <p className="mt-1 text-[12.5px] text-paper-muted">Reminders appear here based on your notification settings.</p>
              </div>
            ) : (
              <ul className="max-h-[55vh] divide-y divide-line overflow-y-auto">
                {notifications.slice(0, 30).map((n) => {
                  const meta = ICONS[n.event] ?? ICONS.test;
                  const Icon = n.title.includes("charged you after") ? AlertTriangle : meta.icon;
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => {
                          void markRead([n.id]);
                          setOpen(false);
                          navigate(n.link);
                        }}
                        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-ink-850 ${n.read ? "" : "bg-fern-deep/30"}`}
                      >
                        <span className={`grid size-8 shrink-0 place-items-center rounded-xl ${meta.tone}`}>
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-[13px] leading-snug ${n.read ? "font-medium" : "font-bold"}`}>{n.title}</p>
                            {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-fern" aria-label="Unread" />}
                          </div>
                          <p className="mt-0.5 text-[12.5px] leading-snug text-paper-muted">{n.body}</p>
                          <p className="mt-1.5 flex items-center gap-2 text-[11px] text-paper-faint">
                            {timeAgo(n.createdAt)}
                            {n.channels.includes("browser") && (
                              <span className="flex items-center gap-0.5" title="Also sent as a browser notification">
                                <MonitorSmartphone className="size-3" /> Browser
                              </span>
                            )}
                            {n.channels.includes("email") && (
                              <span className="flex items-center gap-0.5" title="Also sent by email (simulated)">
                                <Mail className="size-3" /> Email
                              </span>
                            )}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-line bg-ink-850/60 px-4 py-2.5 text-[12px] font-semibold">
              <Link to="/app/outbox" onClick={() => setOpen(false)} className="flex items-center gap-1.5 text-paper-muted hover:text-paper">
                <Mail className="size-3.5" /> Email outbox
              </Link>
              <Link to="/app/settings" onClick={() => setOpen(false)} className="flex items-center gap-1.5 text-paper-muted hover:text-paper">
                <Settings2 className="size-3.5" /> Preferences
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
