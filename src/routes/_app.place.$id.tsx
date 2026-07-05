import { useMemo, useState } from "react";
import {
  createFileRoute,
  Link,
  notFound,
  useRouter,
} from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ChevronLeft,
  MoreHorizontal,
  Play,
  Heart,
  Sparkles,
} from "lucide-react";
import {
  allPhotosOfPlace,
  getPlace,
  getPlaceStory,
  memoriesByPlace,
  people as allPeople,
  placeStats,
  type PlacePhoto,
  type Person,
} from "@/features/memories/data";
import { formatLongDate } from "@/utils/date";
import { PlacePhotoLightbox } from "@/components/app/PlacePhotoLightbox";
import { PlaceRevive } from "@/components/app/PlaceRevive";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/place/$id")({
  loader: ({ params }) => {
    const place = getPlace(params.id);
    if (!place) throw notFound();
    return { place };
  },
  component: PlaceDetailScreen,
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-ink-soft">
      Lugar não encontrado.
    </div>
  ),
});

type Filter = "all" | "photos" | "videos" | "favorites";

function PlaceDetailScreen() {
  const { place } = Route.useLoaderData();
  const router = useRouter();
  const mems = memoriesByPlace(place.id);
  const photos = useMemo(() => allPhotosOfPlace(place.id), [place.id]);
  const stats = useMemo(() => placeStats(place.id), [place.id]);
  const story = getPlaceStory(place.id);

  const peopleIndex = useMemo(() => {
    const m = new Map<string, Person>();
    for (const p of allPeople) m.set(p.id, p);
    return m;
  }, []);

  const [filter, setFilter] = useState<Filter>("all");
  const [year, setYear] = useState<number | "all">("all");
  const [openPhoto, setOpenPhoto] = useState<PlacePhoto | null>(null);
  const [reviving, setReviving] = useState(false);

  const filtered = useMemo(() => {
    return photos.filter((p) => {
      if (filter === "photos" && p.isVideo) return false;
      if (filter === "videos" && !p.isVideo) return false;
      if (filter === "favorites" && !p.isFavorite) return false;
      if (year !== "all") {
        const y = new Date(p.takenAt + "T00:00:00Z").getUTCFullYear();
        if (y !== year) return false;
      }
      return true;
    });
  }, [photos, filter, year]);

  return (
    <div className="min-h-[100dvh] bg-background pb-32">
      {/* Header — voltar / mais opções */}
      <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <button
          type="button"
          onClick={() => router.history.back()}
          className="grid h-10 w-10 place-items-center rounded-full bg-surface/85 text-ink shadow-paper backdrop-blur-md transition-colors hover:bg-surface"
          aria-label="Voltar"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full bg-surface/85 text-ink shadow-paper backdrop-blur-md transition-colors hover:bg-surface"
          aria-label="Mais opções"
        >
          <MoreHorizontal className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* 1 — Hero */}
      <div className="relative">
        <div className="h-[58vh] min-h-[400px] w-full overflow-hidden bg-surface-muted">
          <img
            src={place.cover}
            alt={place.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>

      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto -mt-14 max-w-md px-6"
      >
        <p className="text-[10px] uppercase tracking-[0.32em] text-ink-mute">
          {place.region}
        </p>
        <h1 className="mt-3 text-display text-[42px] leading-[1] text-ink">
          {place.name}
        </h1>
        {story && (
          <p className="mt-5 text-display text-[19px] leading-[1.45] italic text-ink-soft">
            “{story}”
          </p>
        )}

        {/* Quick facts */}
        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line-soft pt-6">
          <StatCell label="Primeira visita" value={stats.firstVisit ? shortDate(stats.firstVisit) : "—"} />
          <StatCell label="Última visita" value={stats.lastVisit ? shortDate(stats.lastVisit) : "—"} />
          <StatCell label="Memórias" value={String(stats.memoryCount)} />
          <StatCell label="Fotos" value={String(stats.photoCount)} />
          {stats.videoCount > 0 && (
            <StatCell label="Vídeos" value={String(stats.videoCount)} />
          )}
          <StatCell label="Pessoas" value={String(stats.personCount)} />
        </dl>

        {/* Reviver este Lugar */}
        <button
          type="button"
          onClick={() => setReviving(true)}
          className="group mt-8 flex w-full items-center justify-between rounded-full bg-ink px-6 py-4 text-primary-foreground transition-opacity hover:opacity-90"
        >
          <span className="flex items-center gap-3">
            <Sparkles className="h-4 w-4" strokeWidth={1.6} />
            <span className="text-[13px] font-medium tracking-wide">
              Reviver este Lugar
            </span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.28em] opacity-70">
            {stats.photoCount} momentos
          </span>
        </button>
      </motion.header>

      {/* 2 — Gallery: filters + editorial grid */}
      <section className="mx-auto mt-20 max-w-md px-6">
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] uppercase tracking-[0.32em] text-ink-mute">
            Fotografias
          </p>
          <p className="text-[10px] uppercase tracking-[0.24em] text-ink-mute">
            {filtered.length} de {photos.length}
          </p>
        </div>

        {/* Filter row */}
        <div className="mt-5 flex flex-wrap gap-2">
          {(
            [
              { id: "all", label: "Todos" },
              { id: "photos", label: "Fotos" },
              { id: "videos", label: "Vídeos" },
              { id: "favorites", label: "Favoritos" },
            ] as { id: Filter; label: string }[]
          ).map((f) => (
            <FilterChip
              key={f.id}
              active={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </FilterChip>
          ))}
        </div>

        {/* Year row — only if there is more than one year */}
        {stats.years.length > 1 && (
          <div className="-mx-6 mt-3 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <FilterChip
              tone="soft"
              active={year === "all"}
              onClick={() => setYear("all")}
            >
              Todos os anos
            </FilterChip>
            {stats.years.map((y) => (
              <FilterChip
                key={y}
                tone="soft"
                active={year === y}
                onClick={() => setYear(y)}
              >
                {y}
              </FilterChip>
            ))}
          </div>
        )}

        {/* Editorial grid — 3 columns with variable row-spans */}
        {filtered.length > 0 ? (
          <div className="mt-6 grid grid-cols-3 auto-rows-[64px] gap-2">
            {filtered.map((p, i) => (
              <PhotoTile
                key={p.id}
                photo={p}
                index={i}
                onOpen={() => setOpenPhoto(p)}
              />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-[13px] text-ink-mute">
            Nenhuma fotografia com esse filtro.
          </p>
        )}
      </section>

      {/* 3 — Memories at this place */}
      {mems.length > 0 && (
        <section className="mx-auto mt-24 max-w-md px-6">
          <p className="text-[10px] uppercase tracking-[0.32em] text-ink-mute">
            Memórias deste lugar
          </p>
          <ul className="mt-6 space-y-8">
            {mems.map((m, i) => (
              <motion.li
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.04 }}
              >
                <Link
                  to="/memory/$id"
                  params={{ id: m.id }}
                  className="group flex gap-4"
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[12px] bg-surface-muted">
                    <img
                      src={m.cover}
                      alt={m.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="min-w-0 flex-1 self-center">
                    <h3 className="text-display text-[19px] leading-tight text-ink">
                      {m.title}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-snug text-ink-soft line-clamp-2">
                      {m.phrase}
                    </p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.24em] text-ink-mute">
                      {shortDate(m.takenAt)}
                    </p>
                  </div>
                </Link>
              </motion.li>
            ))}
          </ul>
        </section>
      )}

      {/* 4 — A História deste Lugar (timeline) */}
      {stats.years.length > 0 && (
        <section className="mx-auto mt-24 max-w-md px-8">
          <p className="text-[10px] uppercase tracking-[0.32em] text-ink-mute">
            A história deste lugar
          </p>
          <ol className="mt-8 space-y-9">
            {[...stats.years]
              .sort((a, b) => a - b)
              .map((y, i) => {
                const yearMems = mems.filter(
                  (m) =>
                    new Date(m.takenAt + "T00:00:00Z").getUTCFullYear() === y,
                );
                return (
                  <motion.li
                    key={y}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.45, delay: i * 0.05 }}
                    className="grid grid-cols-[64px_1fr] gap-5"
                  >
                    <span className="text-display text-[22px] leading-6 text-accent">
                      {y}
                    </span>
                    <ul className="space-y-2">
                      {yearMems.map((m) => (
                        <li key={m.id}>
                          <Link
                            to="/memory/$id"
                            params={{ id: m.id }}
                            className="text-[15px] leading-6 text-ink transition-colors hover:text-accent"
                          >
                            {m.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.li>
                );
              })}
          </ol>
        </section>
      )}

      {/* 5 — Extended stats */}
      <section className="mx-auto mt-24 max-w-md px-6">
        <p className="text-[10px] uppercase tracking-[0.32em] text-ink-mute">
          Números deste lugar
        </p>
        <dl className="mt-6 grid grid-cols-3 gap-x-4 gap-y-6 border-t border-line-soft pt-6">
          <StatCell label="Visitas" value={String(stats.visitsCount)} large />
          <StatCell label="Memórias" value={String(stats.memoryCount)} large />
          <StatCell label="Fotos" value={String(stats.photoCount)} large />
          {stats.videoCount > 0 && (
            <StatCell label="Vídeos" value={String(stats.videoCount)} large />
          )}
          <StatCell label="Pessoas" value={String(stats.personCount)} large />
          <StatCell
            label="Anos"
            value={String(stats.years.length)}
            large
          />
        </dl>

        {stats.topPeople.length > 0 && (
          <div className="mt-10">
            <p className="text-[10px] uppercase tracking-[0.28em] text-ink-mute">
              Quem mais aparece aqui
            </p>
            <ul className="mt-5 flex gap-5">
              {stats.topPeople.slice(0, 5).map((p) => (
                <li key={p.id}>
                  <Link
                    to="/person/$id"
                    params={{ id: p.id }}
                    className="group flex flex-col items-center"
                  >
                    <span className="h-14 w-14 overflow-hidden rounded-full bg-surface-muted transition-transform group-hover:scale-[1.04]">
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    </span>
                    <span className="mt-2 text-display text-[12px] text-ink">
                      {p.name.split(" ")[0]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="mx-auto mt-24 h-px w-10 bg-line" />

      <PlacePhotoLightbox
        photo={openPhoto}
        placeName={place.name}
        peopleIndex={peopleIndex}
        onClose={() => setOpenPhoto(null)}
      />
      <PlaceRevive
        open={reviving}
        photos={photos}
        placeName={place.name}
        onClose={() => setReviving(false)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function StatCell({
  label,
  value,
  large,
}: {
  label: string;
  value: string;
  large?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.22em] text-ink-mute">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1.5 text-display text-ink",
          large ? "text-[24px] leading-none" : "text-[17px] leading-tight",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
  tone = "solid",
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  tone?: "solid" | "soft";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-colors",
        tone === "solid"
          ? active
            ? "bg-ink text-primary-foreground"
            : "bg-surface-muted text-ink-soft hover:text-ink"
          : active
            ? "border border-ink text-ink"
            : "border border-line-soft text-ink-mute hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

/**
 * PhotoTile — variable-sized cells inside a 3-col / 64px-row grid.
 * Portraits take 2 rows tall, panoramas span 2 cols, squares stay 1x1.
 * Deterministic pattern based on index → editorial feel, no shuffle.
 */
function PhotoTile({
  photo,
  index,
  onOpen,
}: {
  photo: PlacePhoto;
  index: number;
  onOpen: () => void;
}) {
  const { colSpan, rowSpan } = tileShape(photo, index);
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.4,
        delay: (index % 6) * 0.03,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative overflow-hidden rounded-[10px] bg-surface-muted"
      style={{ gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}` }}
    >
      <motion.div
        layoutId={`place-photo-${photo.id}`}
        className="absolute inset-0"
      >
        <img
          src={photo.src}
          alt={photo.caption ?? ""}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-active:scale-[0.99]"
        />
      </motion.div>
      {photo.isVideo && (
        <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm">
          <Play className="h-3 w-3 fill-current" strokeWidth={0} />
        </span>
      )}
      {photo.isFavorite && (
        <span className="absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-white/85 text-accent backdrop-blur-sm">
          <Heart className="h-3 w-3 fill-current" strokeWidth={0} />
        </span>
      )}
    </motion.button>
  );
}

function tileShape(photo: PlacePhoto, index: number) {
  // Base shape from photo ratio, gently varied by index for rhythm.
  if (photo.ratio === "pano") return { colSpan: 3, rowSpan: 2 };
  if (photo.ratio === "landscape") return { colSpan: 2, rowSpan: 2 };
  if (photo.ratio === "portrait") {
    // Every 5th portrait becomes a "tall hero" spanning 2 cols and 4 rows.
    if (index % 5 === 0) return { colSpan: 2, rowSpan: 4 };
    return { colSpan: 1, rowSpan: 3 };
  }
  // square
  return { colSpan: 1, rowSpan: 2 };
}

function shortDate(iso: string) {
  return formatLongDate(iso).replace(" de ", " ").replace(" de ", " ");
}
