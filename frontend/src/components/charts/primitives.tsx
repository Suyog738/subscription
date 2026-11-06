import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

export const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
export const CHART_OTHER = "var(--chart-other)";

function polar(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const a = polar(cx, cy, r, end);
  const b = polar(cx, cy, r, start);
  const large = end - start > 180 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 0 ${b.x} ${b.y}`;
}

export interface DonutSegment {
  key: string;
  value: number;
  color: string;
}

export function Donut({
  segments,
  size = 160,
  thickness = 16,
  gap = 2.5,
  activeKey,
  onHover,
  delay = 0,
  className = "max-w-full",
}: {
  segments: DonutSegment[];
  className?: string;
  size?: number;
  thickness?: number;
  gap?: number;
  activeKey?: string | null;
  onHover?: (key: string | null) => void;
  delay?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = size / 2;
  let cursor = 0;

  return (
    <svg ref={ref} viewBox={`0 0 ${size} ${size}`} width={size} height={size} className={className} aria-hidden="true">
      <circle cx={c} cy={c} r={r} fill="none" strokeWidth={thickness} style={{ stroke: "var(--sunken)" }} />
      {segments.map((segment, index) => {
        const sweep = (segment.value / total) * 360;
        const start = cursor + (segments.length > 1 ? gap / 2 : 0);
        const end = cursor + sweep - (segments.length > 1 ? gap / 2 : 0);
        cursor += sweep;
        if (end <= start) return null;
        const dimmed = activeKey && activeKey !== segment.key;
        return (
          <motion.path
            key={segment.key}
            d={arcPath(c, c, r, start, end)}
            fill="none"
            strokeWidth={activeKey === segment.key ? thickness + 4 : thickness}
            strokeLinecap="butt"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1, opacity: dimmed ? 0.35 : 1 } : { pathLength: 0 }}
            transition={{ pathLength: { duration: 0.9, delay: delay + index * 0.12, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.2 } }}
            onPointerEnter={() => onHover?.(segment.key)}
            onPointerLeave={() => onHover?.(null)}
            style={{ stroke: segment.color, cursor: onHover ? "pointer" : undefined, transition: "stroke-width 0.2s" }}
          />
        );
      })}
    </svg>
  );
}

export function AnimatedNumber({
  value,
  format,
  duration = 1.2,
  delay = 0,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(reduce ? value : 0);
  const text = useTransform(motionValue, (n) => format(n));

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, { duration, delay, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [inView, value, duration, delay, reduce, motionValue]);

  return <motion.span ref={ref}>{text}</motion.span>;
}
