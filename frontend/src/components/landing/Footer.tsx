import { Link } from "react-router";
import { Logo } from "../brand/Logo";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Sign in", to: "/login" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink-900/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1fr_auto]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-[14px] leading-relaxed text-paper-muted">
            Subscription tracking for people who'd rather not think about it every month.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-14 sm:gap-20">
          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-[12px] font-bold tracking-[0.14em] text-paper-faint uppercase">{column.title}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {"to" in link && link.to ? (
                      <Link to={link.to} className="text-[14px] text-paper-muted transition-colors hover:text-paper">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-[14px] text-paper-muted transition-colors hover:text-paper">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-[13px] text-paper-faint sm:flex-row sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} Mohar. All rights reserved.</p>
          <p>A working prototype. Data stays in your browser.</p>
        </div>
      </div>
    </footer>
  );
}
