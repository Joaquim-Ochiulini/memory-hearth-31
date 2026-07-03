import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Screen } from "@/components/app/Screen";
import { Header } from "@/components/app/Header";
import { AppCard } from "@/components/app/AppCard";
import { Gallery } from "@/components/app/Gallery";

export const Route = createFileRoute("/_app/")({
  component: HomeScreen,
});

const recent = [
  { id: "1", title: "Verão em Trancoso", caption: "Janeiro · 2024", ratio: "portrait" as const },
  { id: "2", title: "Manhãs de café", caption: "Todo dia", ratio: "portrait" as const },
];

function HomeScreen() {
  return (
    <Screen>
      <Header
        eyebrow="Livro · sexta"
        title="Bem-vindo de volta, Ana."
        description="Um lugar silencioso para guardar o que importa."
      />

      <AppCard className="mb-8 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink-mute">
            Este mês
          </p>
          <p className="mt-1 text-display text-2xl text-ink">14 memórias</p>
          <p className="mt-1 text-xs text-ink-soft">3 lugares · 8 pessoas</p>
        </div>
        <button
          type="button"
          aria-label="Abrir resumo"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-primary-foreground transition-opacity hover:opacity-90"
        >
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
        </button>
      </AppCard>

      <section className="mb-2 flex items-end justify-between">
        <h2 className="text-display text-xl text-ink">Recentes</h2>
        <span className="text-[11px] uppercase tracking-[0.18em] text-ink-mute">
          ver tudo
        </span>
      </section>
      <Gallery items={recent} />
    </Screen>
  );
}
