import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AtlasMap } from "@/components/app/AtlasMap";
import { places, memoriesByPlace } from "@/features/memories/data";

export const Route = createFileRoute("/_app/places")({
  component: PlacesScreen,
});

function PlacesScreen() {
  const navigate = useNavigate();
  const enriched = places.map((p) => ({
    ...p,
    memoryCount: memoriesByPlace(p.id).length,
  }));

  return (
    <div className="fixed inset-0 bg-background">
      {/* Quiet top label — no chrome, no border */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 px-6"
        style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
      >
        <p className="text-[10px] uppercase tracking-[0.32em] text-ink-mute">
          Atlas
        </p>
        <h1 className="mt-1.5 text-display text-[26px] leading-none text-ink">
          Lugares
        </h1>
      </div>

      <AtlasMap
        places={enriched}
        onOpen={(id) => navigate({ to: "/place/$id", params: { id } })}
      />
    </div>
  );
}
