// Neutral monograms instead of brand logos: sample names don't imply any integration.

const TINTS = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5"];

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function ServiceMark({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const letter = name.trim()[0]?.toUpperCase() ?? "?";
  const tint = TINTS[hash(name.trim().toLowerCase().split(" ")[0] ?? "") % TINTS.length];
  const dimensions = {
    sm: "size-6 rounded-md text-[11px]",
    md: "size-8 rounded-lg text-[13px]",
    lg: "size-10 rounded-xl text-[15px]",
  }[size];

  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center font-display font-bold ${dimensions}`}
      style={{
        color: `var(${tint})`,
        backgroundColor: `color-mix(in oklab, var(${tint}) 16%, var(--surface))`,
      }}
    >
      {letter}
    </span>
  );
}
