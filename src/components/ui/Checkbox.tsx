import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, id, ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label htmlFor={inputId} className={cn("flex items-center gap-2 text-sm text-ink-600", className)}>
      <input ref={ref} id={inputId} type="checkbox" {...props} />
      {label}
    </label>
  );
});
