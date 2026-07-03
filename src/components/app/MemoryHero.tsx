import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { Memory } from "@/features/memories/data";
import { formatLongDate } from "@/utils/date";
import { getPlace } from "@/features/memories/data";

/**
 * MemoryHero — magazine-cover treatment for the home screen.
 * The photo is the protagonist; text is quiet and lives beneath it.
 */
export function MemoryHero({
  memory,
  eyebrow,
}: {
  memory: Memory;
  eyebrow: string;
}) {
  const place = getPlace(memory.placeId);
  return (
    <Link
      to="/memory/$id"
      params={{ id: memory.id }}
      className="block"
      aria-label={`Abrir memória ${memory.title}`}
    >
      <motion.figure
        layoutId={`memory-cover-${memory.id}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="group"
      >
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.28em] text-ink-mute">
          {eyebrow}
        </p>
        <div className="relative overflow-hidden rounded-[20px] bg-surface-muted">
          <div className="aspect-[3/4]">
            <img
              src={memory.cover}
              alt={memory.title}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-active:scale-[0.99]"
            />
          </div>
        </div>
        <figcaption className="mt-5">
          <h2 className="text-display text-[30px] leading-[1.08] text-ink">
            {memory.title}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
            {memory.phrase}
          </p>
          <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-ink-mute">
            {place?.name ?? "—"} · {formatLongDate(memory.takenAt)}
          </p>
        </figcaption>
      </motion.figure>
    </Link>
  );
}
