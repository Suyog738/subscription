import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { DeleteSubscriptionDialog } from "../components/dashboard/DeleteSubscriptionDialog";
import { StopGuideDialog } from "../components/dashboard/StopGuideDialog";
import { SubscriptionFormDialog, type SubscriptionPrefill } from "../components/dashboard/SubscriptionFormDialog";
import type { Subscription } from "../types";

interface EditorContextValue {
  openCreate: (prefill?: SubscriptionPrefill) => void;
  openEdit: (subscription: Subscription, patch?: SubscriptionPrefill) => void;
  requestDelete: (subscription: Subscription) => void;
  requestStop: (subscription: Subscription) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

type FormState =
  | { open: false; subscription: Subscription | null; prefill?: SubscriptionPrefill }
  | { open: true; subscription: Subscription | null; prefill?: SubscriptionPrefill };

export function EditorProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<FormState>({ open: false, subscription: null });
  const [formKey, setFormKey] = useState(0);
  const [deleting, setDeleting] = useState<Subscription | null>(null);
  const [stopping, setStopping] = useState<Subscription | null>(null);

  const openCreate = useCallback((prefill?: SubscriptionPrefill) => {
    setFormKey((key) => key + 1);
    setForm({ open: true, subscription: null, prefill });
  }, []);

  const openEdit = useCallback((subscription: Subscription, patch?: SubscriptionPrefill) => {
    setFormKey((key) => key + 1);
    setForm({ open: true, subscription, prefill: patch });
  }, []);

  const requestDelete = useCallback((subscription: Subscription) => {
    setForm((current) => ({ ...current, open: false }));
    setDeleting(subscription);
  }, []);

  const requestStop = useCallback((subscription: Subscription) => setStopping(subscription), []);

  const value = useMemo(
    () => ({ openCreate, openEdit, requestDelete, requestStop }),
    [openCreate, openEdit, requestDelete, requestStop],
  );

  return (
    <EditorContext.Provider value={value}>
      {children}
      <SubscriptionFormDialog
        key={formKey}
        open={form.open}
        subscription={form.subscription}
        prefill={form.prefill}
        onClose={() => setForm((current) => ({ ...current, open: false }))}
        onRequestDelete={requestDelete}
      />
      <DeleteSubscriptionDialog subscription={deleting} onClose={() => setDeleting(null)} />
      <StopGuideDialog subscription={stopping} onClose={() => setStopping(null)} />
    </EditorContext.Provider>
  );
}

export function useEditor(): EditorContextValue {
  const context = useContext(EditorContext);
  if (!context) throw new Error("useEditor must be used inside EditorProvider");
  return context;
}
