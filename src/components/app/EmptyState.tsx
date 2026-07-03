import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 py-16 text-center">
      {icon && (
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-surface-muted text-ink-soft">
          {icon}
        </div>
      )}
      <h3 className="text-display text-xl text-ink">{title}</h3>
      {description && (
        <p className="mt-2 max-w-[32ch] text-sm leading-relaxed text-ink-soft">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
