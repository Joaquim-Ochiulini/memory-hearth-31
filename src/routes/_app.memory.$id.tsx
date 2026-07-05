import { useState } from "react";
import {
  createFileRoute,
  Link,
  notFound,
  useRouter,
} from "@tanstack/react-router";
import { motion } from "motion/react";
import { ChevronLeft, Pencil, MoreHorizontal } from "lucide-react";
import {
  getMemory,
  getMemoryDetail,
  getPerson,
  getPlace,
  type GalleryPhoto,
  type Memory,
  type MemoryDetail,
  type Person,
} from "@/features/memories/data";
import { formatLongDate } from "@/utils/date";
import { MemoryLightbox } from "@/components/app/MemoryLightbox";

export const Route = createFileRoute("/_app/memory/$id")({
  loader: ({ params }) => {
    const memory = getMemory(params.id);
    const detail = getMemoryDetail(params.id);
    if (!memory || !detail) throw notFound();
    return { memory, detail };
  },
  component: MemoryDetailScreen,
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-ink-soft">
      Memória não encontrada.
    </div>
  ),
});

const ratioClass: Record<GalleryPhoto["ratio"], string> = {
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  square: "aspect-square",
  pano: "aspect-[21/9]",
};

function MemoryDetailScreen() {
  const { memory, detail } = Route.useLoaderData() as {
    memory: Memory;
    detail: MemoryDetail;
  };
  const router = useRouter();
  const place = getPlace(memory.placeId);
  const people: Person[] = memory.personIds
    .map((id) => getPerson(id))
    .filter((p): p is Person => !!p);

  const [openPhoto, setOpenPhoto] = useState<GalleryPhoto | null>(null);
  const photoCount = detail.gallery.length + 1; // +1 for cover
  const videoCount = 0;

  return (
    <div className="min-h-[100dvh] bg-background pb-32">
      {/* Header — three simple actions, nothing more */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 bg-background/80 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => router.history.back()}
          className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-surface-muted"
          aria-label="Voltar"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
            aria-label="Editar"
          >
            <Pencil className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
            aria-label="Mais opções"
          >
            <MoreHorizontal className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* 1 — Cover (grows from the Home hero via layoutId) */}
      <motion.figure
        layoutId={`memory-cover-${memory.id}`}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden bg-surface-muted"
      >
        <div className="h-[62vh] min-h-[420px] w-full">
          <img
            src={memory.cover}
            alt={memory.title}
            className="h-full w-full object-cover"
          />
        </div>
      </motion.figure>

      {/* 2 — Title block */}
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-10 max-w-md px-6"
      >
        <p className="text-[10px] uppercase tracking-[0.32em] text-ink-mute">
          {place?.name ?? "—"}
        </p>
        <h1 className="mt-4 text-display text-[38px] leading-[1.02] text-ink">
          {memory.title}
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.24em] text-ink-mute">
          <span>{formatLongDate(memory.takenAt)}</span>
          <span className="text-line">·</span>
          <span>
            {photoCount} {photoCount === 1 ? "foto" : "fotos"}
          </span>
          {videoCount > 0 && (
            <>
              <span className="text-line">·</span>
              <span>
                {videoCount} {videoCount === 1 ? "vídeo" : "vídeos"}
              </span>
            </>
          )}
        </div>
      </motion.header>

      {/* 3 — Story (magazine-like, no card) */}
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-14 max-w-[34rem] px-7"
      >
        {detail.story.map((paragraph, i) => (
          <p
            key={i}
            className={
              i === 0
                ? "text-display text-[22px] leading-[1.5] text-ink"
                : "mt-6 text-[16px] leading-[1.8] text-ink-soft"
            }
          >
            {paragraph}
          </p>
        ))}
      </motion.article>

      {/* 4 — Timeline (optional) */}
      {detail.timeline && detail.timeline.length > 0 && (
        <section className="mx-auto mt-20 max-w-md px-8">
          <p className="text-[10px] uppercase tracking-[0.32em] text-ink-mute">
            O dia
          </p>
          <ol className="mt-8 space-y-8">
            {detail.timeline.map((entry, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="grid grid-cols-[54px_1fr] gap-5"
              >
                <span className="text-display text-[15px] leading-6 text-accent">
                  {entry.time}
                </span>
                <p className="text-[15px] leading-6 text-ink">{entry.text}</p>
              </motion.li>
            ))}
          </ol>
        </section>
      )}

      {/* 5 — Gallery (editorial, mixed sizes) */}
      <section className="mx-auto mt-24 max-w-md px-4">
        <p className="px-2 text-[10px] uppercase tracking-[0.32em] text-ink-mute">
          Fotografias
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {detail.gallery.map((photo, i) => {
            const isPano = photo.ratio === "pano";
            // Alternate a subtle indent for portraits to break the column feel
            const indent =
              !isPano && photo.ratio === "portrait" && i % 3 === 2
                ? "ml-[18%] w-[82%]"
                : !isPano && photo.ratio === "square" && i % 4 === 1
                  ? "mr-[14%] w-[86%]"
                  : "w-full";
            return (
              <motion.button
                key={photo.id}
                type="button"
                onClick={() => setOpenPhoto(photo)}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.5,
                  delay: (i % 4) * 0.04,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`group block overflow-hidden rounded-[14px] bg-surface-muted text-left ${indent}`}
              >
                <motion.div
                  layoutId={`gallery-${photo.id}`}
                  className={`${ratioClass[photo.ratio]} overflow-hidden`}
                >
                  <img
                    src={photo.src}
                    alt={photo.caption ?? ""}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-active:scale-[0.995]"
                  />
                </motion.div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* 6 — People */}
      {people.length > 0 && (
        <section className="mx-auto mt-24 max-w-md px-6">
          <p className="text-[10px] uppercase tracking-[0.32em] text-ink-mute">
            Com
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-6">
            {people.map((p) => (
              <li key={p.id}>
                <Link
                  to="/person/$id"
                  params={{ id: p.id }}
                  className="group flex flex-col items-center"
                >
                  <span className="h-16 w-16 overflow-hidden rounded-full bg-surface-muted transition-transform duration-300 group-hover:scale-[1.03]">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <span className="mt-3 text-display text-[13px] text-ink">
                    {p.name.split(" ")[0]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 7 — Place (discreet static map) */}
      {place && (
        <section className="mx-auto mt-24 max-w-md px-6">
          <p className="text-[10px] uppercase tracking-[0.32em] text-ink-mute">
            Lugar
          </p>
          <Link
            to="/place/$id"
            params={{ id: place.id }}
            className="mt-6 block overflow-hidden rounded-[16px] border border-line-soft bg-surface"
          >
            <div className="relative h-[140px] w-full overflow-hidden bg-surface-muted">
              <StaticMiniMap x={place.x} y={place.y} />
            </div>
            <div className="flex items-end justify-between px-5 py-4">
              <div>
                <p className="text-display text-[18px] leading-tight text-ink">
                  {place.name}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-ink-mute">
                  {place.region}
                </p>
              </div>
              <span className="text-[10px] uppercase tracking-[0.24em] text-ink-mute">
                abrir
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* Closing hairline */}
      <div className="mx-auto mt-24 h-px w-10 bg-line" />

      <MemoryLightbox
        photo={openPhoto}
        place={place?.name}
        people={people}
        onClose={() => setOpenPhoto(null)}
      />
    </div>
  );
}

/**
 * StaticMiniMap — quiet, decorative locator. Not a real map on purpose:
 * Lumina is an emotional album, not a navigation tool.
 */
function StaticMiniMap({ x, y }: { x: number; y: number }) {
  return (
    <svg
      viewBox="0 0 100 40"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="miniland" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.955 0.014 82)" />
          <stop offset="100%" stopColor="oklch(0.92 0.018 78)" />
        </linearGradient>
      </defs>
      <rect width="100" height="40" fill="url(#miniland)" />
      <path
        d="M-5,26 C 20,16 40,30 60,22 S 95,28 110,20"
        fill="none"
        stroke="oklch(0.82 0.014 78)"
        strokeWidth="0.3"
      />
      <path
        d="M-5,32 C 25,26 50,36 75,30 S 105,34 110,32"
        fill="none"
        stroke="oklch(0.82 0.014 78)"
        strokeWidth="0.25"
        opacity="0.7"
      />
      <g
        transform={`translate(${x * 100} ${y * 40})`}
        style={{ transformBox: "fill-box" }}
      >
        <circle r="3.2" fill="oklch(0.63 0.075 68)" opacity="0.18" />
        <circle r="1.4" fill="oklch(0.63 0.075 68)" />
        <circle r="0.5" fill="white" />
      </g>
    </svg>
  );
}
