import { createFileRoute } from "@tanstack/react-router";
import { Screen } from "@/components/app/Screen";
import { Header } from "@/components/app/Header";

export const Route = createFileRoute("/_app/people")({
  component: PeopleScreen,
});

const people = [
  { id: "1", name: "Ana Ribeiro", note: "48 memórias" },
  { id: "2", name: "Léo", note: "22 memórias" },
  { id: "3", name: "Vovó Cecília", note: "17 memórias" },
  { id: "4", name: "Marina", note: "9 memórias" },
  { id: "5", name: "Pedro", note: "6 memórias" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

function PeopleScreen() {
  return (
    <Screen>
      <Header eyebrow="Rostos" title="Pessoas" />
      <ul className="divide-y divide-line-soft rounded-2xl border border-line-soft bg-surface">
        {people.map((p) => (
          <li key={p.id} className="flex items-center gap-4 px-4 py-3.5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-muted text-sm font-medium text-ink-soft">
              {initials(p.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] text-ink">{p.name}</p>
              <p className="text-xs text-ink-mute">{p.note}</p>
            </div>
          </li>
        ))}
      </ul>
    </Screen>
  );
}
