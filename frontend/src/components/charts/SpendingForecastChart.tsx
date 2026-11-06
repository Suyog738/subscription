import { AnimatePresence, motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import type { CurrencyCode } from "../../types";
import type { MonthForecast } from "../../utils/billing";
import { formatMoney } from "../../utils/format";

function niceMax(value: number): number {
  if (value <= 0) return 10;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const steps = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  const step = steps.find((s) => s * magnitude >= value) ?? 10;
  return step * magnitude;
}

export function SpendingForecastChart({
  data,
  currency,
  height = 220,
  compact = false,
}: {
  data: MonthForecast[];
  currency: CurrencyCode;
  height?: number;
  compact?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.total)));
  const ticks = [max, max / 2, 0];

  return (
    <div ref={ref}>
      <div className="relative flex gap-3" style={{ height }}>
        {!compact && (
          <div className="flex w-12 shrink-0 flex-col justify-between pb-6 text-right text-[11px] text-paper-faint tabular-nums">
            {ticks.map((tick) => (
              <span key={tick} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">
                {formatMoney(tick, currency, true)}
              </span>
            ))}
          </div>
        )}

        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between">
            {ticks.map((tick) => (
              <span key={tick} className={`h-px w-full ${tick === 0 ? "bg-line-strong" : "border-t border-dashed border-line"}`} />
            ))}
          </div>

          <div className="absolute inset-0 flex items-stretch gap-[3px] sm:gap-1.5">
            {data.map((month, index) => {
              const monthlyH = (month.monthly / max) * 100;
              const yearlyH = (month.yearly / max) * 100;
              const active = hover === index;
              return (
                <div
                  key={month.key}
                  className="group relative flex flex-1 flex-col"
                  onPointerEnter={() => setHover(index)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(index)}
                  onBlur={() => setHover(null)}
                  tabIndex={compact ? -1 : 0}
                  aria-label={`${month.label}: ${formatMoney(month.total, currency)}`}
                >
                  <div className={`relative flex-1 rounded-lg transition-colors ${active ? "bg-ink-800" : ""}`}>
                    <div className="absolute inset-x-[14%] bottom-0 flex h-full flex-col-reverse items-stretch gap-[2px] sm:inset-x-[20%]">
                      <motion.div
                        className="bg-chart-1"
                        style={{ height: `${monthlyH}%`, originY: 1, borderTopLeftRadius: yearlyH ? 0 : 4, borderTopRightRadius: yearlyH ? 0 : 4 }}
                        initial={{ scaleY: 0 }}
                        animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
                        transition={{ duration: 0.7, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                      />
                      {month.yearly > 0 && (
                        <motion.div
                          className="rounded-t-[4px] bg-chart-2"
                          style={{ height: `${yearlyH}%`, originY: 1 }}
                          initial={{ scaleY: 0, opacity: 0 }}
                          animate={inView ? { scaleY: 1, opacity: 1 } : { scaleY: 0 }}
                          transition={{ duration: 0.6, delay: 0.3 + index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                        />
                      )}
                    </div>
                  </div>
                  <span
                    className={`mt-1.5 h-[18px] text-center text-[10.5px] font-semibold sm:text-[11px] ${
                      month.isCurrent ? "text-fern" : active ? "text-paper" : "text-paper-faint"
                    }`}
                  >
                    {compact ? month.label[0] : month.label}
                  </span>

                  <AnimatePresence>
                    {active && !compact && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className={`pointer-events-none absolute bottom-[calc(100%-12px)] z-20 w-52 rounded-xl border border-line-strong bg-ink-900 p-3 shadow-float ${
                          index > data.length / 2 ? "right-0" : "left-0"
                        }`}
                      >
                        <p className="text-[12px] font-semibold text-paper-faint">
                          {month.label} {month.isCurrent ? "· rest of this month" : ""}
                        </p>
                        <p className="mt-0.5 font-display text-lg font-bold tabular-nums">{formatMoney(month.total, currency)}</p>
                        <div className="mt-2 space-y-1 text-[12px]">
                          <p className="flex items-center gap-2">
                            <span className="size-2 rounded-sm bg-chart-1" />
                            <span className="flex-1 text-paper-muted">Monthly plans</span>
                            <span className="tabular-nums">{formatMoney(month.monthly, currency)}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="size-2 rounded-sm bg-chart-2" />
                            <span className="flex-1 text-paper-muted">Yearly renewals</span>
                            <span className="tabular-nums">{formatMoney(month.yearly, currency)}</span>
                          </p>
                        </div>
                        {month.yearlyNames.length > 0 && (
                          <p className="mt-2 border-t border-line pt-2 text-[11.5px] leading-snug text-paper-muted">
                            {month.yearlyNames.join(", ")}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <table className="sr-only">
        <caption>Projected charges per month</caption>
        <thead>
          <tr>
            <th>Month</th>
            <th>Monthly plans</th>
            <th>Yearly renewals</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((month) => (
            <tr key={month.key}>
              <td>{month.label}</td>
              <td>{formatMoney(month.monthly, currency)}</td>
              <td>{formatMoney(month.yearly, currency)}</td>
              <td>{formatMoney(month.total, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChartLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 text-[12px] text-paper-muted">
          <span className="size-2.5 rounded-[3px]" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
