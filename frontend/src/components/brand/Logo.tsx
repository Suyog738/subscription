import { Link } from "react-router";

export const BRAND_NAME = "Renewly";

export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" className="fill-fern" />
      <path
        d="M23.5 12.2A8.5 8.5 0 1 0 24.5 16"
        fill="none"
        className="stroke-on-accent"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <circle cx="24.5" cy="16" r="2.3" className="fill-on-accent" />
    </svg>
  );
}

export function Logo({ to = "/", className = "", compact = false }: { to?: string; className?: string; compact?: boolean }) {
  return (
    <Link to={to} className={`group inline-flex items-center gap-2 ${className}`} aria-label={`${BRAND_NAME} home`}>
      <LogoMark />
      {!compact && (
        <span className="font-display text-[17px] font-bold tracking-[-0.02em] text-paper">{BRAND_NAME}</span>
      )}
    </Link>
  );
}
