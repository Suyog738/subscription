import { Landmark, Loader2, LogOut, RotateCcw } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { NotificationSettings } from "../../components/dashboard/NotificationSettings";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { Segmented, Select } from "../../components/ui/Field";
import { useAuth, useCurrentUser } from "../../contexts/AuthContext";
import { useBank } from "../../contexts/BankContext";
import { useSubscriptions } from "../../contexts/SubscriptionsContext";
import { useToast } from "../../contexts/ToastContext";
import { config } from "../../services/config";
import { CURRENCIES, type CurrencyCode, type UserSettings } from "../../types";
import { CURRENCY_LABELS } from "../../utils/currency";
import { initials } from "../../utils/format";

type ReminderKey = "reminderDays" | "yearlyReminderDays" | "trialReminderDays";

const REMINDER_ROWS: { key: ReminderKey; title: string; description: string; options: string[] }[] = [
  { key: "reminderDays", title: "Monthly renewals", description: "Notice before a regular monthly charge.", options: ["1", "3", "7"] },
  { key: "yearlyReminderDays", title: "Yearly renewals", description: "Bigger charges deserve more notice.", options: ["7", "14", "30"] },
  { key: "trialReminderDays", title: "Free trials", description: "Notice before a trial turns into a paid plan.", options: ["3", "7", "14"] },
];

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
  const { connection } = useBank();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function changeCurrency(code: CurrencyCode) {
    await updateSettings({ displayCurrency: code });
    notify({ title: "Display currency updated", description: `Totals are now shown in ${code}.` });
  }

  async function changeReminder(key: ReminderKey, value: string) {
    await updateSettings({ [key]: Number(value) } as Partial<UserSettings>);
    notify({ title: "Reminder timing updated", description: `${REMINDER_ROWS.find((r) => r.key === key)?.title}: ${value} days before.` });
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
            <span className="grid size-11 place-items-center rounded-full bg-fern text-[14px] font-bold text-on-accent">
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
        <h2 className="mb-3 text-[13px] font-medium text-paper-faint">Bank</h2>
        <div className="card rounded-2xl">
          <Row
            title={connection ? `Connected to ${connection.bankName}` : "No bank connected"}
            description={
              connection
                ? `${connection.accountName} ${connection.accountMask}. Read-only: Mohar can see payments and the balance, nothing else.`
                : "Connect your bank so Mohar can find subscriptions, trials and price rises in your payments."
            }
          >
            <Button to="/app/bank" variant="secondary">
              <Landmark className="size-4" /> {connection ? "Manage" : "Connect"}
            </Button>
          </Row>
        </div>
      </section>

      <NotificationSettings />

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
          {REMINDER_ROWS.map((row) => (
            <Row key={row.key} title={`Remind me: ${row.title.toLowerCase()}`} description={row.description}>
              <Segmented<string>
                label={row.title}
                value={String(settings[row.key])}
                onChange={(value) => void changeReminder(row.key, value)}
                options={row.options.map((value) => ({ value, label: `${value} days` }))}
                className="flex w-full sm:w-auto"
              />
            </Row>
          ))}
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
