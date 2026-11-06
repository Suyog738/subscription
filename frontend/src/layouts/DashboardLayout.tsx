import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, Landmark, Layers, LayoutGrid, LogOut, Mail, Menu, Plus, Settings, X, type LucideIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { Logo } from "../components/brand/Logo";
import { FastForwardMenu } from "../components/dashboard/FastForwardMenu";
import { NotificationsMenu } from "../components/dashboard/NotificationsMenu";
import { Button } from "../components/ui/Button";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { useAuth, useCurrentUser } from "../contexts/AuthContext";
import { BankProvider, useBank } from "../contexts/BankContext";
import { useDemoClock } from "../contexts/DemoClockContext";
import { EditorProvider, useEditor } from "../contexts/EditorContext";
import { NotificationsProvider, useNotifications } from "../contexts/NotificationsContext";
import { SubscriptionsProvider, useSubscriptions } from "../contexts/SubscriptionsContext";
import { useToast } from "../contexts/ToastContext";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { initials } from "../utils/format";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const NAV: NavItem[] = [
  { to: "/app", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/app/subscriptions", label: "Subscriptions", icon: Layers },
  { to: "/app/renewals", label: "Upcoming renewals", icon: CalendarClock },
  { to: "/app/bank", label: "Bank & detection", icon: Landmark },
  { to: "/app/outbox", label: "Email outbox", icon: Mail },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

const TITLES: Record<string, string> = {
  "/app": "Overview",
  "/app/subscriptions": "Subscriptions",
  "/app/renewals": "Upcoming renewals",
  "/app/bank": "Bank & detection",
  "/app/outbox": "Email outbox",
  "/app/settings": "Settings",
};

export function DashboardLayout() {
  const user = useCurrentUser();
  const { offset } = useDemoClock();
  // Changing the demo clock remounts the data providers, so every derived value,
  // bank catch-up and reminder check runs again for the new "today".
  return (
    <SubscriptionsProvider key={`${user.id}:${offset}`} user={user}>
      <BankProvider user={user}>
      <EditorProvider>
        <NotificationsProvider user={user}>
          <Shell />
        </NotificationsProvider>
      </EditorProvider>
      </BankProvider>
    </SubscriptionsProvider>
  );
}

function Shell() {
  const location = useLocation();
  const { openCreate } = useEditor();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const path = location.pathname.replace(/\/$/, "");
  const title = TITLES[path] ?? (path.startsWith("/app/subscriptions/") ? "Subscription" : "Overview");

  useEffect(() => {
    setDrawerOpen(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  useEffect(() => {
    document.title = `${title} · Mohar`;
  }, [title]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-ink-900 lg:flex">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col border-r border-line bg-ink-900"
            >
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="absolute top-4 right-3 rounded-md p-1.5 text-paper-faint hover:text-paper"
                aria-label="Close navigation"
              >
                <X className="size-4" />
              </button>
              <SidebarContent />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-ink-950/80 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="-ml-1.5 rounded-md p-1.5 text-paper-muted hover:text-paper lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>
            <h1 className="text-[16px] font-bold tracking-[-0.01em]">{title}</h1>
            <div className="ml-auto flex items-center gap-2">
              <FastForwardMenu />
              <ThemeToggle className="border border-line bg-ink-900" />
              <NotificationsMenu />
              <span className="hidden sm:contents">
                <Button onClick={() => openCreate()}>
                  <Plus className="size-4" strokeWidth={2.4} /> Add subscription
                </Button>
              </span>
              <span className="contents sm:hidden">
                <Button onClick={() => openCreate()} className="w-9 px-0" aria-label="Add subscription">
                  <Plus className="size-4" strokeWidth={2.4} />
                </Button>
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <DataGate>
            <Outlet />
          </DataGate>
        </main>
      </div>
    </div>
  );
}

function DataGate({ children }: { children: ReactNode }) {
  const { loading, error, reload } = useSubscriptions();

  if (error) {
    return (
      <div className="rounded-xl border border-line px-6 py-16 text-center">
        <p className="font-medium">Couldn't load your subscriptions.</p>
        <p className="mt-1 text-sm text-paper-muted">{error}</p>
        <Button variant="secondary" className="mt-6" onClick={reload}>
          Try again
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6" aria-label="Loading">
        <div className="h-7 w-56 rounded-md bg-ink-850" />
        <div className="h-28 rounded-xl bg-ink-900" />
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="h-80 rounded-xl bg-ink-900" />
          <div className="h-80 rounded-xl bg-ink-900" />
        </div>
      </div>
    );
  }

  return children;
}

function SidebarContent() {
  const user = useCurrentUser();
  const { signOut } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const { summary, withinReminder } = useDashboardStats();
  const { connection, suggestions, trials, unnamed } = useBank();
  const findings = suggestions.length + trials.length + unnamed.length;
  const { unreadEmails } = useNotifications();

  const counts: Record<string, number | undefined> = {
    "/app/subscriptions": summary.count,
    "/app/renewals": withinReminder.length || undefined,
    "/app/bank": connection ? findings || undefined : undefined,
    "/app/outbox": unreadEmails || undefined,
  };

  async function handleSignOut() {
    await signOut();
    notify({ tone: "info", title: "Signed out", description: "Your demo data is still saved in this browser." });
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo to="/app" />
      </div>

      <nav className="flex-1 space-y-0.5 px-3 pt-4" aria-label="Dashboard">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end ?? to === "/app"}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition-colors ${
                isActive ? "bg-fern-deep font-semibold text-fern" : "font-medium text-paper-muted hover:bg-ink-850 hover:text-paper"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`size-[18px] ${isActive ? "text-fern" : "text-paper-faint group-hover:text-paper-muted"}`} />
                <span className="flex-1">{label}</span>
                {counts[to] !== undefined && (
                  <span
                    className={`text-[11.5px] font-semibold tabular-nums ${
                      to === "/app/renewals" ? "rounded-md bg-amber-deep px-1.5 font-bold text-amber" : to === "/app/bank" || to === "/app/outbox" ? "rounded-md bg-fern-deep px-1.5 font-bold text-fern" : "text-paper-faint"
                    }`}
                  >
                    {counts[to]}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mx-3 mb-3 rounded-xl border border-dashed border-line-strong bg-ink-850 px-3 py-2.5">
        <p className="text-[12px] leading-snug text-paper-faint">
          Demo workspace. Changes are saved in this browser only.
        </p>
      </div>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-fern text-[12px] font-bold text-on-accent">
            {initials(user.name)}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13.5px] font-medium">{user.name}</p>
            <p className="truncate text-[12px] text-paper-faint">{user.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px] text-paper-muted transition-colors hover:bg-ink-850 hover:text-paper"
        >
          <LogOut className="size-4 text-paper-faint" />
          Log out
        </button>
      </div>
    </div>
  );
}
