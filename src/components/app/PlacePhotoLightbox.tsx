import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { X, ArrowUpRight } from "lucide-react";
import type { PlacePhoto, Person } from "@/features/memories/data";
import { formatLongDate } from "@/utils/date";

/**
 * PlacePhotoLightbox — full-screen photo view for the place gallery.
 * Discreet footer: story, date, time, people, place, memory link.
 * Sections are only rendered when they have content.
 */
export function PlacePhotoLightbox({
  photo,
  placeName,
  peopleIndex,
  onClose,
}: {
  photo: PlacePhoto | null;
  placeName?: string;
  peopleIndex: Map<string, Person>;
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
    ? photo.personIds
        .map((id) => peopleIndex.get(id))
        .filter((p): p is Person => !!p)
    : [];

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
            layoutId={`place-photo-${photo.id}`}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-1 items-center justify-center overflow-hidden"
          >
            <img
              src={photo.src}
              alt={photo.caption ?? ""}
              className="max-h-full max-w-full object-contain"
            />
          </motion.figure>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 text-white/85"
          >
            {photo.story && (
              <p className="font-display text-[18px] leading-snug text-white">
                {photo.story}
              </p>
            )}
            {(photo.time || placeName) && (
              <p className="mt-3 text-[10px] uppercase tracking-[0.28em] text-white/55">
                {formatLongDate(photo.takenAt)}
                {photo.time ? (
                  <>
                    <span className="mx-2 text-white/30">·</span>
                    {photo.time}
                  </>
                ) : null}
                {placeName ? (
                  <>
                    <span className="mx-2 text-white/30">·</span>
                    {placeName}
                  </>
                ) : null}
              </p>
            )}

            {photoPeople.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-3">
                {photoPeople.map((p) => (
                  <li key={p.id}>
                    <Link
                      to="/person/$id"
                      params={{ id: p.id }}
                      onClick={onClose}
                      className="flex items-center gap-2"
                    >
                      <span className="h-6 w-6 overflow-hidden rounded-full">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      </span>
                      <span className="text-[12px] text-white/85">
                        {p.name.split(" ")[0]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <Link
              to="/memory/$id"
              params={{ id: photo.memoryId }}
              onClick={onClose}
              className="mt-5 inline-flex items-center gap-2 border-t border-white/10 pt-4 text-[11px] uppercase tracking-[0.24em] text-white/70 transition-colors hover:text-white"
            >
              <span>De: {photo.memoryTitle}</span>
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
