import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { Screen } from "@/components/app/Screen";
import { Header } from "@/components/app/Header";
import { AppCard } from "@/components/app/AppCard";

export const Route = createFileRoute("/_app/places")({
  component: PlacesScreen,
});

const places = [
  { id: "1", name: "Rio de Janeiro", count: 32, region: "Brasil" },
  { id: "2", name: "Trancoso", count: 18, region: "Bahia" },
  { id: "3", name: "Lisboa", count: 11, region: "Portugal" },
  { id: "4", name: "Serra da Mantiqueira", count: 7, region: "Minas Gerais" },
];

function PlacesScreen() {
  return (
    <Screen>
      <Header eyebrow="Mapa" title="Lugares" />
      <div className="grid gap-3">
        {places.map((p) => (
          <AppCard key={p.id} className="flex items-center gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-muted text-ink-soft">
              <MapPin className="h-4 w-4" strokeWidth={1.6} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] text-ink">{p.name}</p>
              <p className="text-xs text-ink-mute">{p.region}</p>
            </div>
            <p className="shrink-0 text-display text-lg text-ink">{p.count}</p>
          </AppCard>
        ))}
      </div>
    </Screen>
  );
}
