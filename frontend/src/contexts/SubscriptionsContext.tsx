import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { settingsService, subscriptionService } from "../services";
import type { DemoUser, Subscription, SubscriptionInput, UserSettings } from "../types";

interface SubscriptionsContextValue {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
  settings: UserSettings;
  add: (input: SubscriptionInput) => Promise<Subscription>;
  update: (id: string, input: SubscriptionInput) => Promise<Subscription>;
  remove: (id: string) => Promise<void>;
  resetDemoData: () => Promise<void>;
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>;
  reload: () => void;
}

const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(null);

export function SubscriptionsProvider({ user, children }: { user: DemoUser; children: ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>({ displayCurrency: user.defaultCurrency, reminderDays: 7 });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([subscriptionService.list(user.id), settingsService.get(user)])
      .then(([items, loadedSettings]) => {
        if (cancelled) return;
        setSubscriptions(items);
        setSettings(loadedSettings);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Couldn't load your subscriptions.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, reloadKey]);

  const add = useCallback(
    async (input: SubscriptionInput) => {
      const created = await subscriptionService.create(user.id, input);
      setSubscriptions((current) => [...current, created]);
      return created;
    },
    [user.id],
  );

  const update = useCallback(
    async (id: string, input: SubscriptionInput) => {
      const updated = await subscriptionService.update(user.id, id, input);
      setSubscriptions((current) => current.map((sub) => (sub.id === id ? updated : sub)));
      return updated;
    },
    [user.id],
  );

  const remove = useCallback(
    async (id: string) => {
      await subscriptionService.remove(user.id, id);
      setSubscriptions((current) => current.filter((sub) => sub.id !== id));
    },
    [user.id],
  );

  const resetDemoData = useCallback(async () => {
    setSubscriptions(await subscriptionService.reset(user.id));
  }, [user.id]);

  const updateSettings = useCallback(
    async (patch: Partial<UserSettings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      await settingsService.save(user.id, next);
    },
    [settings, user.id],
  );

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const value = useMemo(
    () => ({ subscriptions, loading, error, settings, add, update, remove, resetDemoData, updateSettings, reload }),
    [subscriptions, loading, error, settings, add, update, remove, resetDemoData, updateSettings, reload],
  );

  return <SubscriptionsContext.Provider value={value}>{children}</SubscriptionsContext.Provider>;
}

export function useSubscriptions(): SubscriptionsContextValue {
  const context = useContext(SubscriptionsContext);
  if (!context) throw new Error("useSubscriptions must be used inside SubscriptionsProvider");
  return context;
}
