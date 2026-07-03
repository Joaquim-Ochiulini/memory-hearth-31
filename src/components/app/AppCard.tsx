import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * AppCard — a paper-like container with soft lift.
 */
export function AppCard({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line-soft bg-surface p-5 shadow-paper",
        className,
      )}
      {...props}
    />
  );
}
