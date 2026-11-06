import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { BellRing, CalendarCheck2, TrendingDown } from "lucide-react";
import { useEffect, useMemo, useState, type PointerEvent, type ReactNode } from "react";
import { buildSeedSubscriptions } from "../../data/seedSubscriptions";
import { getUpcomingRenewals, spendingByCategory, summarizeSpending } from "../../utils/billing";
import { formatMoney, formatRelativeDays } from "../../utils/format";
import { AnimatedNumber, CHART_COLORS, CHART_OTHER, Donut } from "../charts/primitives";
import { ServiceMark } from "../ui/ServiceMark";

const ORBIT = ["Spotify", "Netflix", "Figma", "GitHub", "Notion", "Headspace"];

function useParallax(strength: number, x: MotionValue<number>, y: MotionValue<number>) {
  return {
    x: useTransform(x, (v) => v * strength),
    y: useTransform(y, (v) => v * strength),
  };
}

function FloatCard({ children, className, delay, drift = 8 }: { children: ReactNode; className: string; delay: number; drift?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute z-20 ${className}`}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -drift, 0] }}
        transition={{ duration: 5 + delay, repeat: Infinity, ease: "easeInOut" }}
        className="rounded-2xl border border-line bg-ink-900/95 p-3 shadow-float backdrop-blur"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function HeroVisual() {
  const reduce = useReducedMotion();
  const data = useMemo(() => {
    const subs = buildSeedSubscriptions("usr_maya");
    const categories = spendingByCategory(subs, "USD");
    return {
      summary: summarizeSpending(subs, "USD"),
      upcoming: getUpcomingRenewals(subs).slice(0, 4),
      segments: [
        ...categories.slice(0, 4).map((c, i) => ({ key: c.category, value: c.monthly, color: CHART_COLORS[i] })),
        { key: "Other", value: categories.slice(4).reduce((s, c) => s + c.monthly, 0), color: CHART_OTHER },
      ],
      top: categories.slice(0, 3),
    };
  }, []);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 3200);
    return () => window.clearInterval(id);
  }, [reduce]);
  const renewal = data.upcoming[tick % data.upcoming.length];

  const mx = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const my = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const far = useParallax(-14, mx, my);
  const mid = useParallax(10, mx, my);
  const near = useParallax(22, mx, my);

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    mx.set((event.clientX - rect.left) / rect.width - 0.5);
    my.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <div
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      className="relative mx-auto aspect-square w-full max-w-[540px]"
      aria-hidden="true"
    >
      <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,var(--glow),transparent_68%)] blur-2xl" />

      <motion.div style={far} className="absolute inset-0">
        <motion.div
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[2%] rounded-full border border-dashed border-fern/25"
        />
      </motion.div>

      <motion.div style={mid} className="absolute inset-[13%]">
        <div className="absolute inset-0 rounded-full border border-line-strong" />
        <motion.div
          className="absolute inset-0"
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
        >
          {ORBIT.map((name, index) => {
            const angle = (index / ORBIT.length) * Math.PI * 2;
            return (
              <div
                key={name}
                className="absolute"
                style={{ left: `${50 + 50 * Math.cos(angle)}%`, top: `${50 + 50 * Math.sin(angle)}%`, transform: "translate(-50%, -50%)" }}
              >
                <motion.div
                  animate={reduce ? undefined : { rotate: -360 }}
                  transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
                  className="rounded-2xl border border-line bg-ink-900 p-2 shadow-float"
                >
                  <ServiceMark name={name} size="md" />
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </motion.div>

      <motion.div style={mid} className="absolute inset-[27%] z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative grid size-full place-items-center rounded-full border border-line bg-ink-900 shadow-window"
        >
          <div className="absolute inset-[7%]">
            <Donut segments={data.segments} size={200} thickness={11} delay={0.6} className="size-full" />
          </div>
          <div className="relative text-center">
            <p className="text-[11px] font-medium tracking-wide text-paper-faint uppercase">Per month</p>
            <p className="font-display text-[26px] font-bold tracking-tight sm:text-[30px]">
              <AnimatedNumber value={data.summary.monthly} format={(n) => formatMoney(n, "USD")} delay={0.5} />
            </p>
            <p className="text-[11.5px] text-paper-muted">{data.summary.count} subscriptions</p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div style={near} className="pointer-events-none absolute inset-0">
        <FloatCard className="top-[4%] right-[-2%] w-[210px] sm:right-[-6%]" delay={0.9}>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-amber">
            <BellRing className="size-3.5" /> Reminder
          </div>
          <div className="relative mt-2 h-[38px] overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={renewal.subscription.id}
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -24, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-2.5"
              >
                <ServiceMark name={renewal.subscription.name} size="sm" />
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-[12.5px] font-semibold">{renewal.subscription.name}</p>
                  <p className="text-[11.5px] text-paper-muted">
                    {formatRelativeDays(renewal.daysUntil)} · {formatMoney(renewal.subscription.price, "USD")}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </FloatCard>

        <FloatCard className="bottom-[8%] left-[-4%] w-[196px] sm:left-[-8%]" delay={1.1} drift={10}>
          <p className="text-[11px] font-semibold text-paper-faint">Where it goes</p>
          <ul className="mt-2 space-y-1.5">
            {data.top.map((item, index) => (
              <li key={item.category} className="flex items-center gap-2 text-[12px]">
                <span className="size-2 rounded-full" style={{ background: CHART_COLORS[index] }} />
                <span className="flex-1 text-paper-muted">{item.category}</span>
                <span className="font-semibold tabular-nums">{formatMoney(item.monthly, "USD", true)}</span>
              </li>
            ))}
          </ul>
        </FloatCard>

        <FloatCard className="right-[-3%] bottom-[18%] sm:right-[-4%]" delay={1.3} drift={6}>
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-xl bg-fern-deep text-fern">
              <TrendingDown className="size-4" />
            </span>
            <div className="leading-tight">
              <p className="text-[12.5px] font-semibold">Yearly plans</p>
              <p className="text-[11.5px] text-paper-muted">split across 12 months</p>
            </div>
          </div>
        </FloatCard>

        <FloatCard className="top-[20%] left-[-2%] hidden sm:block" delay={1.5} drift={7}>
          <div className="flex items-center gap-2 text-[12px] font-semibold">
            <CalendarCheck2 className="size-4 text-fern" /> 7-day heads-up
          </div>
        </FloatCard>
      </motion.div>
    </div>
  );
}
