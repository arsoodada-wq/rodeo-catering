import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, className, id, children, ...props },
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
      <select
        ref={ref}
        id={inputId}
        className={cn("input mt-1", error && "border-rodeo-400", className)}
        aria-invalid={error ? true : undefined}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-rodeo-600">{error}</p>}
    </div>
  );
});
