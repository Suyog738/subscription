import { motion } from "framer-motion";
import { ArrowRight, Landmark, Link2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { BankInstitution } from "../../types";
import { initials } from "../../utils/format";
import { Input } from "../ui/Field";

export function PartnerDirectory({ banks, onSelect }: { banks: BankInstitution[]; onSelect: (bank: BankInstitution) => void }) {
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return banks.filter((bank) => !needle || `${bank.name} ${bank.country} ${bank.kind}`.toLowerCase().includes(needle));
  }, [banks, query]);

  return (
    <section className="card rounded-3xl p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h3 className="flex items-center gap-2 text-[17px] font-bold">
            <Landmark className="size-5 text-fern" /> Supported banks
          </h3>
          <p className="mt-1 text-[13.5px] text-paper-muted">
            Popular Nordic and European banks. Mohar connects through PSD2 open banking. Pick yours to connect.
          </p>
        </div>
        <div className="md:w-72">
          <Input
            type="search"
            aria-label="Search banks"
            placeholder="Search banks or countries"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leading={<Search className="size-4" />}
          />
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-line-strong px-4 py-8 text-center">
          <p className="text-[14px] font-semibold">No bank matches “{query}”</p>
          <p className="mx-auto mt-1 max-w-sm text-[13px] text-paper-muted">
            More banks are coming. Until yours is supported, you can still add subscriptions by hand.
          </p>
        </div>
      ) : (
        <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3">
          {shown.map((bank, index) => (
            <motion.li key={bank.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.025 }}>
              <button
                type="button"
                onClick={() => onSelect(bank)}
                className="group flex h-full w-full items-center gap-3 rounded-2xl border border-line bg-ink-950 px-3 py-2.5 text-left sm:p-4 transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-fern/50 hover:shadow-card"
              >
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-xl font-display text-[12px] font-bold text-white sm:size-11 sm:text-[13px]"
                  style={{ background: `var(--chart-${bank.tone})` }}
                  aria-hidden="true"
                >
                  {initials(bank.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] leading-snug font-bold">{bank.name}</span>
                  <span className="block truncate text-[12.5px] text-paper-faint">
                    {bank.kind} · {bank.country}
                  </span>
                  <span className="mt-1.5 hidden items-center gap-1 rounded-full bg-ink-850 px-2 py-0.5 text-[11px] font-semibold text-paper-muted sm:inline-flex">
                    <Link2 className="size-3" /> Open banking
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-paper-faint transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-fern" />
              </button>
            </motion.li>
          ))}
        </ul>
      )}
      <p className="mt-5 text-[12px] leading-relaxed text-paper-faint">
        Prototype: bank names are shown for demonstration only. No partnership or affiliation is implied, and every
        connection uses the same simulated sample payments.
      </p>
    </section>
  );
}
