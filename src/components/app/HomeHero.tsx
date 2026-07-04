import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { Memory } from "@/features/memories/data";
import { getPlace } from "@/features/memories/data";
import { formatLongDate } from "@/utils/date";

/**
 * HomeHero — a single photograph, roughly half the viewport tall,
 * behaves like the first page of a book. Eyebrow floats quietly
 * over the image; title and metadata rest below it.
 */
export function HomeHero({
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
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="group"
      >
        <div className="relative overflow-hidden rounded-b-[22px] bg-surface-muted">
          <div className="h-[52vh] min-h-[380px] w-full">
            <img
              src={memory.cover}
              alt={memory.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-active:scale-[0.995]"
            />
          </div>
          {/* Soft top gradient carries the eyebrow without shouting */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/25 to-transparent" />
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="absolute left-0 right-0 top-0 px-6 pt-[calc(env(safe-area-inset-top)+18px)] text-center text-[11px] font-medium uppercase tracking-[0.32em] text-white/85"
          >
            {eyebrow}
          </motion.p>
        </div>

        <figcaption className="px-6 pt-8">
          <h1 className="text-display text-[32px] leading-[1.05] text-ink">
            {memory.title}
          </h1>
          <p className="mt-4 text-[15px] leading-[1.65] text-ink-soft">
            {memory.phrase}
          </p>
          <p className="mt-5 text-[10px] uppercase tracking-[0.28em] text-ink-mute">
            {formatLongDate(memory.takenAt)}
            <span className="mx-2 text-line">·</span>
            {place?.name ?? "—"}
          </p>
        </figcaption>
      </motion.figure>
    </Link>
  );
}
