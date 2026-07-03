import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface GalleryItem {
  id: string;
  title?: string;
  caption?: string;
  src?: string;
  ratio?: "portrait" | "landscape" | "square";
}

const ratioClass: Record<NonNullable<GalleryItem["ratio"]>, string> = {
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  square: "aspect-square",
};

/**
 * Gallery — refined masonry-lite grid.
 * Uses solid tonal placeholders when no src is supplied,
 * so the structure feels intentional without stock photos.
 */
export function Gallery({
  items,
  className,
}: {
  items: GalleryItem[];
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {items.map((item, i) => (
        <motion.figure
          key={item.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
          className="group flex flex-col gap-2"
        >
          <div
            className={cn(
              "relative overflow-hidden rounded-xl bg-surface-muted shadow-paper",
              ratioClass[item.ratio ?? "portrait"],
            )}
          >
            {item.src ? (
              <img
                src={item.src}
                alt={item.title ?? ""}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-surface-muted to-line" />
            )}
          </div>
          {(item.title || item.caption) && (
            <figcaption className="px-0.5">
              {item.title && (
                <p className="truncate text-[13px] font-medium text-ink">
                  {item.title}
                </p>
              )}
              {item.caption && (
                <p className="truncate text-[11px] text-ink-mute">{item.caption}</p>
              )}
            </figcaption>
          )}
        </motion.figure>
      ))}
    </div>
  );
}
