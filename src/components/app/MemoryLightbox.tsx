import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type { GalleryPhoto, Person } from "@/features/memories/data";

/**
 * MemoryLightbox — full-screen photo view for a memory's gallery.
 *
 * The photo is the whole screen. Caption / time / place / people appear
 * as a discreet bottom strip. Empty fields are omitted (no reserved
 * space for nothing).
 */
export function MemoryLightbox({
  photo,
  place,
  people,
  onClose,
}: {
  photo: GalleryPhoto | null;
  place?: string;
  people: Person[];
  onClose: () => void;
}) {
  useEffect(() => {
    if (!photo) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [photo, onClose]);

  const photoPeople = photo?.personIds
    ? people.filter((p) => photo.personIds!.includes(p.id))
    : [];

  const hasFooter =
    !!photo &&
    (!!photo.caption ||
      !!photo.time ||
      !!place ||
      photoPeople.length > 0 ||
      !!photo.story);

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24 }}
          className="fixed inset-0 z-[60] flex flex-col bg-[oklch(0.14_0.008_60)]"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" strokeWidth={1.6} />
          </button>

          <motion.figure
            layoutId={`gallery-${photo.id}`}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-1 items-center justify-center overflow-hidden"
          >
            <img
              src={photo.src}
              alt={photo.caption ?? ""}
              className="max-h-full max-w-full object-contain"
            />
          </motion.figure>

          {hasFooter && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 text-white/85"
            >
              {photo.caption && (
                <p className="font-display text-[20px] leading-snug text-white">
                  {photo.caption}
                </p>
              )}
              {photo.story && (
                <p className="mt-3 text-[14px] leading-relaxed text-white/70">
                  {photo.story}
                </p>
              )}
              {(photo.time || place) && (
                <p className="mt-4 text-[10px] uppercase tracking-[0.28em] text-white/55">
                  {photo.time}
                  {photo.time && place ? (
                    <span className="mx-2 text-white/30">·</span>
                  ) : null}
                  {place}
                </p>
              )}
              {photoPeople.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-3">
                  {photoPeople.map((p) => (
                    <li key={p.id} className="flex items-center gap-2">
                      <span className="h-6 w-6 overflow-hidden rounded-full">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      </span>
                      <span className="text-[12px] text-white/80">
                        {p.name.split(" ")[0]}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
