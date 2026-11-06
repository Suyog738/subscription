import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { Insight, InsightTone } from "../../hooks/useInsights";

const TONES: Record<InsightTone, { chip: string; bar: string }> = {
  danger: { chip: "bg-clay-deep text-clay", bar: "bg-clay" },
  warning: { chip: "bg-amber-deep text-amber", bar: "bg-amber" },
  info: { chip: "bg-ink-800 text-paper-muted", bar: "bg-chart-4" },
  good: { chip: "bg-fern-deep text-fern", bar: "bg-fern" },
};

const VISIBLE = 3;

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  const [expanded, setExpanded] = useState(false);
  if (insights.length === 0) return null;
  const shown = expanded ? insights : insights.slice(0, VISIBLE);

  return (
    <section className="mb-5" aria-label="Worth a look">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[15px] font-bold">
          Worth a look
          <span className="rounded-full bg-ink-800 px-2 py-0.5 text-[11.5px] font-bold text-paper-muted">{insights.length}</span>
        </h2>
        {insights.length > VISIBLE && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-[13px] font-semibold text-fern hover:text-fern-strong"
          >
            {expanded ? "Show less" : `Show all ${insights.length}`}
            <ChevronDown className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>
      <motion.ul layout className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence initial={false}>
          {shown.map((insight, index) => {
            const tone = TONES[insight.tone];
            return (
              <motion.li
                key={insight.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35, delay: index < VISIBLE ? index * 0.05 : 0 }}
                className="card relative flex flex-col overflow-hidden rounded-2xl p-4"
              >
                <span className={`absolute inset-y-0 left-0 w-1 ${tone.bar}`} />
                <div className="flex items-start gap-3">
                  <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${tone.chip}`}>
                    <insight.icon className="size-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14px] leading-snug font-bold">{insight.title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-paper-muted">{insight.body}</p>
                  </div>
                </div>
                {insight.action && (
                  <button
                    type="button"
                    onClick={insight.action.run}
                    className="mt-3 ml-12 inline-flex w-fit items-center gap-1 text-[13px] font-bold text-fern hover:text-fern-strong"
                  >
                    {insight.action.label} <ArrowRight className="size-3.5" />
                  </button>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>
    </section>
  );
}
