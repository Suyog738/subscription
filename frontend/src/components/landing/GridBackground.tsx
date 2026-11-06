import { motion, useReducedMotion } from "framer-motion";

// Cells sit on the 48px grid: vertical lines at 50% - 24px + n * 48px.
const CELLS = [
  { col: -12, row: 2 },
  { col: -9, row: 5 },
  { col: -13, row: 8 },
  { col: -5, row: 1 },
  { col: 4, row: 3 },
  { col: 10, row: 1 },
  { col: 12, row: 6 },
  { col: 8, row: 11 },
  { col: -7, row: 12 },
];

export function GridBackground() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 hero-grid">
        {CELLS.map((cell, index) => (
          <motion.span
            key={`${cell.col}-${cell.row}`}
            className="absolute size-12 bg-fern/[0.07]"
            style={{ left: `calc(50% - 24px + ${cell.col * 48}px)`, top: cell.row * 48 }}
            initial={{ opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { opacity: [0, 1, 0.35, 1] }}
            transition={{ duration: 6, delay: index * 0.7, repeat: reduce ? 0 : Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
        ))}
      </div>
      <div className="absolute top-[-10%] left-[-10%] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,var(--glow),transparent_65%)]" />
      <div className="absolute top-[10%] right-[-12%] h-[700px] w-[700px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--chart-2)_12%,transparent),transparent_65%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink-950" />
    </div>
  );
}
