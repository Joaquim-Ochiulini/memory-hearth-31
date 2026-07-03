import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { StylisedMap } from "@/components/app/StylisedMap";
import { BottomSheet } from "@/components/app/BottomSheet";
import {
  places,
  getPlace,
  memoriesByPlace,
} from "@/features/memories/data";
import { formatLongDate } from "@/utils/date";

export const Route = createFileRoute("/_app/places")({
  component: PlacesScreen,
});

function PlacesScreen() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = activeId ? getPlace(activeId) : null;
  const activeMemories = active ? memoriesByPlace(active.id) : [];
  const first = activeMemories[activeMemories.length - 1];
  const last = activeMemories[0];

  return (
    <div className="fixed inset-0 top-0 bg-background">
      {/* Top overlay: quiet title */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 px-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <p className="text-[10px] uppercase tracking-[0.28em] text-ink-mute">
          Mapa
        </p>
        <h1 className="mt-2 text-display text-[28px] leading-none text-ink">
          Lugares
        </h1>
      </div>

      <StylisedMap
        places={places}
        activeId={activeId}
        onSelect={setActiveId}
      />

      <BottomSheet open={!!active} onClose={() => setActiveId(null)}>
        {active && (
          <div className="px-6 pt-4 pb-2">
            <div className="overflow-hidden rounded-[16px] bg-surface-muted">
              <div className="aspect-[16/10]">
                <img
                  src={active.cover}
                  alt={active.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="mt-5">
              <p className="text-[10px] uppercase tracking-[0.24em] text-ink-mute">
                {active.region}
              </p>
              <h2 className="mt-2 text-display text-[28px] leading-[1.05] text-ink">
                {active.name}
              </h2>
            </div>
            <dl className="mt-5 grid grid-cols-3 gap-4 border-t border-line-soft pt-5">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.18em] text-ink-mute">
                  Memórias
                </dt>
                <dd className="mt-1 text-display text-[22px] text-ink">
                  {activeMemories.length}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.18em] text-ink-mute">
                  Primeira
                </dt>
                <dd className="mt-1 text-[13px] text-ink-soft">
                  {first ? formatLongDate(first.takenAt) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.18em] text-ink-mute">
                  Última
                </dt>
                <dd className="mt-1 text-[13px] text-ink-soft">
                  {last ? formatLongDate(last.takenAt) : "—"}
                </dd>
              </div>
            </dl>
            <Link
              to="/place/$id"
              params={{ id: active.id }}
              className="mt-6 inline-flex w-full items-center justify-between rounded-full bg-ink px-5 py-3.5 text-[13px] font-medium tracking-wide text-primary-foreground transition-opacity hover:opacity-90"
            >
              Abrir lugar
              <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
            </Link>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
