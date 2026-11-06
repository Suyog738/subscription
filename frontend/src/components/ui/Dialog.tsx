import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md";
}

export function Dialog({ open, onClose, title, description, children, size = "md" }: DialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      const target = panelRef.current?.querySelector<HTMLElement>("[data-autofocus], input, select, textarea, button");
      target?.focus();
    }, 30);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
      if (event.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-[#0b1420]/40 backdrop-blur-[3px] dark:bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className={`relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-line-strong bg-ink-900 shadow-window sm:rounded-3xl ${
              size === "sm" ? "sm:max-w-md" : "sm:max-w-lg"
            }`}
          >
            <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-ink-600 sm:hidden" />
            <div className="flex items-start justify-between gap-4 px-5 pt-4 sm:px-6 sm:pt-5">
              <div>
                <h2 id={titleId} className="text-lg font-bold tracking-[-0.01em] text-paper">
                  {title}
                </h2>
                {description && <p className="mt-1 text-sm text-paper-muted">{description}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="-mt-1 -mr-2 rounded-md p-1.5 text-paper-faint transition-colors hover:bg-ink-700 hover:text-paper"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="px-5 pt-5 pb-5 sm:px-6 sm:pb-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
