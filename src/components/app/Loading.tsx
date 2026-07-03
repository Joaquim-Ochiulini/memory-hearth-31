import { cn } from "@/lib/utils";

export function Loading({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-16", className)}>
      <span
        aria-hidden
        className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-ink"
      />
      {label && <p className="text-xs tracking-wide text-ink-mute">{label}</p>}
    </div>
  );
}
