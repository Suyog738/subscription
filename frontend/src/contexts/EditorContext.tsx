import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { DeleteSubscriptionDialog } from "../components/dashboard/DeleteSubscriptionDialog";
import { SubscriptionFormDialog } from "../components/dashboard/SubscriptionFormDialog";
import type { Subscription } from "../types";

interface EditorContextValue {
  openCreate: () => void;
  openEdit: (subscription: Subscription) => void;
  requestDelete: (subscription: Subscription) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

type FormState = { open: false } | { open: true; subscription: Subscription | null };

export function EditorProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<FormState>({ open: false });
  const [formKey, setFormKey] = useState(0);
  const [deleting, setDeleting] = useState<Subscription | null>(null);

  const openCreate = useCallback(() => {
    setFormKey((key) => key + 1);
    setForm({ open: true, subscription: null });
  }, []);

  const openEdit = useCallback((subscription: Subscription) => {
    setFormKey((key) => key + 1);
    setForm({ open: true, subscription });
  }, []);

  const requestDelete = useCallback((subscription: Subscription) => {
    setForm({ open: false });
    setDeleting(subscription);
  }, []);

  const value = useMemo(() => ({ openCreate, openEdit, requestDelete }), [openCreate, openEdit, requestDelete]);

  return (
    <EditorContext.Provider value={value}>
      {children}
      <SubscriptionFormDialog
        key={formKey}
        open={form.open}
        subscription={form.open ? form.subscription : null}
        onClose={() => setForm({ open: false })}
        onRequestDelete={requestDelete}
      />
      <DeleteSubscriptionDialog subscription={deleting} onClose={() => setDeleting(null)} />
    </EditorContext.Provider>
  );
}

export function useEditor(): EditorContextValue {
  const context = useContext(EditorContext);
  if (!context) throw new Error("useEditor must be used inside EditorProvider");
  return context;
}
