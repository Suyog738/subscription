import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useRef } from "react";
import { DEMO_USERS } from "../../data/demoUsers";
import { useTypewriter } from "../../hooks/useTypewriter";
import { initials } from "../../utils/format";
import { Button } from "../ui/Button";
import { GridBackground } from "./GridBackground";
import { HeroVisual } from "./HeroVisual";
import { ease } from "./Reveal";

const WORDS = ["subscription", "renewals", "free trial", "memberships", "plans", ];

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease },
});

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const typed = useTypewriter(WORDS);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const visualY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section id="home" ref={ref} className="relative overflow-hidden">
      <GridBackground />

      <div className="relative mx-auto grid min-h-[100svh] max-w-7xl items-center gap-12 px-5 pt-28 pb-16 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pt-24">
        <motion.div style={reduce ? undefined : { y: contentY, opacity: fade }} className="max-w-2xl">
          <motion.p
            {...rise(0.1)}
            className="mb-5 inline-flex items-center gap-2 text-[13px] font-bold tracking-[0.16em] text-fern uppercase"
          >
            <span className="h-[2px] w-6 rounded-full bg-fern" /> Subscription tracker
          </motion.p>

          <motion.h1
            {...rise(0.18)}
            className="text-[44px] leading-[1.04] font-extrabold tracking-[-0.022em] sm:text-6xl xl:text-[72px]"
          >
            Keep track of
            <br />
            every{" "}
            <span className="relative whitespace-nowrap text-fern">
              {typed}
              <span className="ml-0.5 inline-block h-[0.85em] w-[3px] translate-y-[0.08em] animate-pulse rounded-full bg-fern align-baseline" />
            </span>
          </motion.h1>

          <motion.p {...rise(0.3)} className="mt-6 max-w-xl text-[17px] leading-relaxed text-paper-muted sm:text-lg">
            Connect your bank or add them yourself. Mohar finds every subscription, warns you before it renews or a trial
            turns paid, and shows you how to stop the ones you don't need.
          </motion.p>

          <motion.div {...rise(0.42)} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button to="/login" size="lg" className="rounded-full px-7">
              Get started free
              <ArrowRight className="size-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </Button>
            <Button href="#how-it-works" variant="secondary" size="lg" className="rounded-full px-7">
              See how it works
            </Button>
          </motion.div>

          <motion.div {...rise(0.54)} className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {DEMO_USERS.map((user, index) => (
                  <span
                    key={user.id}
                    className="grid size-9 place-items-center rounded-full border-2 border-ink-950 text-[10.5px] font-bold text-white"
                    style={{ background: `var(--chart-${index + 1})` }}
                  >
                    {initials(user.name)}
                  </span>
                ))}
              </div>
              <p className="text-[13.5px] text-paper-muted">
                Try it as <span className="font-semibold text-paper">Maya, Aarav or Sofia</span>
              </p>
            </div>
            <p className="flex items-center gap-1.5 text-[13.5px] text-paper-muted">
              <Check className="size-4 text-fern" strokeWidth={2.5} /> No card, no sign-up
            </p>
          </motion.div>
        </motion.div>

        <motion.div style={reduce ? undefined : { y: visualY }} className="relative px-6 sm:px-10 lg:px-4">
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  );
}
