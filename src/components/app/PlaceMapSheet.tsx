import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "motion/react";
import { ChevronRight, X } from "lucide-react";
import type { Place } from "@/features/memories/data";
import {
  placeStats,
  allPhotosOfPlace,
  memoriesByPlace,
  getPlaceStory,
} from "@/features/memories/data";
import { formatLongDate } from "@/utils/date";

interface Props {
  place: Place | null;
  onClose: () => void;
  onOpenPlace: (id: string) => void;
}

const PEEK = 260; // collapsed height
const EXPANDED_RATIO = 0.86;

export function PlaceMapSheet({ place, onClose, onOpenPlace }: Props) {
  const y = useMotionValue(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  const stats = useMemo(() => (place ? placeStats(place.id) : null), [place]);
  const photos = useMemo(
    () => (place ? allPhotosOfPlace(place.id).slice(0, 6) : []),
    [place],
  );
  const mems = useMemo(() => (place ? memoriesByPlace(place.id) : []), [place]);
  const story = place ? getPlaceStory(place.id) : undefined;

  // Reset drag position when a new place opens
  useEffect(() => {
    if (place) {
      setExpanded(false);
      animate(y, 0, { duration: 0.3, ease: [0.22, 1, 0.36, 1] });
    }
  }, [place, y]);

  const expandedHeight =
    typeof window !== "undefined" ? window.innerHeight * EXPANDED_RATIO : 720;
  const dragMax = expandedHeight - PEEK; // how far up the sheet can move
  const dragMin = -80; // slight overshoot down (used to dismiss)

  return (
    <AnimatePresence>
      {place && stats && (
        <>
          {/* Scrim only when expanded */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: expanded ? 0.3 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              setExpanded(false);
              animate(y, 0, { duration: 0.3, ease: [0.22, 1, 0.36, 1] });
            }}
            className="pointer-events-none fixed inset-0 z-30 bg-ink"
            style={{ pointerEvents: expanded ? "auto" : "none" }}
          />

          <motion.div
            ref={sheetRef}
            initial={{ y: PEEK + 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: PEEK + 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            drag="y"
            dragConstraints={{ top: -dragMax, bottom: 200 }}
            dragElastic={{ top: 0.02, bottom: 0.2 }}
            style={{
              y,
              height: expandedHeight,
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
            onDragEnd={(_, info) => {
              const currentY = y.get();
              // Dismiss if dragged far down
              if (info.offset.y > 120 || info.velocity.y > 800) {
                onClose();
                return;
              }
              // Snap between collapsed (y=0) and expanded (y=-dragMax)
              const target =
                currentY < -dragMax / 2 || info.velocity.y < -400
                  ? -dragMax
                  : 0;
              setExpanded(target !== 0);
              animate(y, target, {
                type: "spring",
                stiffness: 340,
                damping: 34,
              });
            }}
            className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md flex-col overflow-hidden rounded-t-[28px] border-t border-line-soft bg-surface shadow-[0_-16px_48px_rgba(43,38,35,0.14)]"
          >
            {/* Grabber */}
            <div className="flex justify-center pb-1 pt-2.5">
              <span className="h-1 w-10 rounded-full bg-line" />
            </div>

            {/* Peek area — always visible */}
            <div className="px-6 pb-5 pt-1">
              <div className="flex gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[14px] bg-surface-muted">
                  <img
                    src={place.cover}
                    alt={place.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 self-center">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-ink-mute">
                    {place.region}
                  </p>
                  <h2 className="mt-1 truncate text-display text-[24px] leading-tight text-ink">
                    {place.name}
                  </h2>
                  <p className="mt-1 text-[12px] text-ink-soft">
                    {stats.memoryCount}{" "}
                    {stats.memoryCount === 1 ? "memória" : "memórias"} ·{" "}
                    {stats.photoCount} fotos
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-mute transition-colors hover:bg-surface-muted hover:text-ink"
                >
                  <X className="h-4 w-4" strokeWidth={1.6} />
                </button>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line-soft pt-4">
                <MiniStat
                  label="Primeira visita"
                  value={
                    stats.firstVisit ? shortDate(stats.firstVisit) : "—"
                  }
                />
                <MiniStat
                  label="Última visita"
                  value={
                    stats.lastVisit ? shortDate(stats.lastVisit) : "—"
                  }
                />
              </dl>

              <button
                type="button"
                onClick={() => onOpenPlace(place.id)}
                className="group mt-5 flex w-full items-center justify-between rounded-full bg-ink px-5 py-3.5 text-primary-foreground transition-opacity hover:opacity-90"
              >
                <span className="text-[13px] font-medium tracking-wide">
                  Abrir Lugar
                </span>
                <ChevronRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={1.6}
                />
              </button>
            </div>

            {/* Expanded content */}
            <div className="flex-1 overflow-y-auto px-6 pb-10">
              {story && (
                <p className="mt-2 text-display text-[17px] italic leading-[1.5] text-ink-soft">
                  “{story}”
                </p>
              )}

              <div className="mt-8">
                <p className="text-[10px] uppercase tracking-[0.32em] text-ink-mute">
                  Fragmentos
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {photos.map((p) => (
                    <div
                      key={p.id}
                      className="aspect-square overflow-hidden rounded-[10px] bg-surface-muted"
                    >
                      <img
                        src={p.src}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {mems.length > 0 && (
                <div className="mt-8">
                  <p className="text-[10px] uppercase tracking-[0.32em] text-ink-mute">
                    Memórias
                  </p>
                  <ul className="mt-4 space-y-2">
                    {mems.map((m) => (
                      <li
                        key={m.id}
                        className="text-[14px] leading-snug text-ink"
                      >
                        <span className="text-display text-[16px]">
                          {m.title}
                        </span>
                        <span className="ml-2 text-[11px] uppercase tracking-[0.2em] text-ink-mute">
                          {shortDate(m.takenAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.22em] text-ink-mute">
        {label}
      </dt>
      <dd className="mt-1 text-display text-[15px] text-ink">{value}</dd>
    </div>
  );
}

function shortDate(iso: string) {
  return formatLongDate(iso).replace(" de ", " ").replace(" de ", " ");
}
