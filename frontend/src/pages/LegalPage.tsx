import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { Logo } from "../components/brand/Logo";

const content = {
  privacy: {
    title: "Privacy",
    paragraphs: [
      "Mohar is currently a prototype. Everything you enter, including subscriptions and settings, is stored in your browser's local storage on this device. Nothing is sent to a server.",
      "Clearing your browser data removes it. Demo accounts are shared fixtures, so don't enter anything personal or sensitive.",
      "When Mohar has a real backend, this page will describe what is stored, where, and for how long.",
    ],
  },
  terms: {
    title: "Terms",
    paragraphs: [
      "This prototype is provided for demonstration only. Bank connections are simulated with fictional banks and sample payments. Mohar never moves money and can't cancel subscriptions for you.",
      "Spending totals use fixed exchange rates and are estimates. Product names in the demo data are examples and don't imply any partnership or integration.",
      "Reminders are shown inside the app. Email reminders aren't available yet.",
    ],
  },
};

export function LegalPage({ kind }: { kind: keyof typeof content }) {
  const page = content[kind];
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <Link to="/" className="flex items-center gap-1.5 text-sm text-paper-muted hover:text-paper">
          <ArrowLeft className="size-4" /> Back
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-5 pt-16 pb-24 sm:px-8">
        <p className="font-mono text-[12px] text-paper-faint uppercase">Last updated Nov 2026</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">{page.title}</h1>
        <div className="mt-8 space-y-5 text-[16px] leading-relaxed text-paper-muted">
          {page.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </main>
    </div>
  );
}
