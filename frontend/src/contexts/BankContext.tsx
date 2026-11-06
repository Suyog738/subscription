import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { bankService } from "../services";
import type { BankConnection, BankInstitution, DemoUser, DetectedSubscription, Transaction } from "../types";
import { startOfToday, toISODate } from "../utils/date";
import { detectSubscriptions, splitDetections } from "../utils/detection";
import { useSubscriptions } from "./SubscriptionsContext";

interface BankContextValue {
  institutions: BankInstitution[];
  connection: BankConnection | null;
  transactions: Transaction[];
  loading: boolean;
  detected: DetectedSubscription[];
  tracked: Map<string, DetectedSubscription>;
  suggestions: DetectedSubscription[];
  trials: DetectedSubscription[];
  unnamed: DetectedSubscription[];
  connect: (bankId: string) => Promise<BankConnection>;
  disconnect: () => Promise<void>;
  sync: () => Promise<void>;
  dismiss: (merchantKey: string) => Promise<void>;
}

const BankContext = createContext<BankContextValue | null>(null);

export function BankProvider({ user, children }: { user: DemoUser; children: ReactNode }) {
  const { subscriptions, loading: subsLoading, update, setStop } = useSubscriptions();
  const [institutions, setInstitutions] = useState<BankInstitution[]>([]);
  const [connection, setConnection] = useState<BankConnection | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      bankService.listInstitutions(),
      bankService.getConnection(user.id),
      bankService.listTransactions(user.id),
      bankService.listDismissed(user.id),
    ]).then(([banks, conn, txns, gone]) => {
      if (cancelled) return;
      setInstitutions(banks);
      setConnection(conn);
      setTransactions(txns);
      setDismissed(gone);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const connect = useCallback(
    async (bankId: string) => {
      const conn = await bankService.connect(user, bankId);
      setConnection(conn);
      setTransactions(await bankService.listTransactions(user.id));
      return conn;
    },
    [user],
  );

  const disconnect = useCallback(async () => {
    await bankService.disconnect(user.id);
    setConnection(null);
    setTransactions([]);
  }, [user.id]);

  const sync = useCallback(async () => {
    setConnection(await bankService.sync(user.id));
    setTransactions(await bankService.listTransactions(user.id));
  }, [user.id]);

  const dismiss = useCallback(
    async (merchantKey: string) => {
      setDismissed(await bankService.dismiss(user.id, merchantKey));
    },
    [user.id],
  );

  // When the demo clock has moved on, post the payments that would have happened,
  // then settle anything that depended on them: trials that turned paid, and stop checks.
  const caughtUp = useRef(false);
  useEffect(() => {
    if (loading || subsLoading || caughtUp.current) return;
    caughtUp.current = true;
    const today = toISODate(startOfToday());
    (async () => {
      const added = connection ? await bankService.advanceTo(user.id, today, subscriptions) : [];
      const txns = added.length ? await bankService.listTransactions(user.id) : transactions;
      if (added.length) {
        setTransactions(txns);
        setConnection(await bankService.getConnection(user.id));
      }
      for (const sub of subscriptions) {
        if (sub.status === "trial" && sub.renewalDate < today) {
          const { id: _id, userId: _u, createdAt: _c, stop: _s, ...input } = sub;
          await update(sub.id, { ...input, status: "active" });
        }
        const stop = sub.stop;
        if (sub.status === "stopped" && stop?.check === "pending" && stop.checkOn <= today && connection && sub.merchantKey) {
          const charged = txns.some((t) => t.merchantKey === sub.merchantKey && t.kind === "charge" && t.date > stop.stoppedAt);
          await setStop(sub.id, { ...stop, check: charged ? "charged" : "confirmed", checkedAt: today });
        }
      }
    })();
  }, [loading, subsLoading, connection, subscriptions, transactions, user.id, update, setStop]);

  const value = useMemo(() => {
    const detected = connection ? detectSubscriptions(transactions) : [];
    const split = splitDetections(detected, subscriptions, dismissed);
    return {
      institutions,
      connection,
      transactions,
      loading,
      detected,
      ...split,
      connect,
      disconnect,
      sync,
      dismiss,
    };
  }, [institutions, connection, transactions, loading, subscriptions, dismissed, connect, disconnect, sync, dismiss]);

  return <BankContext.Provider value={value}>{children}</BankContext.Provider>;
}

export function useBank(): BankContextValue {
  const context = useContext(BankContext);
  if (!context) throw new Error("useBank must be used inside BankProvider");
  return context;
}
