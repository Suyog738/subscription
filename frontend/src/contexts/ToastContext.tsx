import { AnimatePresence, motion } from "framer-motion";
import { Check, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type ToastTone = "success" | "info" | "error";

interface Toast {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  notify: (toast: Omit<Toast, "id" | "tone"> & { tone?: ToastTone }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneIcon = {
  success: <Check className="size-3.5 text-fern" strokeWidth={2.5} />,
  info: <Info className="size-3.5 text-paper-muted" />,
  error: <X className="size-3.5 text-clay" strokeWidth={2.5} />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback<ToastContextValue["notify"]>(
    ({ tone = "success", ...toast }) => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-3), { ...toast, tone, id }]);
      window.setTimeout(() => dismiss(id), 5200);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end [&>*:nth-last-child(n+3)]:hidden sm:[&>*:nth-last-child(n+3)]:flex"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line-strong bg-ink-900 px-3.5 py-3 shadow-float"
              role="status"
            >
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-ink-800">
                {toneIcon[toast.tone]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-paper">{toast.title}</p>
                {toast.description && <p className="mt-0.5 line-clamp-2 text-[13px] text-paper-muted sm:line-clamp-none">{toast.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="-mr-1 rounded p-1 text-paper-faint transition-colors hover:text-paper"
                aria-label="Dismiss"
              >
                <X className="size-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
