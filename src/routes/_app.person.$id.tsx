import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import {
  getPerson,
  memoriesByPerson,
  getPlace,
} from "@/features/memories/data";
import { formatLongDate, yearOf } from "@/utils/date";

export const Route = createFileRoute("/_app/person/$id")({
  loader: ({ params }) => {
    const person = getPerson(params.id);
    if (!person) throw notFound();
    return { person };
  },
  component: PersonDetail,
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-ink-soft">
      Pessoa não encontrada.
    </div>
  ),
});

function PersonDetail() {
  const { person } = Route.useLoaderData();
  const mems = memoriesByPerson(person.id);
  const years = Array.from(new Set(mems.map((m) => yearOf(m.takenAt)))).sort(
    (a, b) => b - a,
  );

  return (
    <div className="min-h-[100dvh] bg-background pb-24">
      <div className="sticky top-0 z-30 flex items-center px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 bg-background/85 backdrop-blur-xl">
        <Link
          to="/people"
          className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-surface-muted"
          aria-label="Voltar"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.6} />
        </Link>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-md px-6 pt-4 text-center"
      >
        <div className="mx-auto h-40 w-40 overflow-hidden rounded-full bg-surface-muted">
          <img
            src={person.avatar}
            alt={person.name}
            className="h-full w-full object-cover"
          />
        </div>
        <h1 className="mt-6 text-display text-[36px] leading-[1.05] text-ink">
          {person.name}
        </h1>
        <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-ink-mute">
          {mems.length} {mems.length === 1 ? "memória" : "memórias"}
        </p>
      </motion.section>

      <div className="mx-auto mt-12 max-w-md px-6">
        {years.map((y) => {
          const yearMems = mems.filter((m) => yearOf(m.takenAt) === y);
          return (
            <section key={y} className="mb-10">
              <div className="mb-4 flex items-baseline justify-between border-b border-line-soft pb-2">
                <h2 className="text-display text-[22px] text-ink">{y}</h2>
                <p className="text-[10px] uppercase tracking-[0.2em] text-ink-mute">
                  {yearMems.length}
                </p>
              </div>
              <ul className="space-y-4">
                {yearMems.map((m) => {
                  const place = getPlace(m.placeId);
                  return (
                    <li key={m.id}>
                      <Link
                        to="/memory/$id"
                        params={{ id: m.id }}
                        className="group flex items-center gap-4"
                      >
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[10px] bg-surface-muted">
                          <img
                            src={m.cover}
                            alt={m.title}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] text-ink">
                            {m.title}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] uppercase tracking-[0.16em] text-ink-mute">
                            {place?.name} · {formatLongDate(m.takenAt)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
