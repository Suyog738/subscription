import { Link } from "react-router";

export const BRAND_NAME = "Mohar";

// A coin (mohar is an old word for a gold coin) stamped with an M, with a renewal
// arc sweeping around it: money that comes round again.
export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" className="fill-fern" />
      <path d="M8.2 10.4A10.4 10.4 0 0 1 25.1 9.7" fill="none" className="stroke-on-accent" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
      <path d="M26.4 13.2l-1.3-3.5-3.5 1.2" fill="none" className="stroke-on-accent" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
      <circle cx="16" cy="18" r="8.2" className="fill-on-accent" />
      <circle cx="16" cy="18" r="6.4" fill="none" className="stroke-fern" strokeWidth="1" opacity="0.45" />
      <path d="M12.6 21.2v-6.3l3.4 3.9 3.4-3.9v6.3" fill="none" className="stroke-fern" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ to = "/", className = "", compact = false }: { to?: string; className?: string; compact?: boolean }) {
  return (
    <Link to={to} className={`group inline-flex items-center gap-2 ${className}`} aria-label={`${BRAND_NAME} home`}>
      <LogoMark className="size-7 transition-transform duration-300 group-hover:rotate-[-8deg]" />
      {!compact && <span className="font-display text-[17px] font-bold tracking-[-0.02em] text-paper">{BRAND_NAME}</span>}
    </Link>
  );
}
