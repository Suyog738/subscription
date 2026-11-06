import { ChevronDown } from "lucide-react";
import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

const control =
  "w-full rounded-xl border bg-ink-950 px-3 text-sm text-paper placeholder:text-paper-faint transition-[border-color,box-shadow,background-color] outline-none focus:border-fern focus:bg-ink-900 focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_18%,transparent)] focus-visible:outline-none";

function stateClass(invalid?: boolean) {
  return invalid ? "border-clay/70" : "border-line-strong hover:border-paper-faint/50";
}

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, error, hint, optional, children, className = "" }: FieldProps) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-paper">
          {label}
        </label>
        {optional && <span className="text-xs text-paper-faint">Optional</span>}
      </div>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-xs text-clay">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-paper-faint">{hint}</p>
      )}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; leading?: ReactNode };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, leading, className = "", ...props },
  ref,
) {
  return (
    <div className="relative">
      {leading && (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-paper-faint">{leading}</span>
      )}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid && props.id ? `${props.id}-error` : undefined}
        className={`${control} h-10 ${stateClass(invalid)} ${leading ? "pl-9" : ""} ${className}`}
        {...props}
      />
    </div>
  );
});

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };

export function Select({ invalid, className = "", children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        aria-invalid={invalid || undefined}
        className={`${control} h-10 cursor-pointer appearance-none pr-9 ${stateClass(invalid)} ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-paper-faint" />
    </div>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export function Textarea({ invalid, className = "", ...props }: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={`${control} min-h-[84px] resize-y py-2.5 leading-relaxed ${stateClass(invalid)} ${className}`}
      {...props}
    />
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
  className?: string;
}

export function Segmented<T extends string>({ value, options, onChange, label, className = "" }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={`inline-flex rounded-xl border border-line-strong bg-ink-950 p-1 ${className}`}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`h-8 flex-1 rounded-lg px-3 whitespace-nowrap text-[13px] font-medium transition-colors ${
              active ? "bg-ink-900 text-paper shadow-card ring-1 ring-line-strong" : "text-paper-muted hover:text-paper"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
