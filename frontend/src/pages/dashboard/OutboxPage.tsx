import { ArrowLeft, Info, Mail, MailOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { LogoMark } from "../../components/brand/Logo";
import { timeAgo } from "../../components/dashboard/NotificationsMenu";
import { EmptyState } from "../../components/dashboard/EmptyState";
import { Button } from "../../components/ui/Button";
import { useCurrentUser } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationsContext";
import { useSubscriptions } from "../../contexts/SubscriptionsContext";
import type { EmailMessage } from "../../types";

export function OutboxPage() {
  const { emails, markEmailRead } = useNotifications();
  const { settings } = useSubscriptions();
  const user = useCurrentUser();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileReading, setMobileReading] = useState(false);
  const selected = emails.find((e) => e.id === selectedId) ?? emails[0];

  useEffect(() => {
    if (selected && !selected.read) void markEmailRead(selected.id);
  }, [selected, markEmailRead]);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-2xl border border-chart-4/25 bg-chart-4/10 px-4 py-3">
        <Info className="mt-0.5 size-4 shrink-0 text-chart-4" />
        <p className="text-[13.5px] leading-relaxed">
          <strong>Simulated outbox.</strong> This prototype doesn't send real email. Each message here is exactly what would go to{" "}
          <strong>{user.email}</strong> once the backend's email service is connected.
          {!settings.notifications.email && (
            <>
              {" "}
              Email reminders are currently <strong>off</strong>.{" "}
              <Link to="/app/settings" className="font-bold text-fern underline-offset-2 hover:underline">
                Turn them on
              </Link>
              .
            </>
          )}
        </p>
      </div>

      {emails.length === 0 ? (
        <EmptyState
          title="No emails yet"
          body="When a reminder is due and email reminders are on, the email shows up here."
          action={
            <Button to="/app/settings" variant="secondary">
              Notification settings
            </Button>
          }
        />
      ) : (
        <div className="card grid overflow-hidden rounded-2xl lg:h-[calc(100dvh-14rem)] lg:min-h-[560px] lg:grid-cols-[360px_minmax(0,1fr)]">
          <ul className={`divide-y divide-line overflow-y-auto border-line lg:border-r ${mobileReading ? "hidden lg:block" : ""}`}>
            {emails.map((email) => {
              const active = selected?.id === email.id;
              return (
                <li key={email.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(email.id);
                      setMobileReading(true);
                    }}
                    className={`flex w-full gap-3 px-4 py-3.5 text-left transition-colors ${active ? "bg-fern-deep/50" : "hover:bg-ink-850"}`}
                  >
                    <span className="mt-0.5 shrink-0 text-paper-faint">
                      {email.read ? <MailOpen className="size-4" /> : <Mail className="size-4 text-fern" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={`truncate text-[13px] ${email.read ? "font-medium text-paper-muted" : "font-bold"}`}>Mohar</span>
                        <span className="shrink-0 text-[11px] text-paper-faint">{timeAgo(email.sentAt)}</span>
                      </span>
                      <span className={`block truncate text-[13.5px] ${email.read ? "" : "font-bold"}`}>{email.subject}</span>
                      <span className="block truncate text-[12.5px] text-paper-faint">{email.preview}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className={`min-w-0 overflow-y-auto bg-ink-850/40 ${mobileReading ? "" : "hidden lg:block"}`}>
            {selected && <EmailView email={selected} onBack={() => setMobileReading(false)} />}
          </div>
        </div>
      )}
    </div>
  );
}

function EmailView({ email, onBack }: { email: EmailMessage; onBack: () => void }) {
  const user = useCurrentUser();
  return (
    <article>
      <header className="border-b border-line bg-ink-900 px-5 py-4 sm:px-6">
        <button type="button" onClick={onBack} className="mb-3 flex items-center gap-1 text-[13px] font-semibold text-paper-muted lg:hidden">
          <ArrowLeft className="size-4" /> All emails
        </button>
        <h2 className="text-[18px] leading-snug font-bold">{email.subject}</h2>
        <dl className="mt-2 grid grid-cols-[48px_minmax(0,1fr)] gap-y-0.5 text-[12.5px]">
          <dt className="text-paper-faint">From</dt>
          <dd className="truncate">{email.from}</dd>
          <dt className="text-paper-faint">To</dt>
          <dd className="truncate">{email.to}</dd>
          <dt className="text-paper-faint">Sent</dt>
          <dd>{new Date(email.sentAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</dd>
        </dl>
      </header>

      {/* The email body, styled the way an email client would render the HTML template. */}
      <div className="px-3 py-6 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-[560px] overflow-hidden rounded-2xl border border-line bg-white text-[#0e1c19] shadow-card">
          <div className="flex items-center gap-2 bg-[#0c9474] px-6 py-4 text-white">
            <LogoMark className="size-7 [&_rect]:fill-white [&_path]:stroke-[#0c9474] [&_circle]:fill-[#0c9474]" />
            <span className="font-display text-[17px] font-bold">Mohar</span>
          </div>
          <div className="px-6 py-7 sm:px-8">
            <p className="text-[14px] text-[#4b5d58]">Hi {user.name.split(" ")[0]},</p>
            <h3 className="mt-3 font-display text-[22px] leading-tight font-bold">{email.heading}</h3>
            {email.paragraphs.map((p) => (
              <p key={p} className="mt-3 text-[14.5px] leading-relaxed text-[#33433f]">
                {p}
              </p>
            ))}
            {email.details && email.details.length > 0 && (
              <table className="mt-5 w-full overflow-hidden rounded-xl text-[13.5px]">
                <tbody>
                  {email.details.map(([label, value]) => (
                    <tr key={label} className="border-b border-[#e6ece9] last:border-0">
                      <td className="bg-[#f5f8f7] px-3 py-2 text-[#4b5d58]">{label}</td>
                      <td className="bg-[#f5f8f7] px-3 py-2 text-right font-semibold">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <Link
              to={email.cta.link}
              className="mt-6 inline-flex rounded-full bg-[#0c9474] px-5 py-2.5 text-[14px] font-bold text-white hover:bg-[#087a60]"
            >
              {email.cta.label}
            </Link>
          </div>
          <div className="border-t border-[#e6ece9] bg-[#f5f8f7] px-6 py-4 text-[11.5px] leading-relaxed text-[#7d8d88] sm:px-8">
            You're getting this because email reminders are on for {email.to}.{" "}
            <Link to="/app/settings" className="font-semibold text-[#0c9474] underline">
              Change notification settings
            </Link>
            . Mohar never asks for your password or card details by email.
          </div>
        </div>
      </div>
    </article>
  );
}
