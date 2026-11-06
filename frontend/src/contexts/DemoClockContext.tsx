import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { readJSON, writeJSON } from "../services/storage";
import { getDemoOffset, setDemoOffset } from "../utils/date";

interface DemoClockValue {
  offset: number;
  advance: (days: number) => void;
  reset: () => void;
}

const KEY = "demo-clock-offset";
const DemoClockContext = createContext<DemoClockValue | null>(null);

function initialOffset(): number {
  const stored = readJSON<number>(KEY);
  const offset = typeof stored === "number" && stored > 0 ? stored : 0;
  setDemoOffset(offset);
  return offset;
}

export function DemoClockProvider({ children }: { children: ReactNode }) {
  const [offset, setOffset] = useState(initialOffset);

  const apply = useCallback((next: number) => {
    const value = Math.max(0, Math.round(next));
    setDemoOffset(value);
    writeJSON(KEY, value);
    setOffset(value);
  }, []);

  const advance = useCallback((days: number) => apply(getDemoOffset() + days), [apply]);
  const reset = useCallback(() => apply(0), [apply]);

  const value = useMemo(() => ({ offset, advance, reset }), [offset, advance, reset]);
  return <DemoClockContext.Provider value={value}>{children}</DemoClockContext.Provider>;
}

export function useDemoClock(): DemoClockValue {
  const context = useContext(DemoClockContext);
  if (!context) throw new Error("useDemoClock must be used inside DemoClockProvider");
  return context;
}
