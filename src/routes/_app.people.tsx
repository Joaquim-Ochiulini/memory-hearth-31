import { createFileRoute } from "@tanstack/react-router";
import { Screen } from "@/components/app/Screen";
import { PeopleCollection } from "@/components/app/PeopleCollection";
import { people } from "@/features/memories/data";

export const Route = createFileRoute("/_app/people")({
  component: PeopleScreen,
});

function PeopleScreen() {
  return (
    <Screen className="pt-10">
      <header className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.28em] text-ink-mute">
          Rostos
        </p>
        <h1 className="mt-3 text-display text-[40px] leading-[1] text-ink">
          Pessoas
        </h1>
        <p className="mt-4 max-w-[30ch] text-[14px] leading-relaxed text-ink-soft">
          As pessoas que atravessam essas páginas.
        </p>
      </header>
      <PeopleCollection people={people} />
    </Screen>
  );
}
