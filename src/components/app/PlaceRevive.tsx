import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Pause, Play } from "lucide-react";
import type { PlacePhoto } from "@/features/memories/data";
import { formatLongDate } from "@/utils/date";

/**
 * PlaceRevive — immersive slideshow for "Reviver este Lugar".
 * Auto-advances every ~5s, cross-fades between photos, minimal chrome.
 */
export function PlaceRevive({
  open,
  photos,
  placeName,
  onClose,
}: {
  open: boolean;
  photos: PlacePhoto[];
  placeName: string;
  onClose: () => void;
}) {
  const ordered = useMemo(
    () => [...photos].sort((a, b) => (a.takenAt < b.takenAt ? -1 : 1)),
    [photos],
  );
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!open) return;
    setI(0);
    setPlaying(true);
  }, [open]);

  useEffect(() => {
    if (!open || !playing || ordered.length === 0) return;
    const id = window.setTimeout(() => {
      setI((prev) => (prev + 1) % ordered.length);
    }, 5000);
    return () => window.clearTimeout(id);
  }, [i, playing, open, ordered.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((v) => (v + 1) % ordered.length);
      if (e.key === "ArrowLeft") setI((v) => (v - 1 + ordered.length) % ordered.length);
      if (e.key === " ") setPlaying((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, ordered.length]);

  const current = ordered[i];

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[70] bg-black"
          onClick={() => setI((v) => (v + 1) % ordered.length)}
        >
          <AnimatePresence mode="sync">
            <motion.img
              key={current.id}
              src={current.src}
              alt=""
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>

          {/* Soft vignette */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/40" />

          {/* Top bar */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))]">
            <div className="text-white/90">
              <p className="text-[10px] uppercase tracking-[0.32em] text-white/60">
                Revivendo
              </p>
              <p className="mt-1 font-display text-[18px] leading-none">
                {placeName}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" strokeWidth={1.6} />
            </button>
          </div>

          {/* Progress track */}
          <div className="pointer-events-none absolute inset-x-6 top-[calc(env(safe-area-inset-top)+70px)] flex gap-1">
            {ordered.map((_, idx) => (
              <span
                key={idx}
                className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/15"
              >
                <motion.span
                  className="block h-full bg-white/85"
                  initial={false}
                  animate={{
                    width: idx < i ? "100%" : idx === i ? "100%" : "0%",
                  }}
                  transition={{
                    duration: idx === i && playing ? 5 : 0,
                    ease: "linear",
                  }}
                />
              </span>
            ))}
          </div>

          {/* Footer caption */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="absolute inset-x-0 bottom-0 px-8 pb-[max(2rem,env(safe-area-inset-bottom))]"
            >
              {(current.caption || current.story) && (
                <p className="font-display text-[22px] leading-snug text-white">
                  {current.story ?? current.caption}
                </p>
              )}
              <p className="mt-3 text-[10px] uppercase tracking-[0.28em] text-white/60">
                {formatLongDate(current.takenAt)}
                {current.time ? (
                  <>
                    <span className="mx-2 text-white/30">·</span>
                    {current.time}
                  </>
                ) : null}
                <span className="mx-2 text-white/30">·</span>
                {current.memoryTitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Play/pause */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPlaying((v) => !v);
            }}
            className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] right-6 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
            aria-label={playing ? "Pausar" : "Retomar"}
          >
            {playing ? (
              <Pause className="h-4 w-4" strokeWidth={1.6} />
            ) : (
              <Play className="h-4 w-4" strokeWidth={1.6} />
            )}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
