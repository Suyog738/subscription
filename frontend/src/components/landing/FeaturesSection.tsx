import { motion } from "framer-motion";
import { BellRing, Check, Layers, PieChart, Plus, SlidersHorizontal, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { formatMoney } from "../../utils/format";
import { CHART_COLORS, Donut } from "../charts/primitives";
import { ServiceMark } from "../ui/ServiceMark";
import { Reveal, SectionHeading } from "./Reveal";

function TrackingVisual() {
  const rows = [
    { name: "Figma Professional", price: "$15.00", cycle: "/mo" },
    { name: "Notion Plus", price: "$96.00", cycle: "/yr" },
    { name: "Netflix Basic", price: formatMoney(1199, "NPR", true), cycle: "/mo" },
  ];
  return (
    <div className="w-full max-w-[320px] space-y-2">
      {rows.map((row, index) => (
        <motion.div
          key={row.name}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + index * 0.12 }}
          className="flex items-center gap-3 rounded-xl border border-line bg-ink-900 px-3 py-2.5 shadow-card"
        >
          <ServiceMark name={row.name} size="sm" />
          <span className="flex-1 truncate text-[13px] font-medium">{row.name}</span>
          <span className="text-[13px] font-semibold tabular-nums">
            {row.price}
            <span className="font-normal text-paper-faint">{row.cycle}</span>
          </span>
        </motion.div>
      ))}
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-fern/40 px-3 py-2.5 text-[13px] font-medium text-fern">
        <Plus className="size-4" /> Add subscription
      </div>
    </div>
  );
}

function RemindersVisual() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className="w-full max-w-[320px]">
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, index) => (
          <div key={index} className="text-center">
            <p className="mb-1.5 text-[10.5px] font-semibold text-paper-faint">{day}</p>
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className={`grid h-10 place-items-center rounded-xl text-[12px] font-semibold ${
                index === 2
                  ? "bg-amber text-white shadow-float dark:text-ink-950"
                  : index === 5
                    ? "bg-fern-deep text-fern"
                    : "border border-line bg-ink-900 text-paper-faint"
              }`}
            >
              {index + 9}
            </motion.div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl border border-line bg-ink-900 px-3 py-2.5 shadow-card">
        <span className="flex items-center gap-2 text-[13px] font-medium">
          <BellRing className="size-3.5 text-amber" /> Spotify renews Wednesday
        </span>
        <span className="text-[13px] font-semibold tabular-nums">$11.99</span>
      </div>
    </div>
  );
}

function OverviewVisual() {
  const parts = [
    { label: "Entertainment", value: 40.47 },
    { label: "Design", value: 24.99 },
    { label: "Productivity", value: 8 },
    { label: "Health", value: 12.99 },
  ];
  return (
    <div className="flex w-full max-w-[320px] items-center gap-5">
      <div className="relative size-[120px] shrink-0">
        <Donut segments={parts.map((p, i) => ({ key: p.label, value: p.value, color: CHART_COLORS[i] }))} size={120} thickness={14} className="size-full" />
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-display text-[17px] font-bold">$86</p>
            <p className="text-[10px] text-paper-faint">/month</p>
          </div>
        </div>
      </div>
      <ul className="flex-1 space-y-1.5">
        {parts.map((part, index) => (
          <li key={part.label} className="flex items-center gap-2 text-[12px]">
            <span className="size-2 rounded-full" style={{ background: CHART_COLORS[index] }} />
            <span className="flex-1 text-paper-muted">{part.label}</span>
            <span className="font-semibold tabular-nums">${part.value.toFixed(0)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ManageVisual() {
  return (
    <div className="w-full max-w-[320px] rounded-2xl border border-line bg-ink-900 p-3.5 shadow-card">
      <div className="flex items-center gap-2.5">
        <ServiceMark name="Netflix Standard" size="sm" />
        <span className="text-[13px] font-semibold">Netflix Standard</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-ink-850 px-3 py-2">
          <p className="text-[10.5px] text-paper-faint">Price</p>
          <p className="text-[13px] font-semibold tabular-nums">
            <span className="font-normal text-paper-faint line-through">$15.49</span> $17.99
          </p>
        </div>
        <div className="rounded-xl bg-ink-850 px-3 py-2">
          <p className="text-[10.5px] text-paper-faint">Renews</p>
          <p className="text-[13px] font-semibold">Dec 14</p>
        </div>
      </div>
      <p className="mt-2 rounded-xl bg-ink-850 px-3 py-2 text-[12px] text-paper-muted">Price went up in November. Cancel after the finale.</p>
      <motion.p
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-fern-deep px-2.5 py-1 text-[12px] font-semibold text-fern"
      >
        <Check className="size-3.5" strokeWidth={3} /> Changes saved
      </motion.p>
    </div>
  );
}

const features: { title: string; body: string; icon: LucideIcon; visual: ReactNode; wide?: boolean }[] = [
  {
    title: "Track every subscription",
    body: "Add what you pay for, in whichever currency it bills in. Renewal dates roll forward on their own, so the list stays current.",
    icon: Layers,
    visual: <TrackingVisual />,
    wide: true,
  },
  {
    title: "See renewals before they happen",
    body: "Anything inside your reminder window is flagged, so you have time to decide.",
    icon: BellRing,
    visual: <RemindersVisual />,
  },
  {
    title: "Know your real monthly cost",
    body: "Yearly plans are spread across twelve months and every currency is converted, so the number is honest.",
    icon: PieChart,
    visual: <OverviewVisual />,
  },
  {
    title: "Change things in one place",
    body: "Update a price when it goes up, leave a note about why you signed up, and remove what you've cancelled.",
    icon: SlidersHorizontal,
    visual: <ManageVisual />,
    wide: true,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          center
          label="Features"
          title="One list for everything that renews."
          body="Renewly does a few things and does them well. No bank connections, no categories to babysit."
        />

        <div className="mt-16 grid gap-5 md:grid-cols-5">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={(index % 2) * 0.1} className={feature.wide ? "md:col-span-3" : "md:col-span-2"}>
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="card group flex h-full flex-col overflow-hidden rounded-3xl"
              >
                <div className="relative flex h-56 items-center justify-center overflow-hidden border-b border-line bg-ink-850 px-6 sm:h-64">
                  <div className="absolute inset-0 soft-grid opacity-70 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000,transparent)]" />
                  <div className="relative w-full">{feature.visual}</div>
                </div>
                <div className="flex gap-4 p-6 sm:p-7">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-fern-deep text-fern transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <feature.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-xl font-bold tracking-[-0.015em]">{feature.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-paper-muted">{feature.body}</p>
                  </div>
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
