import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, className, id, ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wide text-ink-400">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn("input mt-1", error && "border-rodeo-400", className)}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-rodeo-600">{error}</p>}
    </div>
  );
});
