import type { ReactNode } from "react";

interface HeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

/**
 * Editorial page header. Serif display title over a small eyebrow label.
 */
export function Header({ eyebrow, title, description, action }: HeaderProps) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 pb-8">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-ink-mute">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-display text-[34px] leading-[1.05] text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-[28ch] text-sm leading-relaxed text-ink-soft">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 pb-1">{action}</div>}
    </header>
  );
}
