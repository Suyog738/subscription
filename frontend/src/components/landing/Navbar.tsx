import { AnimatePresence, motion } from "framer-motion";
import { Home, Landmark, LayoutDashboard, ListChecks, Menu, Sparkles, X, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { LogoMark } from "../brand/Logo";
import { Button } from "../ui/Button";
import { ThemeToggle } from "../ui/ThemeToggle";

const links: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "features", label: "Features", icon: Sparkles },
  { id: "banks", label: "Banks", icon: Landmark },
  { id: "how-it-works", label: "How it works", icon: ListChecks },
  { id: "preview", label: "Dashboard", icon: LayoutDashboard },
];

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const onScroll = () => {
      const probe = window.innerHeight * 0.35;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= probe) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ids]);
  return active;
}

const ids = links.map((link) => link.id);

export function Navbar() {
  const { user } = useAuth();
  const active = useActiveSection(ids);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-40 flex justify-center px-3 sm:top-5">
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`pointer-events-auto relative flex w-full max-w-fit items-center gap-1 rounded-full border p-1.5 backdrop-blur-xl transition-[background-color,box-shadow,border-color] duration-300 max-md:max-w-none ${
          scrolled || open
            ? "border-line-strong bg-ink-900/85 shadow-float"
            : "border-line bg-ink-900/60 shadow-card"
        }`}
      >
        <a href="#home" className="flex items-center gap-2 rounded-full py-0.5 pr-3 pl-1" aria-label="Mohar home">
          <LogoMark className="size-8" />
          <span className="font-display text-[16px] font-bold tracking-[-0.02em]">Mohar</span>
        </a>

        <span className="mx-1 hidden h-6 w-px bg-line-strong md:block" />

        <ul className="hidden items-center md:flex">
          {links.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={`relative flex h-9 items-center gap-2 rounded-full px-3.5 text-[14px] font-medium transition-colors lg:px-4 ${
                    isActive ? "text-on-accent" : "text-paper-muted hover:text-paper"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-fern shadow-[0_6px_18px_-6px_var(--accent)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <Icon className="relative size-4" />
                  <span className="relative hidden lg:inline">{label}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <span className="mx-1 hidden h-6 w-px bg-line-strong md:block" />

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <div className="hidden items-center gap-1 md:flex">
            {user ? (
              <Button to="/app" className="h-9 rounded-full px-4">
                Open dashboard
              </Button>
            ) : (
              <>
                <Button to="/login" variant="ghost" className="h-9 rounded-full px-4">
                  Sign in
                </Button>
                <Button to="/login" className="h-9 rounded-full px-4">
                  Get started
                </Button>
              </>
            )}
          </div>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full text-paper-muted hover:bg-ink-800 hover:text-paper md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-x-0 top-[calc(100%+8px)] origin-top rounded-3xl border border-line-strong bg-ink-900 p-2 shadow-float md:hidden"
            >
              {links.map(({ id, label, icon: Icon }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium ${
                    active === id ? "bg-fern-deep text-fern" : "text-paper-muted"
                  }`}
                >
                  <Icon className="size-4" /> {label}
                </a>
              ))}
              <div className="mt-2 flex gap-2 border-t border-line p-2 pt-3">
                {user ? (
                  <Button to="/app" className="flex-1 rounded-full">
                    Open dashboard
                  </Button>
                ) : (
                  <>
                    <Button to="/login" variant="secondary" className="flex-1 rounded-full">
                      Sign in
                    </Button>
                    <Button to="/login" className="flex-1 rounded-full">
                      Get started
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
}
