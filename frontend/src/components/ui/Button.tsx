import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-fern text-on-accent shadow-[0_6px_20px_-8px_var(--accent)] hover:bg-fern-strong hover:shadow-[0_10px_28px_-8px_var(--accent)]",
  secondary: "border border-line-strong bg-ink-900 text-paper hover:border-paper-faint/50 hover:bg-ink-850",
  ghost: "text-paper-muted hover:bg-ink-800 hover:text-paper",
  danger: "bg-clay text-white hover:opacity-90 dark:text-ink-950",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-9 px-3.5 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined };
type RouterLinkProps = CommonProps & { to: string; href?: undefined; onClick?: () => void };
type AnchorProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; to?: undefined };

export function Button(props: ButtonProps | RouterLinkProps | AnchorProps) {
  const { variant = "primary", size = "md", className = "", children } = props;
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (props.to !== undefined) {
    return (
      <Link to={props.to} className={classes} onClick={props.onClick}>
        {children}
      </Link>
    );
  }

  if (props.href !== undefined) {
    const { variant: _v, size: _s, className: _c, children: _ch, ...anchorProps } = props;
    return (
      <a {...anchorProps} className={classes}>
        {children}
      </a>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, type = "button", ...buttonProps } = props;
  return (
    <button type={type} {...buttonProps} className={classes}>
      {children}
    </button>
  );
}
