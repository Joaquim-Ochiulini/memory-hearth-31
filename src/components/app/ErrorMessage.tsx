import { AlertCircle } from "lucide-react";

export function ErrorMessage({
  title = "Não foi possível carregar",
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-line-soft bg-surface-muted p-4">
      <AlertCircle
        className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
        strokeWidth={1.6}
      />
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{title}</p>
        {description && (
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">{description}</p>
        )}
      </div>
    </div>
  );
}
