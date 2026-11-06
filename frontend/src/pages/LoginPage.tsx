import { motion } from "framer-motion";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import { Logo } from "../components/brand/Logo";
import { RenewalBadge } from "../components/dashboard/RenewalBadge";
import { ease } from "../components/landing/Reveal";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { ServiceMark } from "../components/ui/ServiceMark";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { DEMO_PASSWORD, DEMO_USER_BLURBS, DEMO_USERS } from "../data/demoUsers";
import { buildSeedSubscriptions } from "../data/seedSubscriptions";
import { getUpcomingRenewals } from "../utils/billing";
import { formatMoney, initials } from "../utils/format";

export function LoginPage() {
  const { signIn } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/app";

  async function attempt(emailValue: string, passwordValue: string, key: string) {
    setError(null);
    if (!emailValue.trim() || !passwordValue) {
      setError("Enter the email and password of a demo account.");
      return;
    }
    setPending(key);
    try {
      const user = await signIn(emailValue, passwordValue);
      notify({ title: `Signed in as ${user.name}` });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setPending(null);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void attempt(email, password, "form");
  }

  function signInAsDemo(userEmail: string, userId: string) {
    setEmail(userEmail);
    setPassword(DEMO_PASSWORD);
    void attempt(userEmail, DEMO_PASSWORD, userId);
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle className="border border-line bg-ink-900" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center py-12"
        >
          <h1 className="text-[34px] font-extrabold tracking-[-0.02em]">Welcome back</h1>
          <p className="mt-2 text-[15px] text-paper-muted">
            Mohar is a prototype for now. Use one of the demo accounts below.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="maya@mohar.app"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                leading={<Mail className="size-4" />}
                invalid={Boolean(error)}
              />
            </Field>
            <Field label="Password" htmlFor="password" hint={`Every demo account uses ${DEMO_PASSWORD}`}>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                leading={<Lock className="size-4" />}
                invalid={Boolean(error)}
              />
            </Field>
            {error && (
              <p role="alert" className="rounded-lg border border-clay/30 bg-clay-deep/50 px-3 py-2 text-[13px] text-clay">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full rounded-full" disabled={pending !== null}>
              {pending === "form" ? <Loader2 className="size-4 animate-spin" /> : "Sign in"}
            </Button>
          </form>

          <div className="mt-10">
            <div className="flex items-center gap-3">
              <span className="text-[12px] font-medium text-paper-faint">Demo accounts</span>
              <span className="h-px flex-1 bg-line" />
            </div>
            <ul className="mt-3 space-y-2">
              {DEMO_USERS.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => signInAsDemo(user.email, user.id)}
                    disabled={pending !== null}
                    className="card group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-[border-color,transform] hover:-translate-y-0.5 hover:border-fern/40 disabled:opacity-60"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full text-[12px] font-bold text-white" style={{ background: `var(--chart-${DEMO_USERS.indexOf(user) + 1})` }}>
                      {initials(user.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium">{user.name}</span>
                      <span className="block truncate text-[12.5px] text-paper-faint">{DEMO_USER_BLURBS[user.id]}</span>
                    </span>
                    {pending === user.id ? (
                      <Loader2 className="size-4 animate-spin text-paper-muted" />
                    ) : (
                      <ArrowRight className="size-4 text-paper-faint transition-transform group-hover:translate-x-0.5 group-hover:text-paper" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
        <p className="text-[12.5px] text-paper-faint">
          Demo data is saved in this browser only. Each account keeps its own list.
        </p>
      </div>

      <LoginAside />
    </div>
  );
}

function LoginAside() {
  const items = useMemo(() => getUpcomingRenewals(buildSeedSubscriptions("usr_sofia")).slice(0, 4), []);

  return (
    <aside className="relative hidden overflow-hidden border-l border-line bg-ink-850 lg:block">
      <div className="absolute inset-0 hero-grid" />
      <div className="absolute top-1/4 left-1/4 size-[480px] rounded-full bg-[radial-gradient(circle,var(--glow),transparent_65%)]" />
      <div className="relative flex h-full flex-col justify-center px-14 xl:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease }}
          className="mx-auto w-full max-w-[400px]"
        >
          <div className="overflow-hidden rounded-3xl border border-line-strong bg-ink-900 shadow-window">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="text-[13px] font-medium">Coming up</p>
              <p className="font-semibold tabular-nums text-[11px] text-paper-faint">next 30 days</p>
            </div>
            <ul className="divide-y divide-line">
              {items.map(({ subscription: sub, daysUntil }) => (
                <li key={sub.id} className="flex items-center gap-3 px-4 py-3">
                  <ServiceMark name={sub.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px]">{sub.name}</p>
                    <RenewalBadge daysUntil={daysUntil} reminderDays={7} />
                  </div>
                  <span className="font-semibold tabular-nums text-[12.5px]">{formatMoney(sub.price, sub.currency)}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-10 font-display text-[30px] leading-tight font-bold tracking-[-0.02em] text-balance">
            Every renewal, a week before it happens.
          </p>
          <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-paper-muted">
            Sofia's list, as an example. Sign in with any demo account to see their own subscriptions and totals.
          </p>
        </motion.div>
      </div>
    </aside>
  );
}
