import { Loader2, LogOut, RotateCcw } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { Segmented, Select } from "../../components/ui/Field";
import { useAuth, useCurrentUser } from "../../contexts/AuthContext";
import { useSubscriptions } from "../../contexts/SubscriptionsContext";
import { useToast } from "../../contexts/ToastContext";
import { config } from "../../services/config";
import { CURRENCIES, type CurrencyCode } from "../../types";
import { CURRENCY_LABELS } from "../../utils/currency";
import { initials } from "../../utils/format";

const REMINDER_OPTIONS = ["1", "3", "7", "14"] as const;
type ReminderOption = (typeof REMINDER_OPTIONS)[number];

function Row({ title, description, children }: { title: string; description: ReactNode; children: ReactNode }) {
  return (
    <div className="grid gap-4 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,280px)] sm:items-center sm:gap-8 sm:px-6">
      <div>
        <p className="text-[14px] font-medium">{title}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-paper-muted">{description}</p>
      </div>
      <div className="sm:justify-self-end">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const user = useCurrentUser();
  const { signOut } = useAuth();
  const { settings, updateSettings, resetDemoData } = useSubscriptions();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function changeCurrency(code: CurrencyCode) {
    await updateSettings({ displayCurrency: code });
    notify({ title: "Display currency updated", description: `Totals are now shown in ${code}.` });
  }

  async function changeReminder(value: ReminderOption) {
    await updateSettings({ reminderDays: Number(value) });
    notify({ title: "Reminder window updated", description: `You'll see renewals ${value} ${value === "1" ? "day" : "days"} ahead.` });
  }

  async function reset() {
    setResetting(true);
    await resetDemoData();
    setResetting(false);
    setConfirmReset(false);
    notify({ title: "Demo data restored", description: "Your list is back to the original sample." });
  }

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="max-w-3xl space-y-8">
      <section>
        <h2 className="mb-3 text-[13px] font-medium text-paper-faint">Account</h2>
        <div className="card divide-y divide-line rounded-2xl">
          <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
            <span className="grid size-11 place-items-center rounded-full bg-ink-700 text-[14px] font-semibold">
              {initials(user.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium">{user.name}</p>
              <p className="truncate text-[13px] text-paper-muted">{user.email}</p>
            </div>
            <span className="rounded-full border border-line-strong px-2.5 py-0.5 text-[12px] text-paper-muted">Demo account</span>
          </div>
          <Row title="Sign out" description="You'll go back to the sign-in page. Your data stays saved in this browser.">
            <Button variant="secondary" onClick={handleSignOut}>
              <LogOut className="size-4" /> Log out
            </Button>
          </Row>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[13px] font-medium text-paper-faint">Preferences</h2>
        <div className="card divide-y divide-line rounded-2xl">
          <Row
            title="Display currency"
            description="Totals on the dashboard are shown in this currency. Other currencies are converted with fixed, approximate rates."
          >
            <div className="w-full sm:w-60">
              <Select
                aria-label="Display currency"
                value={settings.displayCurrency}
                onChange={(event) => void changeCurrency(event.target.value as CurrencyCode)}
              >
                {CURRENCIES.map((code) => (
                  <option key={code} value={code}>
                    {code} · {CURRENCY_LABELS[code]}
                  </option>
                ))}
              </Select>
            </div>
          </Row>
          <Row
            title="Reminder window"
            description="How many days before a renewal it shows up in your reminders and gets marked on the dashboard."
          >
            <Segmented<ReminderOption>
              label="Reminder window"
              value={String(settings.reminderDays) as ReminderOption}
              onChange={(value) => void changeReminder(value)}
              options={REMINDER_OPTIONS.map((value) => ({ value, label: `${value}d` }))}
              className="flex w-full sm:w-auto"
            />
          </Row>
          <Row
            title="Email reminders"
            description="Reminders currently appear inside the app only. Email delivery will come with the backend notification service."
          >
            <span className="inline-flex rounded-full bg-ink-800 px-2.5 py-1 text-[12px] text-paper-muted">Not available yet</span>
          </Row>
        </div>
      </section>

      {config.useMockApi && (
        <section>
          <h2 className="mb-3 text-[13px] font-medium text-paper-faint">Demo data</h2>
          <div className="card rounded-2xl">
            <Row
              title="Restore sample subscriptions"
              description={`Replaces ${user.name.split(" ")[0]}'s list with the original sample data. Other demo accounts aren't affected.`}
            >
              <Button variant="secondary" onClick={() => setConfirmReset(true)}>
                <RotateCcw className="size-4" /> Restore
              </Button>
            </Row>
          </div>
        </section>
      )}

      <Dialog open={confirmReset} onClose={() => setConfirmReset(false)} title="Restore sample data?" size="sm">
        <p className="text-sm leading-relaxed text-paper-muted">
          Anything you've added, edited or deleted on this account will be replaced with the original demo list.
        </p>
        <div className="mt-6 flex gap-2 sm:justify-end">
          <Button variant="secondary" className="flex-1 sm:flex-none" onClick={() => setConfirmReset(false)} data-autofocus>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1 sm:flex-none" onClick={reset} disabled={resetting}>
            {resetting ? <Loader2 className="size-4 animate-spin" /> : "Restore"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
