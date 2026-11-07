import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpDown, BarChart3, BellRing } from "lucide-react";
import { useRef } from "react";
import { AppPreview } from "./AppPreview";
import { Reveal, SectionHeading } from "./Reveal";

const notes = [
  { icon: ArrowUpDown, title: "Sorted by date", body: "The next charge is always first. Past dates roll forward to the next cycle automatically." },
  { icon: BarChart3, title: "Charts that answer questions", body: "See which months spike because of yearly plans, and which categories cost the most." },
  { icon: BellRing, title: "Reminders in one panel", body: "The bell collects what renews soon, so you can keep or cancel in time." },
];

export function PreviewSection() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.2"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [22, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.88, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0.3, 1]);

  return (
    <section id="preview" className="scroll-mt-24 overflow-hidden py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          center
          label="The dashboard"
          title="Built to be checked in ten seconds."
          body="Open it, see what renews this week, close it. Everything else is one click away when you need it."
        />

        <div className="relative mt-14 [perspective:2000px]">
          <div className="absolute inset-x-[10%] top-[10%] bottom-0 rounded-full bg-[radial-gradient(ellipse,var(--glow),transparent_70%)] blur-3xl" />
          <motion.div ref={ref} style={reduce ? undefined : { rotateX, scale, opacity, transformOrigin: "50% 0%" }} className="relative">
            <AppPreview />
          </motion.div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {notes.map((note, index) => (
            <Reveal key={note.title} delay={index * 0.1} className="card rounded-3xl p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-fern-deep text-fern">
                <note.icon className="size-5" />
              </span>
              <p className="mt-4 text-[17px] font-bold">{note.title}</p>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-paper-muted">{note.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
