import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { ServiceMark } from "../ui/ServiceMark";
import { Reveal } from "./Reveal";

const marks = ["Spotify", "Netflix", "Figma", "GitHub", "Notion", "Canva", "Strava", "Vercel"];

export function FinalCta() {
  const reduce = useReducedMotion();
  return (
    <section className="px-5 pb-24 sm:px-8 sm:pb-32">
      <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-fern px-6 py-16 text-center text-on-accent shadow-window sm:py-24">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgb(255_255_255/0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.25)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_70%_80%_at_50%_50%,#000,transparent)]" />
        <div className="pointer-events-none absolute inset-x-0 top-6 flex justify-center gap-4 opacity-90">
          {marks.map((name, index) => (
            <motion.div
              key={name}
              animate={reduce ? undefined : { y: [0, index % 2 ? -8 : 8, 0] }}
              transition={{ duration: 4 + (index % 3), repeat: Infinity, ease: "easeInOut" }}
              className={`rounded-xl bg-white/90 p-1.5 shadow-float dark:bg-ink-900 ${index > 3 ? "hidden sm:block" : ""}`}
            >
              <ServiceMark name={name} size="sm" />
            </motion.div>
          ))}
        </div>
        <div className="relative pt-10">
          <h2 className="mx-auto max-w-2xl text-[34px] leading-[1.05] font-extrabold tracking-[-0.02em] text-balance sm:text-6xl">
            Find out what you're actually paying for.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[16.5px] leading-relaxed opacity-85">
            It takes a few minutes to add everything. After that, you'll know about each renewal before it happens.
          </p>
          <div className="mt-9 flex justify-center">
            <Button
              to="/login"
              size="lg"
              className="rounded-full bg-ink-950! px-8 text-paper! shadow-float! hover:bg-ink-900!"
            >
              Get started free
              <ArrowRight className="size-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
