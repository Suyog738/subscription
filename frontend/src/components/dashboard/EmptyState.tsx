import type { ReactNode } from "react";

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-line-strong bg-ink-900 px-6 py-14 text-center">
      <div className="absolute inset-0 soft-grid opacity-60 [mask-image:radial-gradient(ellipse_50%_70%_at_50%_50%,#000,transparent)]" />
      <div className="relative">
        <p className="text-[15px] font-medium">{title}</p>
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-paper-muted">{body}</p>
        {action && <div className="mt-6 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}

export function Panel({
  title,
  aside,
  children,
  className = "",
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card overflow-hidden rounded-2xl ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
        <h2 className="text-[15px] font-bold tracking-[-0.01em]">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}
