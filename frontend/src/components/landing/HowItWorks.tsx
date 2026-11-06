import { motion, useScroll, useSpring } from "framer-motion";
import { BellRing, CalendarRange, PlusCircle, type LucideIcon } from "lucide-react";
import { useRef } from "react";
import { Reveal, SectionHeading } from "./Reveal";

const steps: { title: string; body: string; detail: string; icon: LucideIcon }[] = [
  {
    title: "Add your subscriptions",
    body: "Name, price, how often it bills and when it renews next. Most people are done in five minutes.",
    detail: "Spotify · $11.99 · monthly",
    icon: PlusCircle,
  },
  {
    title: "Keep an eye on what's next",
    body: "Your dashboard is sorted by date, with charts showing where the money goes and which months spike.",
    detail: "Next: Figma in 5 days",
    icon: CalendarRange,
  },
  {
    title: "Get a heads-up before you pay",
    body: "Pick how much notice you want, from one day to two weeks. Renewly flags each renewal before it's charged.",
    detail: "Reminder: 7 days before",
    icon: BellRing,
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="how-it-works" className="relative scroll-mt-24 overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-ink-850/60" />
      <div className="absolute inset-0 -z-10 soft-grid [mask-image:linear-gradient(to_bottom,transparent,#000_30%,#000_70%,transparent)]" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading center label="How it works" title="Three steps, and then it mostly runs itself." />

        <div ref={ref} className="relative mx-auto mt-16 max-w-3xl">
          <div className="absolute top-2 bottom-2 left-[23px] w-[2px] rounded-full bg-line-strong sm:left-1/2 sm:-translate-x-1/2">
            <motion.div style={{ scaleY: progress }} className="h-full w-full origin-top rounded-full bg-fern" />
          </div>

          <div className="space-y-12 sm:space-y-16">
            {steps.map((step, index) => {
              const left = index % 2 === 0;
              return (
                <div key={step.title} className="relative grid items-center gap-6 pl-16 sm:grid-cols-2 sm:gap-16 sm:pl-0">
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, amount: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                    className="absolute top-1 left-0 z-10 grid size-12 place-items-center rounded-2xl bg-fern text-on-accent shadow-[0_8px_24px_-8px_var(--accent)] sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
                  >
                    <step.icon className="size-5" />
                  </motion.span>
                  <Reveal className={left ? "sm:text-right" : "sm:order-2"}>
                    <p className="text-[13px] font-bold tracking-wider text-fern">STEP 0{index + 1}</p>
                    <h3 className="mt-2 text-2xl font-bold tracking-[-0.02em]">{step.title}</h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-paper-muted">{step.body}</p>
                  </Reveal>
                  <Reveal delay={0.1} className={left ? "" : "sm:order-1 sm:text-right"}>
                    <span className="card inline-block rounded-xl px-3.5 py-2 font-mono text-[12.5px] text-paper-muted">{step.detail}</span>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
