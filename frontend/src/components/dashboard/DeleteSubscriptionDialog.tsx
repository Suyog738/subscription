import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSubscriptions } from "../../contexts/SubscriptionsContext";
import { useToast } from "../../contexts/ToastContext";
import type { Subscription } from "../../types";
import { cycleSuffix, formatMoney } from "../../utils/format";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { ServiceMark } from "../ui/ServiceMark";

export function DeleteSubscriptionDialog({
  subscription,
  onClose,
}: {
  subscription: Subscription | null;
  onClose: () => void;
}) {
  const { remove } = useSubscriptions();
  const { notify } = useToast();
  const [pending, setPending] = useState(false);
  const [shown, setShown] = useState<Subscription | null>(subscription);

  useEffect(() => {
    if (subscription) setShown(subscription);
  }, [subscription]);

  async function confirm() {
    if (!subscription) return;
    setPending(true);
    try {
      await remove(subscription.id);
      notify({ title: "Subscription deleted", description: `${subscription.name} was removed from your list.` });
      onClose();
    } catch (err) {
      notify({ tone: "error", title: "Couldn't delete", description: err instanceof Error ? err.message : undefined });
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={subscription !== null} onClose={onClose} title="Delete this subscription?" size="sm">
      {shown && (
        <div className="flex items-center gap-3 rounded-lg border border-line bg-ink-900 px-3 py-2.5">
          <ServiceMark name={shown.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{shown.name}</p>
            <p className="font-semibold tabular-nums text-[12px] text-paper-faint">
              {formatMoney(shown.price, shown.currency)}
              {cycleSuffix(shown.billingCycle)}
            </p>
          </div>
        </div>
      )}
      <p className="mt-4 text-sm leading-relaxed text-paper-muted">
        It will be removed from your list and your totals. This only affects Mohar, it doesn't cancel anything with
        the provider.
      </p>
      <div className="mt-6 flex gap-2 sm:justify-end">
        <Button variant="secondary" className="flex-1 sm:flex-none" onClick={onClose} data-autofocus>
          Keep it
        </Button>
        <Button variant="danger" className="flex-1 sm:flex-none" onClick={confirm} disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : "Delete"}
        </Button>
      </div>
    </Dialog>
  );
}
