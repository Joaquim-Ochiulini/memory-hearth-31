import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function SearchField({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label
      className={cn(
        "flex h-11 w-full items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm text-ink transition-colors focus-within:border-ink/40",
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-ink-mute" strokeWidth={1.6} />
      <input
        type="search"
        className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-mute"
        {...props}
      />
    </label>
  );
}
