import { createFileRoute } from "@tanstack/react-router";
import { Screen } from "@/components/app/Screen";
import { AlbumGrid } from "@/components/app/AlbumGrid";
import { memories } from "@/features/memories/data";

export const Route = createFileRoute("/_app/memories")({
  component: MemoriesScreen,
});

function MemoriesScreen() {
  return (
    <Screen className="pt-10">
      <header className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.28em] text-ink-mute">
          Álbum
        </p>
        <h1 className="mt-3 text-display text-[40px] leading-[1] text-ink">
          Memórias
        </h1>
        <p className="mt-4 max-w-[30ch] text-[14px] leading-relaxed text-ink-soft">
          Um lugar silencioso para folhear o que já viveu.
        </p>
      </header>
      <AlbumGrid items={memories} />
    </Screen>
  );
}
