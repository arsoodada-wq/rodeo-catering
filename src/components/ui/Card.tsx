import { cn } from "@/lib/cn";

type CardProps = {
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
};

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-8",
};

export function Card({ className, padding = "md", children }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-900/8 bg-white",
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
