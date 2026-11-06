import { motion } from "framer-motion";
import type { ReactNode } from "react";

export const ease = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-fern/20 bg-fern-deep px-3 py-1 text-[12px] font-bold tracking-[0.14em] text-fern uppercase">
      {children}
    </p>
  );
}

export function SectionHeading({ label, title, body, center = false }: { label: string; title: ReactNode; body?: ReactNode; center?: boolean }) {
  return (
    <Reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <SectionLabel>{label}</SectionLabel>
      <h2 className="text-[34px] leading-[1.08] font-extrabold tracking-[-0.02em] text-balance sm:text-5xl">{title}</h2>
      {body && <p className={`mt-5 text-[16.5px] leading-relaxed text-paper-muted ${center ? "mx-auto max-w-xl" : "max-w-lg"}`}>{body}</p>}
    </Reveal>
  );
}
