import { renewalUrgency } from "../../utils/billing";
import { formatRelativeDays } from "../../utils/format";

const styles = {
  today: { dot: "bg-clay", text: "text-clay", ring: "bg-clay-deep/70 border-clay/25" },
  soon: { dot: "bg-amber", text: "text-amber", ring: "bg-amber-deep/60 border-amber/20" },
  later: { dot: "bg-paper-faint/60", text: "text-paper-muted", ring: "bg-transparent border-line-strong" },
};

export function RenewalBadge({
  daysUntil,
  reminderDays,
  variant = "text",
}: {
  daysUntil: number;
  reminderDays: number;
  variant?: "text" | "pill";
}) {
  const style = styles[renewalUrgency(daysUntil, reminderDays)];
  const label = formatRelativeDays(daysUntil);

  if (variant === "pill") {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${style.ring} ${style.text}`}>
        <span className={`size-1.5 rounded-full ${style.dot}`} />
        {label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${style.text}`}>
      <span className={`size-1.5 rounded-full ${style.dot}`} />
      {label}
    </span>
  );
}
