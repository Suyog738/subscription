import { Landmark, Loader2, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useSubscriptions } from "../../contexts/SubscriptionsContext";
import { useToast } from "../../contexts/ToastContext";
import {
  CATEGORIES,
  CURRENCIES,
  PAYMENT_CHANNELS,
  type BillingCycle,
  type CurrencyCode,
  type Subscription,
  type SubscriptionInput,
} from "../../types";
import { monthlyEquivalent } from "../../utils/billing";
import { CHANNEL_LABELS } from "../../utils/channels";
import { formatMoney } from "../../utils/format";
import {
  NOTES_MAX,
  toSubscriptionInput,
  validateSubscription,
  type SubscriptionFormErrors,
  type SubscriptionFormValues,
} from "../../utils/validation";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { Field, Input, Segmented, Select, Textarea } from "../ui/Field";

export type SubscriptionPrefill = Partial<SubscriptionInput>;

interface Props {
  open: boolean;
  subscription: Subscription | null;
  prefill?: SubscriptionPrefill;
  onClose: () => void;
  onRequestDelete: (subscription: Subscription) => void;
}

function initialValues(base: SubscriptionPrefill, currency: CurrencyCode): SubscriptionFormValues {
  return {
    name: base.name ?? "",
    price: base.price ? String(base.price) : "",
    currency: base.currency ?? currency,
    billingCycle: base.billingCycle ?? "monthly",
    renewalDate: base.renewalDate ?? "",
    category: base.category ?? "Other",
    channel: base.channel ?? "card",
    trial: base.status === "trial",
    notes: base.notes ?? "",
  };
}

export function SubscriptionFormDialog({ open, subscription, prefill, onClose, onRequestDelete }: Props) {
  const { add, update, settings } = useSubscriptions();
  const { notify } = useToast();
  const base: SubscriptionPrefill = { ...(subscription ?? {}), ...prefill };
  const [values, setValues] = useState(() => initialValues(base, settings.displayCurrency));
  const [touched, setTouched] = useState<Partial<Record<keyof SubscriptionFormValues, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isEdit = subscription !== null;
  const fromBank = !isEdit && base.source === "bank";
  const errors: SubscriptionFormErrors = validateSubscription(values);
  const visibleError = (field: keyof SubscriptionFormValues) => (submitted || touched[field] ? errors[field] : undefined);

  const set = <K extends keyof SubscriptionFormValues>(field: K, value: SubscriptionFormValues[K]) =>
    setValues((current) => ({ ...current, [field]: value }));
  const blur = (field: keyof SubscriptionFormValues) => () => setTouched((current) => ({ ...current, [field]: true }));

  const priceNumber = Number(values.price);
  const showEquivalent = values.billingCycle === "yearly" && !errors.price && priceNumber > 0;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setServerError(null);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      const input = toSubscriptionInput(values, {
        previousStatus: subscription?.status,
        merchantKey: base.merchantKey,
        source: base.source,
      });
      if (subscription) {
        await update(subscription.id, input);
        notify({ title: "Changes saved", description: input.name });
      } else {
        await add(input);
        notify({
          title: input.status === "trial" ? "Trial tracked" : "Subscription added",
          description:
            input.status === "trial"
              ? `We'll warn you ${settings.trialReminderDays} days before ${input.name} turns paid.`
              : `${input.name} is now on your list.`,
        });
      }
      onClose();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit subscription" : fromBank ? "Add from your payments" : "Add a subscription"}
      description={isEdit ? undefined : fromBank ? "We filled in what your bank shows. Check it and fill any gaps." : "You can change any of this later."}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {fromBank && (
          <p className="flex items-start gap-2 rounded-xl bg-fern-deep px-3 py-2.5 text-[13px] text-fern">
            <Landmark className="mt-0.5 size-4 shrink-0" />
            Linked to your bank payments, so Mohar can show its history and check charges.
          </p>
        )}

        <Field label="Name" htmlFor="sub-name" error={visibleError("name")}>
          <Input
            id="sub-name"
            data-autofocus
            placeholder="e.g. Spotify Premium"
            value={values.name}
            onChange={(event) => set("name", event.target.value)}
            onBlur={blur("name")}
            invalid={Boolean(visibleError("name"))}
            autoComplete="off"
          />
        </Field>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-ink-950 px-3 py-2.5">
          <input
            type="checkbox"
            checked={values.trial}
            onChange={(event) => set("trial", event.target.checked)}
            className="mt-0.5 size-4 accent-[var(--accent)]"
          />
          <span>
            <span className="block text-[13.5px] font-semibold">This is a free trial</span>
            <span className="block text-[12px] text-paper-muted">
              We'll warn you {settings.trialReminderDays} days before it turns into a paid plan.
            </span>
          </span>
        </label>

        <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-3">
          <Field
            label={values.trial ? "Price after the trial" : "Price"}
            htmlFor="sub-price"
            error={visibleError("price")}
            hint={
              showEquivalent
                ? `About ${formatMoney(monthlyEquivalent({ price: priceNumber, billingCycle: "yearly" }), values.currency as CurrencyCode)} a month`
                : undefined
            }
          >
            <Input
              id="sub-price"
              inputMode="decimal"
              placeholder="0.00"
              value={values.price}
              onChange={(event) => set("price", event.target.value.replace(",", "."))}
              onBlur={blur("price")}
              invalid={Boolean(visibleError("price"))}
              className="tabular-nums"
            />
          </Field>
          <Field label="Currency" htmlFor="sub-currency" error={visibleError("currency")}>
            <Select id="sub-currency" value={values.currency} onChange={(event) => set("currency", event.target.value)}>
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-3">
          <div>
            <p className="mb-1.5 text-[13px] font-medium">Billed</p>
            <Segmented<BillingCycle>
              label="Billing frequency"
              value={values.billingCycle as BillingCycle}
              onChange={(value) => set("billingCycle", value)}
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly" },
              ]}
              className="flex w-full"
            />
          </div>
          <Field label={values.trial ? "Trial ends on" : "Next renewal"} htmlFor="sub-date" error={visibleError("renewalDate")}>
            <Input
              id="sub-date"
              type="date"
              value={values.renewalDate}
              onChange={(event) => set("renewalDate", event.target.value)}
              onBlur={blur("renewalDate")}
              invalid={Boolean(visibleError("renewalDate"))}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-3">
          <Field label="Category" htmlFor="sub-category" error={visibleError("category")}>
            <Select id="sub-category" value={values.category} onChange={(event) => set("category", event.target.value)}>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Paid through" htmlFor="sub-channel" error={visibleError("channel")}>
            <Select id="sub-channel" value={values.channel} onChange={(event) => set("channel", event.target.value)}>
              {PAYMENT_CHANNELS.map((channel) => (
                <option key={channel} value={channel}>
                  {CHANNEL_LABELS[channel]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Notes" htmlFor="sub-notes" optional error={visibleError("notes")} hint={`${values.notes.length}/${NOTES_MAX}`}>
          <Textarea
            id="sub-notes"
            placeholder="Why you signed up, who it's shared with, when to cancel…"
            value={values.notes}
            onChange={(event) => set("notes", event.target.value)}
            onBlur={blur("notes")}
            invalid={Boolean(visibleError("notes"))}
          />
        </Field>

        {serverError && (
          <p role="alert" className="rounded-lg border border-clay/30 bg-clay-deep/50 px-3 py-2 text-[13px] text-clay">
            {serverError}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:items-center">
          {subscription && (
            <Button
              variant="ghost"
              className="text-clay hover:bg-clay-deep/50 hover:text-clay sm:mr-auto"
              onClick={() => onRequestDelete(subscription)}
            >
              <Trash2 className="size-4" /> Delete
            </Button>
          )}
          <div className="flex gap-2 sm:ml-auto">
            <Button variant="secondary" className="flex-1 sm:flex-none" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 sm:min-w-[132px] sm:flex-none" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : isEdit ? "Save changes" : values.trial ? "Track trial" : "Add subscription"}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
