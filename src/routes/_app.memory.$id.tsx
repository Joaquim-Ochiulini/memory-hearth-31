import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ChevronLeft } from "lucide-react";
import {
  getMemory,
  getPlace,
  getPerson,
  type Person,
} from "@/features/memories/data";
import { formatLongDate } from "@/utils/date";

export const Route = createFileRoute("/_app/memory/$id")({
  loader: ({ params }) => {
    const memory = getMemory(params.id);
    if (!memory) throw notFound();
    return { memory };
  },
  component: MemoryDetail,
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-ink-soft">
      Memória não encontrada.
    </div>
  ),
});

function MemoryDetail() {
  const { memory } = Route.useLoaderData();
  const place = getPlace(memory.placeId);
  const persons: Person[] = memory.personIds
    .map(getPerson)
    .filter((p): p is Person => Boolean(p));

  return (
    <div className="min-h-[100dvh] bg-background pb-24">
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 bg-background/85 backdrop-blur-xl">
        <Link
          to="/"
          className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-surface-muted"
          aria-label="Voltar"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.6} />
        </Link>
        <p className="text-[10px] uppercase tracking-[0.24em] text-ink-mute">
          {formatLongDate(memory.takenAt)}
        </p>
        <span className="h-10 w-10" />
      </div>

      {/* Cover — full-bleed, opens like a page */}
      <motion.figure
        layoutId={`memory-cover-${memory.id}`}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-md px-4"
      >
        <div className="relative overflow-hidden rounded-[18px] bg-surface-muted">
          <div className="aspect-[3/4]">
            <img
              src={memory.cover}
              alt={memory.title}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </motion.figure>

      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-10 max-w-md px-6"
      >
        <p className="text-[10px] uppercase tracking-[0.28em] text-ink-mute">
          {place?.name ?? "—"}
        </p>
        <h1 className="mt-3 text-display text-[36px] leading-[1.05] text-ink">
          {memory.title}
        </h1>
        <p className="mt-5 text-[16px] leading-[1.7] text-ink-soft">
          {memory.phrase}
        </p>

        {persons.length > 0 && (
          <div className="mt-10 border-t border-line-soft pt-6">
            <p className="text-[10px] uppercase tracking-[0.24em] text-ink-mute">
              Com
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-4">
              {persons.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/person/$id"
                    params={{ id: p.id }}
                    className="flex items-center gap-3"
                  >
                    <span className="h-9 w-9 overflow-hidden rounded-full bg-surface-muted">
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    </span>
                    <span className="text-[14px] text-ink">{p.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.article>
    </div>
  );
}
