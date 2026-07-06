import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Search, Compass } from "lucide-react";
import { GoogleAtlasMap } from "@/components/app/GoogleAtlasMap";
import { PlaceMapSheet } from "@/components/app/PlaceMapSheet";
import {
  PlaceSearchPanel,
  type SearchResult,
} from "@/components/app/PlaceSearchPanel";
import {
  places,
  memoriesByPlace,
  placeStats,
  getMemory,
} from "@/features/memories/data";

export const Route = createFileRoute("/_app/places")({
  component: PlacesScreen,
});

function PlacesScreen() {
  const navigate = useNavigate();

  const enriched = useMemo(
    () =>
      places.map((p) => ({
        ...p,
        memoryCount: memoriesByPlace(p.id).length,
      })),
    [],
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [focus, setFocus] = useState<
    { lat: number; lng: number; zoom?: number } | null
  >(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([
    "Casa da vovó",
    "Trancoso",
    "Lisboa",
  ]);
  const [exploreHint, setExploreHint] = useState<string | null>(null);

  const activePlace = activeId ? places.find((p) => p.id === activeId) : null;

  const openPlaceOnMap = (id: string) => {
    const p = places.find((pp) => pp.id === id);
    if (!p) return;
    setActiveId(id);
    setFocus({ lat: p.lat, lng: p.lng, zoom: 9 });
    setRecent((r) =>
      [p.name, ...r.filter((x) => x.toLowerCase() !== p.name.toLowerCase())].slice(
        0,
        5,
      ),
    );
  };

  const handleSelectResult = (r: SearchResult) => {
    setSearchOpen(false);
    setQuery("");
    if (r.kind === "place") {
      openPlaceOnMap(r.id);
    } else if (r.kind === "memory") {
      openPlaceOnMap(r.placeId);
    } else if (r.kind === "person") {
      navigate({ to: "/person/$id", params: { id: r.id } });
    }
  };

  const runExplore = () => {
    // Sample a "curatorial" hint: least-recently-visited high-memory place.
    const candidates = places
      .map((p) => {
        const s = placeStats(p.id);
        return { place: p, stats: s };
      })
      .filter((x) => x.stats.memoryCount > 0);

    if (candidates.length === 0) return;

    const now = new Date();
    const scored = candidates.map(({ place, stats }) => {
      const last = stats.lastVisit
        ? new Date(stats.lastVisit + "T00:00:00Z")
        : new Date(0);
      const yearsAgo =
        (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return { place, stats, yearsAgo };
    });

    scored.sort(
      (a, b) => b.yearsAgo * 2 + b.stats.memoryCount - (a.yearsAgo * 2 + a.stats.memoryCount),
    );
    const pick = scored[0];

    let hint: string;
    if (pick.yearsAgo >= 2) {
      hint = `Você não visita ${pick.place.name} há ${Math.floor(pick.yearsAgo)} anos.`;
    } else if (pick.stats.memoryCount >= 3) {
      hint = `Aqui aconteceram ${pick.stats.memoryCount} momentos importantes.`;
    } else {
      hint = `${pick.place.name} guarda ${pick.stats.photoCount} fotografias suas.`;
    }
    setExploreHint(hint);
    openPlaceOnMap(pick.place.id);
    setTimeout(() => setExploreHint(null), 4200);
  };

  return (
    <div className="fixed inset-0 bg-background">
      <GoogleAtlasMap
        places={enriched}
        activeId={activeId}
        onSelect={openPlaceOnMap}
        focus={focus}
      />

      {/* Top: quiet label + fixed search + explore */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 px-4"
        style={{ paddingTop: "max(0.9rem, env(safe-area-inset-top))" }}
      >
        <div className="pointer-events-auto mx-auto max-w-md">
          <div className="mb-2 px-2">
            <p className="text-[10px] uppercase tracking-[0.32em] text-ink-mute">
              Atlas
            </p>
            <h1 className="mt-0.5 text-display text-[22px] leading-none text-ink">
              Lugares
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-12 flex-1 items-center gap-3 rounded-full border border-line bg-surface/95 px-4 text-left shadow-paper backdrop-blur-md transition-colors hover:bg-surface"
            >
              <Search className="h-4 w-4 text-ink-mute" strokeWidth={1.6} />
              <span className="truncate text-[13.5px] text-ink-mute">
                Pesquisar lugares, pessoas ou memórias...
              </span>
            </button>
            <button
              type="button"
              onClick={runExplore}
              aria-label="Explorar"
              title="Explorar"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line bg-surface/95 text-ink shadow-paper backdrop-blur-md transition-colors hover:bg-surface"
            >
              <Compass className="h-5 w-5 text-accent" strokeWidth={1.5} />
            </button>
          </div>

          <AnimatePresence>
            {exploreHint && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="mx-auto mt-3 max-w-[92%] rounded-full bg-ink/90 px-4 py-2 text-center text-[12px] font-medium tracking-wide text-primary-foreground shadow-paper backdrop-blur-md"
              >
                {exploreHint}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <PlaceMapSheet
        place={activePlace ?? null}
        onClose={() => setActiveId(null)}
        onOpenPlace={(id) => navigate({ to: "/place/$id", params: { id } })}
      />

      <PlaceSearchPanel
        open={searchOpen}
        query={query}
        onQueryChange={setQuery}
        onClose={() => {
          setSearchOpen(false);
          setQuery("");
        }}
        onSelect={handleSelectResult}
        recent={recent}
      />
    </div>
  );
}

// Suppress unused-import warnings for helpers imported for typing/future use.
export const _unused = { getMemory };
