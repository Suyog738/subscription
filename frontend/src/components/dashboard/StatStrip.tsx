import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface Stat {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  icon: LucideIcon;
  tone: 1 | 2 | 3 | 4 | 5;
}

export function StatStrip({ stats }: { stats: Stat[] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="card group relative min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5"
        >
          <div
            className="absolute -top-10 -right-10 size-28 rounded-full opacity-60 blur-2xl transition-opacity group-hover:opacity-100"
            style={{ background: `color-mix(in oklab, var(--chart-${stat.tone}) 22%, transparent)` }}
          />
          <div className="relative flex items-center justify-between gap-2">
            <dt className="text-[12.5px] leading-tight font-semibold text-paper-muted">{stat.label}</dt>
            <span
              className="grid size-8 shrink-0 place-items-center rounded-xl"
              style={{
                color: `var(--chart-${stat.tone})`,
                background: `color-mix(in oklab, var(--chart-${stat.tone}) 15%, var(--surface))`,
              }}
            >
              <stat.icon className="size-4" />
            </span>
          </div>
          <dd className="relative mt-2 truncate font-display text-[24px] font-bold tracking-[-0.02em] tabular-nums sm:text-[28px]">
            {stat.value}
          </dd>
          {stat.note && <dd className="relative mt-0.5 line-clamp-2 text-[12px] leading-snug text-paper-faint">{stat.note}</dd>}
        </motion.div>
      ))}
    </dl>
  );
}
