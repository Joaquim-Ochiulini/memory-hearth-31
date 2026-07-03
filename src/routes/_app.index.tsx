import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Screen } from "@/components/app/Screen";
import { MemoryHero } from "@/components/app/MemoryHero";
import {
  featuredMemory,
  memories,
  getPlace,
} from "@/features/memories/data";
import { yearOf } from "@/utils/date";

export const Route = createFileRoute("/_app/")({
  component: HomeScreen,
});

function HomeScreen() {
  const { memory, eyebrow } = featuredMemory();
  const others = memories.filter((m) => m.id !== memory.id).slice(0, 3);

  return (
    <Screen className="pt-10">
      <header className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.32em] text-ink-mute">
          Livro
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
          Sexta-feira, 3 de julho.
        </p>
      </header>

      <MemoryHero memory={memory} eyebrow={eyebrow} />

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mt-16"
      >
        <div className="mb-5 flex items-end justify-between">
          <h3 className="text-display text-[22px] text-ink">Também nesta semana</h3>
          <Link
            to="/memories"
            className="text-[11px] uppercase tracking-[0.2em] text-ink-mute transition-colors hover:text-ink"
          >
            ver tudo
          </Link>
        </div>
        <ul className="divide-y divide-line-soft">
          {others.map((m) => {
            const place = getPlace(m.placeId);
            return (
              <li key={m.id}>
                <Link
                  to="/memory/$id"
                  params={{ id: m.id }}
                  className="group flex items-center gap-4 py-4"
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
                    <p className="truncate text-[15px] text-ink">{m.title}</p>
                    <p className="mt-0.5 truncate text-[11px] uppercase tracking-[0.16em] text-ink-mute">
                      {place?.name} · {yearOf(m.takenAt)}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </motion.section>
    </Screen>
  );
}
