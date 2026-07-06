import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Clock, Sparkles, MapPin } from "lucide-react";
import {
  places,
  people,
  memories,
  memoriesByPlace,
  type Place,
  type Person,
  type Memory,
} from "@/features/memories/data";
import { formatLongDate } from "@/utils/date";

export type SearchResult =
  | { kind: "place"; id: string; title: string; subtitle: string }
  | { kind: "person"; id: string; title: string; subtitle: string }
  | { kind: "memory"; id: string; title: string; subtitle: string; placeId: string };

interface Props {
  open: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  onClose: () => void;
  onSelect: (r: SearchResult) => void;
  recent: string[];
}

export function PlaceSearchPanel({
  open,
  query,
  onQueryChange,
  onClose,
  onSelect,
  recent,
}: Props) {
  const q = query.trim().toLowerCase();

  const results = useMemo<SearchResult[]>(() => {
    if (!q) return [];
    const out: SearchResult[] = [];
    for (const p of places) {
      if (
        p.name.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q)
      ) {
        out.push({ kind: "place", id: p.id, title: p.name, subtitle: p.region });
      }
    }
    for (const person of people) {
      if (person.name.toLowerCase().includes(q)) {
        out.push({
          kind: "person",
          id: person.id,
          title: person.name,
          subtitle: "Pessoa",
        });
      }
    }
    for (const m of memories) {
      const place = places.find((p) => p.id === m.placeId);
      const hay = `${m.title} ${m.phrase} ${formatLongDate(m.takenAt)}`.toLowerCase();
      if (hay.includes(q)) {
        out.push({
          kind: "memory",
          id: m.id,
          title: m.title,
          subtitle: place ? `${place.name} · ${formatLongDate(m.takenAt)}` : m.phrase,
          placeId: m.placeId,
        });
      }
    }
    return out.slice(0, 20);
  }, [q]);

  const popular = useMemo(() => {
    return [...places]
      .map((p) => ({ p, count: memoriesByPlace(p.id).length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(({ p }) => p);
  }, []);

  const suggestions = useMemo(
    () => places.filter((p) => !popular.find((pp) => pp.id === p.id)).slice(0, 4),
    [popular],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 bg-background"
          style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
        >
          <div className="mx-auto flex h-full max-w-md flex-col">
            {/* Search input header */}
            <div className="flex items-center gap-2 px-4 pb-3">
              <label className="flex h-11 flex-1 items-center gap-2 rounded-full border border-line bg-surface px-4">
                <Search className="h-4 w-4 text-ink-mute" strokeWidth={1.6} />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder="Pesquisar lugares, pessoas ou memórias..."
                  className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-mute"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => onQueryChange("")}
                    className="grid h-6 w-6 place-items-center rounded-full text-ink-mute hover:text-ink"
                    aria-label="Limpar"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={1.8} />
                  </button>
                )}
              </label>
              <button
                type="button"
                onClick={onClose}
                className="text-[13px] text-ink-soft transition-colors hover:text-ink"
              >
                Cancelar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-10 pt-2">
              {q ? (
                <ResultsList results={results} onSelect={onSelect} />
              ) : (
                <BrowseLists
                  recent={recent}
                  popular={popular}
                  suggestions={suggestions}
                  onSelect={onSelect}
                />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ResultsList({
  results,
  onSelect,
}: {
  results: SearchResult[];
  onSelect: (r: SearchResult) => void;
}) {
  if (results.length === 0) {
    return (
      <p className="mt-10 text-center text-[13px] text-ink-mute">
        Nada encontrado para essa busca.
      </p>
    );
  }
  return (
    <ul className="space-y-1">
      {results.map((r) => (
        <li key={`${r.kind}-${r.id}`}>
          <button
            type="button"
            onClick={() => onSelect(r)}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-surface-muted"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-muted text-ink-soft">
              {r.kind === "place" ? (
                <MapPin className="h-4 w-4" strokeWidth={1.5} />
              ) : r.kind === "person" ? (
                <PersonAvatar id={r.id} />
              ) : (
                <Sparkles className="h-4 w-4" strokeWidth={1.5} />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-display text-[17px] leading-tight text-ink">
                {r.title}
              </span>
              <span className="block truncate text-[12px] text-ink-mute">
                {r.subtitle}
              </span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-ink-mute">
              {r.kind === "place" ? "Lugar" : r.kind === "person" ? "Pessoa" : "Memória"}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function BrowseLists({
  recent,
  popular,
  suggestions,
  onSelect,
}: {
  recent: string[];
  popular: Place[];
  suggestions: Place[];
  onSelect: (r: SearchResult) => void;
}) {
  return (
    <div className="space-y-9">
      {recent.length > 0 && (
        <Section title="Pesquisas recentes">
          <ul className="space-y-1">
            {recent.map((r) => {
              const p = places.find(
                (pp) => pp.name.toLowerCase() === r.toLowerCase(),
              );
              return (
                <li key={r}>
                  <button
                    type="button"
                    onClick={() =>
                      p
                        ? onSelect({
                            kind: "place",
                            id: p.id,
                            title: p.name,
                            subtitle: p.region,
                          })
                        : undefined
                    }
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-surface-muted"
                  >
                    <Clock className="h-4 w-4 text-ink-mute" strokeWidth={1.5} />
                    <span className="text-[14px] text-ink">{r}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      <Section title="Lugares mais visitados">
        <ul className="space-y-2">
          {popular.map((p) => (
            <PlaceRow key={p.id} place={p} onSelect={onSelect} />
          ))}
        </ul>
      </Section>

      <Section title="Sugestões">
        <ul className="space-y-2">
          {suggestions.map((p) => (
            <PlaceRow key={p.id} place={p} onSelect={onSelect} />
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="mb-3 text-[10px] uppercase tracking-[0.32em] text-ink-mute">
        {title}
      </p>
      {children}
    </section>
  );
}

function PlaceRow({
  place,
  onSelect,
}: {
  place: Place;
  onSelect: (r: SearchResult) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() =>
          onSelect({
            kind: "place",
            id: place.id,
            title: place.name,
            subtitle: place.region,
          })
        }
        className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-surface-muted"
      >
        <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
          <img
            src={place.cover}
            alt={place.name}
            className="h-full w-full object-cover"
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-display text-[17px] leading-tight text-ink">
            {place.name}
          </span>
          <span className="block truncate text-[12px] text-ink-mute">
            {place.region}
          </span>
        </span>
      </button>
    </li>
  );
}

function PersonAvatar({ id }: { id: string }) {
  const person = people.find((p) => p.id === id);
  if (!person) return null;
  return (
    <img
      src={person.avatar}
      alt=""
      className="h-full w-full rounded-full object-cover"
    />
  );
}

// Re-exports used by parent for typing
export type { Person, Memory };
