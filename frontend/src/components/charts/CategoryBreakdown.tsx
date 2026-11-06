import { useState } from "react";
import type { CurrencyCode } from "../../types";
import { formatMoney } from "../../utils/format";
import { CHART_COLORS, CHART_OTHER, Donut } from "./primitives";

export function CategoryBreakdown({
  categories,
  currency,
  horizontal = false,
}: {
  categories: { category: string; monthly: number }[];
  currency: CurrencyCode;
  horizontal?: boolean;
}) {
  const [active, setActive] = useState<string | null>(null);
  const named = categories.filter((c) => c.category !== "Other");
  const top = named.slice(0, 5);
  const rest = [...named.slice(5), ...categories.filter((c) => c.category === "Other")];
  const items = [
    ...top.map((c, i) => ({ key: c.category, value: c.monthly, color: CHART_COLORS[i] })),
    ...(rest.length ? [{ key: "Other", value: rest.reduce((s, c) => s + c.monthly, 0), color: CHART_OTHER }] : []),
  ];
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  const focused = items.find((i) => i.key === active);

  return (
    <div className={`flex flex-col items-center gap-6 sm:flex-row ${horizontal ? "" : "lg:flex-col"}`}>
      <div className="relative size-[168px] shrink-0">
        <Donut segments={items} size={168} thickness={20} activeKey={active} onHover={setActive} className="size-full" />
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-[11px] font-medium text-paper-faint">{focused ? focused.key : "Per month"}</p>
            <p className="font-display text-[22px] font-bold tabular-nums">{formatMoney(focused ? focused.value : total, currency)}</p>
            <p className="text-[11px] text-paper-faint">{focused ? `${Math.round((focused.value / total) * 100)}% of total` : `${categories.length} categories`}</p>
          </div>
        </div>
      </div>
      <ul className="w-full flex-1 space-y-1">
        {items.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              onPointerEnter={() => setActive(item.key)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(item.key)}
              onBlur={() => setActive(null)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors ${
                active === item.key ? "bg-ink-800" : ""
              }`}
            >
              <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: item.color }} />
              <span className="flex-1 truncate text-paper-muted">{item.key}</span>
              <span className="text-[12px] text-paper-faint tabular-nums">{Math.round((item.value / total) * 100)}%</span>
              <span className="w-[72px] text-right font-semibold tabular-nums">{formatMoney(item.value, currency)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
