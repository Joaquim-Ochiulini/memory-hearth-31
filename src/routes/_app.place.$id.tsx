import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { AlbumGrid } from "@/components/app/AlbumGrid";
import {
  getPlace,
  memoriesByPlace,
} from "@/features/memories/data";

export const Route = createFileRoute("/_app/place/$id")({
  loader: ({ params }) => {
    const place = getPlace(params.id);
    if (!place) throw notFound();
    return { place };
  },
  component: PlaceDetail,
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-ink-soft">
      Lugar não encontrado.
    </div>
  ),
});

function PlaceDetail() {
  const { place } = Route.useLoaderData();
  const mems = memoriesByPlace(place.id);

  return (
    <div className="min-h-[100dvh] bg-background pb-24">
      <div className="relative">
        <div className="h-[46vh] overflow-hidden bg-surface-muted">
          <img
            src={place.cover}
            alt={place.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
        <Link
          to="/places"
          className="absolute left-4 top-[max(1rem,env(safe-area-inset-top))] grid h-10 w-10 place-items-center rounded-full bg-surface/90 text-ink shadow-paper backdrop-blur transition-colors hover:bg-surface"
          aria-label="Voltar"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.6} />
        </Link>
      </div>

      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto -mt-6 max-w-md px-6"
      >
        <p className="text-[10px] uppercase tracking-[0.28em] text-ink-mute">
          {place.region}
        </p>
        <h1 className="mt-3 text-display text-[40px] leading-[1] text-ink">
          {place.name}
        </h1>
        <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-ink-mute">
          {mems.length} {mems.length === 1 ? "memória" : "memórias"}
        </p>
      </motion.header>

      <div className="mx-auto mt-10 max-w-md px-5">
        <AlbumGrid items={mems} />
      </div>
    </div>
  );
}
