const DAY_MS = 86_400_000;

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseISODate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return toISODate(parseISODate(value)) === value;
}

// Demo clock: the prototype can be fast-forwarded. Everything that asks "what day
// is it?" goes through startOfToday(), so shifting this offset moves the whole app.
let demoOffsetDays = 0;

export function setDemoOffset(days: number) {
  demoOffsetDays = days;
}

export function getDemoOffset(): number {
  return demoOffsetDays;
}

export function demoNow(): Date {
  return new Date(Date.now() + demoOffsetDays * DAY_MS);
}

export function startOfToday(): Date {
  const now = demoNow();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function addMonthsClamped(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
}

export function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / DAY_MS);
}

export function isoInDays(days: number): string {
  return toISODate(addDays(startOfToday(), days));
}
