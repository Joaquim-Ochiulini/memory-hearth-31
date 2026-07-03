import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { Memory } from "@/features/memories/data";
import { yearOf } from "@/utils/date";
import { cn } from "@/lib/utils";

/**
 * AlbumGrid — asymmetric editorial layout.
 * Renders memories in a rhythm of portraits, squares, landscapes and panoramas,
 * inspired by printed photo books rather than uniform photo grids.
 *
 * The pattern uses a repeating 6-item cadence:
 *   [big portrait]      [small square]
 *   [small square]      [portrait]
 *   [full-width panorama or landscape]
 *   [portrait]          [portrait]
 */
export function AlbumGrid({ items }: { items: Memory[] }) {
  const groups: Memory[][] = [];
  for (let i = 0; i < items.length; i += 6) groups.push(items.slice(i, i + 6));

  return (
    <div className="space-y-4">
      {groups.map((group, gi) => (
        <AlbumChunk key={gi} items={group} baseDelay={gi * 0.05} />
      ))}
    </div>
  );
}

function AlbumChunk({
  items,
  baseDelay,
}: {
  items: Memory[];
  baseDelay: number;
}) {
  const [a, b, c, d, e, f] = items;
  return (
    <div className="space-y-4">
      {(a || b) && (
        <div className="grid grid-cols-5 gap-3">
          {a && <Tile memory={a} className="col-span-3 aspect-[3/4]" delay={baseDelay} />}
          {b && (
            <div className="col-span-2 grid grid-rows-2 gap-3">
              <Tile memory={b} className="aspect-square" delay={baseDelay + 0.04} compact />
              {c && <Tile memory={c} className="aspect-square" delay={baseDelay + 0.08} compact />}
            </div>
          )}
        </div>
      )}
      {d && (
        <Tile
          memory={d}
          className={cn(d.ratio === "pano" ? "aspect-[21/9]" : "aspect-[16/10]")}
          delay={baseDelay + 0.12}
        />
      )}
      {(e || f) && (
        <div className="grid grid-cols-2 gap-3">
          {e && <Tile memory={e} className="aspect-[3/4]" delay={baseDelay + 0.16} />}
          {f && <Tile memory={f} className="aspect-[3/4]" delay={baseDelay + 0.2} />}
        </div>
      )}
    </div>
  );
}

function Tile({
  memory,
  className,
  delay,
  compact = false,
}: {
  memory: Memory;
  className?: string;
  delay: number;
  compact?: boolean;
}) {
  return (
    <Link to="/memory/$id" params={{ id: memory.id }} className="block">
      <motion.figure
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
        className="group"
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-[14px] bg-surface-muted",
            className,
          )}
        >
          <img
            src={memory.cover}
            alt={memory.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-active:scale-[0.99]"
          />
        </div>
        {!compact && (
          <figcaption className="mt-2.5 px-0.5">
            <p className="truncate text-[13px] leading-tight text-ink">
              {memory.title}
            </p>
            <p className="mt-0.5 text-[11px] tracking-wide text-ink-mute">
              {yearOf(memory.takenAt)}
            </p>
          </figcaption>
        )}
      </motion.figure>
    </Link>
  );
}
