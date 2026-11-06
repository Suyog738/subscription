import { motion } from "framer-motion";
import { Building2, Eye, Landmark, ScanSearch, ShieldCheck, Sparkles, TrendingUp, Wallet } from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";

const rows = [
  { date: "Nov 6", merchant: "Whole Foods Market", amount: "$84.12", tag: null },
  { date: "Nov 4", merchant: "SPOTIFY P2F7A1C0", amount: "$11.99", tag: "Subscription" },
  { date: "Nov 3", merchant: "ADOBE *CREATIVE CLD", amount: "$0.00", tag: "Free trial" },
  { date: "Nov 2", merchant: "Blue Bottle Coffee", amount: "$6.50", tag: null },
  { date: "Nov 1", merchant: "NETFLIX.COM", amount: "$15.49", tag: "Price rise" },
  { date: "Oct 31", merchant: "APPLE.COM/BILL", amount: "$4.99", tag: "Needs a name" },
  { date: "Oct 30", merchant: "AUDIBLE*MEMBERSHIP", amount: "$14.95", tag: "Subscription" },
];

const tagStyle: Record<string, string> = {
  Subscription: "bg-fern-deep text-fern",
  "Free trial": "bg-amber-deep text-amber",
  "Price rise": "bg-clay-deep text-clay",
  "Needs a name": "bg-ink-800 text-paper-muted",
};

const points = [
  { icon: ScanSearch, title: "Finds repeating payments", body: "Including the ones paid through PayPal, app stores, eSewa or Khalti." },
  { icon: Sparkles, title: "Spots free trials", body: "A 0.00 card check is usually how a trial starts. We flag it that day." },
  { icon: TrendingUp, title: "Catches price rises", body: "When a charge goes up, you'll see by how much and what it costs per year." },
  { icon: Wallet, title: "Warns about your balance", body: "If this week's renewals add up to more than you have, you'll know first." },
];

export function BankSection() {
  return (
    <section id="banks" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_520px] lg:gap-20">
        <div>
          <SectionHeading
            label="Works with your bank"
            title={
              <>
                Connect your bank. <span className="text-fern">Mohar finds the rest.</span>
              </>
            }
            body="Your bank already sees every subscription you pay for. With read-only access, Mohar reads those payments and turns them into a list you can act on."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {points.map((point, index) => (
              <Reveal key={point.title} delay={index * 0.08} className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-fern-deep text-fern">
                  <point.icon className="size-5" />
                </span>
                <div>
                  <p className="text-[15px] font-bold">{point.title}</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-paper-muted">{point.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2} className="mt-8 flex flex-col gap-3 rounded-3xl border border-line bg-ink-850 p-5 sm:flex-row sm:items-center">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-ink-900 text-paper shadow-card">
              <Building2 className="size-5" />
            </span>
            <div>
              <p className="text-[15px] font-bold">For banks</p>
              <p className="mt-0.5 text-[13.5px] leading-relaxed text-paper-muted">
                Mohar can also run inside your bank's own app, in your brand, using the payment data you already have.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="relative">
          <div className="absolute -inset-8 rounded-full bg-[radial-gradient(circle,var(--glow),transparent_70%)] blur-2xl" />
          <div className="relative overflow-hidden rounded-3xl border border-line-strong bg-ink-900 shadow-window">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-chart-1 text-white">
                  <Landmark className="size-4" />
                </span>
                <div className="leading-tight">
                  <p className="text-[13.5px] font-bold">Larkspur Bank</p>
                  <p className="text-[11.5px] text-paper-faint">Everyday account •••• 4821</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-fern-deep px-2.5 py-1 text-[11.5px] font-bold text-fern">
                <Eye className="size-3.5" /> Read-only
              </span>
            </div>
            <div className="relative">
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 z-10 h-12 bg-gradient-to-b from-transparent via-fern/15 to-transparent"
                initial={{ top: "-15%" }}
                whileInView={{ top: "105%" }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 2.4, ease: "easeInOut", delay: 0.4 }}
              />
              <ul className="divide-y divide-line">
              {rows.map((row, index) => (
                <li key={row.merchant} className="flex items-center gap-3 px-5 py-3">
                  <span className="w-11 shrink-0 text-[11.5px] font-semibold text-paper-faint">{row.date}</span>
                  <span className="min-w-0 flex-1 truncate font-mono text-[12px]">{row.merchant}</span>
                  {row.tag && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.6 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.6 + index * 0.3 }}
                      className={`hidden rounded-full px-2 py-0.5 text-[11px] font-bold whitespace-nowrap sm:inline ${tagStyle[row.tag]}`}
                    >
                      {row.tag}
                    </motion.span>
                  )}
                  <span className="w-16 shrink-0 text-right text-[13px] font-semibold tabular-nums">{row.amount}</span>
                </li>
              ))}
              </ul>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 2.9, duration: 0.5 }}
              className="flex items-center justify-between gap-3 border-t border-line bg-fern-deep px-5 py-3.5"
            >
              <p className="text-[13px] font-bold text-fern">Found 4 subscriptions, 1 free trial and 1 price rise</p>
              <ShieldCheck className="size-4 text-fern" />
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
