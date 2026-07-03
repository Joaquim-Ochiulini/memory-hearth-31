import { createFileRoute } from "@tanstack/react-router";
import { Screen } from "@/components/app/Screen";
import { Header } from "@/components/app/Header";
import { SearchField } from "@/components/app/SearchField";
import { Gallery, type GalleryItem } from "@/components/app/Gallery";

export const Route = createFileRoute("/_app/memories")({
  component: MemoriesScreen,
});

const items: GalleryItem[] = [
  { id: "a", title: "Serra da Mantiqueira", caption: "Junho · 2024", ratio: "portrait" },
  { id: "b", title: "Casa da vovó", caption: "Domingo", ratio: "square" },
  { id: "c", title: "Cais de Belém", caption: "Verão", ratio: "portrait" },
  { id: "d", title: "Cozinha à noite", caption: "Rotina", ratio: "landscape" },
  { id: "e", title: "Praia deserta", caption: "Ago · 2023", ratio: "portrait" },
  { id: "f", title: "Aniversário de Léo", caption: "5 anos", ratio: "square" },
];

function MemoriesScreen() {
  return (
    <Screen>
      <Header eyebrow="Álbum" title="Memórias" />
      <div className="mb-6">
        <SearchField placeholder="Buscar por título, data ou lugar" />
      </div>
      <Gallery items={items} />
    </Screen>
  );
}
