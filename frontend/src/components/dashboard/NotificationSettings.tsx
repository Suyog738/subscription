import { Bell, Loader2, Mail, MonitorSmartphone, RotateCcw, Send } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useCurrentUser } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationsContext";
import { useSubscriptions } from "../../contexts/SubscriptionsContext";
import { useToast } from "../../contexts/ToastContext";
import type { NotificationEvent } from "../../types";
import { Button } from "../ui/Button";
import { Switch } from "../ui/Switch";

const EVENTS: { key: NotificationEvent; title: string; description: string }[] = [
  { key: "renewals", title: "Upcoming renewals", description: "Before a monthly or yearly subscription renews." },
  { key: "trials", title: "Free trials", description: "Before a trial turns paid, and when a new trial is spotted." },
  { key: "priceRises", title: "Price rises", description: "When a subscription charges more than before." },
  { key: "balance", title: "Balance warnings", description: "When this week's renewals exceed your bank balance." },
  { key: "stopChecks", title: "Stop checks", description: "Whether a stopped subscription really stopped." },
];

function Line({ icon, title, description, children }: { icon?: ReactNode; title: string; description: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 sm:px-6">
      {icon && <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink-850 text-paper-muted">{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold">{title}</p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-paper-muted">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function NotificationSettings() {
  const user = useCurrentUser();
  const { settings, updateSettings } = useSubscriptions();
  const { browserPermission, requestBrowserPermission, sendTest, clearAll } = useNotifications();
  const { notify } = useToast();
  const [busy, setBusy] = useState<"test" | "replay" | null>(null);
  const prefs = settings.notifications;

  const save = (patch: Partial<typeof prefs>) => updateSettings({ notifications: { ...prefs, ...patch } });

  async function toggleBrowser(on: boolean) {
    if (!on) return save({ browser: false });
    let permission = browserPermission;
    if (permission === "default") permission = await requestBrowserPermission();
    if (permission === "granted") {
      await save({ browser: true });
      notify({ title: "Browser notifications on", description: "Reminders will also pop up on your computer or phone." });
    } else if (permission === "denied") {
      notify({ tone: "error", title: "Notifications are blocked", description: "Allow them for this site in your browser settings, then try again." });
    } else {
      notify({ tone: "error", title: "Not supported", description: "This browser can't show notifications." });
    }
  }

  const browserStatus =
    browserPermission === "unsupported"
      ? "This browser doesn't support notifications."
      : browserPermission === "denied"
        ? "Blocked in your browser's site settings."
        : prefs.browser && browserPermission === "granted"
          ? "On. Reminders pop up even when this tab is in the background."
          : "Pop-up notifications from your browser, even when Mohar isn't the open tab.";

  return (
    <section id="notifications" className="scroll-mt-24">
      <h2 className="mb-3 text-[13px] font-medium text-paper-faint">Notifications</h2>
      <div className="card divide-y divide-line rounded-2xl">
        <Line icon={<Bell className="size-4" />} title="In the app" description="The bell and a short pop-up inside Mohar. Always on.">
          <Switch checked onChange={() => undefined} label="In-app notifications" disabled />
        </Line>
        <Line icon={<MonitorSmartphone className="size-4" />} title="Browser notifications" description={browserStatus}>
          <Switch
            checked={prefs.browser && browserPermission === "granted"}
            onChange={(v) => void toggleBrowser(v)}
            label="Browser notifications"
            disabled={browserPermission === "unsupported"}
          />
        </Line>
        <Line
          icon={<Mail className="size-4" />}
          title="Email"
          description={
            <>
              Sent to <span className="font-semibold text-paper">{user.email}</span>. In this prototype emails go to the simulated outbox.
            </>
          }
        >
          <Switch checked={prefs.email} onChange={(v) => void save({ email: v })} label="Email reminders" />
        </Line>

        <div className="px-5 pt-4 pb-1 sm:px-6">
          <p className="text-[12px] font-bold tracking-wide text-paper-faint uppercase">Notify me about</p>
        </div>
        {EVENTS.map((event) => (
          <Line key={event.key} title={event.title} description={event.description}>
            <Switch
              checked={prefs.events[event.key]}
              onChange={(v) => void save({ events: { ...prefs.events, [event.key]: v } })}
              label={event.title}
            />
          </Line>
        ))}

        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <p className="flex-1 text-[12.5px] leading-relaxed text-paper-muted">
            Timing comes from your reminder settings below. Each reminder is sent once, through every channel that's on.
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={busy !== null}
              onClick={async () => {
                setBusy("replay");
                await clearAll();
                setBusy(null);
                notify({ tone: "info", title: "Notifications cleared", description: "Due reminders will be sent again within a minute." });
              }}
            >
              {busy === "replay" ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />} Replay (demo)
            </Button>
            <Button
              size="sm"
              disabled={busy !== null}
              onClick={async () => {
                setBusy("test");
                await sendTest();
                setBusy(null);
              }}
            >
              {busy === "test" ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />} Send a test
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
