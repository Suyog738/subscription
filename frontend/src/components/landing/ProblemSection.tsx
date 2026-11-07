import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useRef } from "react";
import { Reveal, SectionHeading } from "./Reveal";

const lines = [
  { name: "Cloud storage, 2 TB", note: "Moved everything to another service in May", amount: 9.99 },
  { name: "Meditation app, yearly", note: "Free trial ended in March", amount: 69.99 },
  { name: "Streaming, second plan", note: "Signed up for one show", amount: 15.49 },
  { name: "Design tool", note: "Last opened seven weeks ago", amount: 15.0 },
];

const total = lines.reduce((sum, line) => sum + line.amount, 0);

export function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [-6, 3]);
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section className="relative py-16 sm:py-24 lg:py-32">
      <div className="mx-auto grid grid-cols-1 max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-[1fr_460px] lg:gap-24">
        <div>
          <SectionHeading
            label="The problem"
            title={
              <>
                Subscriptions are easy to start and <span className="text-clay">easy to forget.</span>
              </>
            }
            body="A free trial here, a yearly plan there. Each one is small enough to ignore, until a few renew in the same week and your statement looks nothing like you expected."
          />
          <Reveal delay={0.1} className="mt-8 grid grid-cols-1 max-w-lg gap-3 sm:grid-cols-3">
            {[
              ["Trials", "turn into paid plans quietly"],
              ["Yearly", "plans renew when you've forgotten"],
              ["Prices", "creep up a little each year"],
            ].map(([title, body]) => (
              <div key={title} className="card rounded-2xl p-4">
                <p className="font-display text-lg font-bold">{title}</p>
                <p className="mt-1 text-[13px] leading-snug text-paper-muted">{body}</p>
              </div>
            ))}
          </Reveal>
        </div>

        <div ref={ref} className="relative">
          <motion.div
            style={reduce ? undefined : { rotate, y }}
            className="relative rounded-3xl border border-line bg-ink-900 px-6 pt-6 pb-5 shadow-window sm:px-8"
          >
            <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-clay px-3 py-1 text-[12px] font-bold text-white shadow-float dark:text-ink-950">
              <AlertCircle className="size-3.5" /> 4 charges you forgot
            </div>
            <div className="flex items-baseline justify-between font-mono text-[11px] tracking-wide text-paper-faint uppercase">
              <span>Card statement</span>
              <span>October</span>
            </div>
            <div className="mt-4 border-t border-dashed border-line-strong" />
            <ul className="divide-y divide-dashed divide-line-strong">
              {lines.map((line, index) => (
                <motion.li
                  key={line.name}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + index * 0.1, duration: 0.5 }}
                  className="flex items-start justify-between gap-4 py-3.5"
                >
                  <div>
                    <p className="text-[14.5px] font-semibold">{line.name}</p>
                    <p className="mt-0.5 text-[12.5px] text-paper-faint">{line.note}</p>
                  </div>
                  <span className="font-mono text-[14px] tabular-nums">${line.amount.toFixed(2)}</span>
                </motion.li>
              ))}
            </ul>
            <div className="mt-1 flex items-baseline justify-between rounded-2xl bg-clay-deep px-4 py-3">
              <span className="text-[13px] font-semibold text-clay">Charges you didn't plan for</span>
              <span className="font-display text-xl font-bold text-clay tabular-nums">${total.toFixed(2)}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
