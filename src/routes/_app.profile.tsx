import { createFileRoute } from "@tanstack/react-router";
import { Screen } from "@/components/app/Screen";
import { Header } from "@/components/app/Header";
import { AppCard } from "@/components/app/AppCard";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_app/profile")({
  component: ProfileScreen,
});

const sections = [
  { label: "Conta", hint: "Nome, e-mail, foto" },
  { label: "Aparência", hint: "Tema, tipografia" },
  { label: "Privacidade", hint: "Compartilhamento" },
  { label: "Sobre o Livro", hint: "Versão 0.1" },
];

function ProfileScreen() {
  return (
    <Screen>
      <Header eyebrow="Você" title="Perfil" />

      <AppCard className="mb-6 flex items-center gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-ink text-lg text-primary-foreground">
          AR
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] text-ink">Ana Ribeiro</p>
          <p className="truncate text-xs text-ink-mute">ana@livro.app</p>
        </div>
      </AppCard>

      <ul className="divide-y divide-line-soft overflow-hidden rounded-2xl border border-line-soft bg-surface">
        {sections.map((s) => (
          <li key={s.label}>
            <button
              type="button"
              className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-surface-muted"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] text-ink">{s.label}</p>
                <p className="truncate text-xs text-ink-mute">{s.hint}</p>
              </div>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-ink-mute"
                strokeWidth={1.6}
              />
            </button>
          </li>
        ))}
      </ul>
    </Screen>
  );
}
