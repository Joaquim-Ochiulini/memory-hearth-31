import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { HomeHero } from "@/components/app/HomeHero";
import {
  featuredMemory,
  memories,
  people,
  places,
  getPlace,
  memoriesByPlace,
} from "@/features/memories/data";
import { formatLongDate } from "@/utils/date";

export const Route = createFileRoute("/_app/")({
  component: HomeScreen,
});

/**
 * Home — the cover and first pages of the book.
 * Vertical, generous whitespace between sections. No dashboard density.
 *
 * Sections, in order:
 *   1. Hero (single dominant photograph)
 *   2. Continue reading (only when there's a resume state — hidden for now)
 *   3. Recent memories (few, photo-first)
 *   4. People (a handful of round portraits + "Ver todas")
 *   5. Places (three, discreet)
 *   6. Closing quote
 */
function HomeScreen() {
  const { memory: hero, eyebrow } = featuredMemory();

  const recent = memories
    .filter((m) => m.id !== hero.id)
    .slice()
    .sort((a, b) => (a.takenAt < b.takenAt ? 1 : -1))
    .slice(0, 3);

  const facesPreview = people.slice(0, 5);
  const placesPreview = places.slice(0, 3);

  // Placeholder for "continue reading" — wired up when persistence lands.
  const resume: { id: string; title: string; cover: string } | null = null;

  return (
    <div className="pb-32">
      {/* 1 — Hero */}
      <HomeHero memory={hero} eyebrow={eyebrow} />

      {/* 2 — Continue reading */}
      {resume && (
        <section className="mx-auto mt-20 max-w-md px-6">
          <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-ink-mute">
            Continue de onde parou
          </p>
          <Link
            to="/memory/$id"
            params={{ id: resume.id }}
            className="flex items-center gap-4 rounded-2xl bg-surface p-3 hairline border"
          >
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
              <img src={resume.cover} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] text-ink">{resume.title}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-ink-mute">
                retomar leitura
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-ink-mute" strokeWidth={1.6} />
          </Link>
        </section>
      )}

      {/* 3 — Recent memories */}
      <Section eyebrow="Memórias recentes" className="mt-24">
        <ul className="space-y-16">
          {recent.map((m, i) => {
            const place = getPlace(m.placeId);
            return (
              <motion.li
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to="/memory/$id" params={{ id: m.id }} className="group block">
                  <motion.div
                    layoutId={`memory-cover-${m.id}`}
                    className="overflow-hidden rounded-[16px] bg-surface-muted"
                  >
                    <div className="aspect-[4/5]">
                      <img
                        src={m.cover}
                        alt={m.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-active:scale-[0.995]"
                      />
                    </div>
                  </motion.div>
                  <div className="mt-5 px-1">
                    <h3 className="text-display text-[22px] leading-tight text-ink">
                      {m.title}
                    </h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                      {m.phrase}
                    </p>
                    <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-ink-mute">
                      {formatLongDate(m.takenAt)}
                      {place ? <><span className="mx-2 text-line">·</span>{place.name}</> : null}
                    </p>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </Section>

      {/* 4 — People */}
      <Section eyebrow="Pessoas" className="mt-28">
        <ul className="-mx-6 flex gap-5 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {facesPreview.map((p, i) => (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="shrink-0"
            >
              <Link to="/person/$id" params={{ id: p.id }} className="block text-center">
                <div className="h-[88px] w-[88px] overflow-hidden rounded-full bg-surface-muted">
                  <img src={p.avatar} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <p className="mt-3 text-display text-[14px] leading-tight text-ink">
                  {p.name.split(" ")[0]}
                </p>
              </Link>
            </motion.li>
          ))}
        </ul>
        <div className="mt-6">
          <Link
            to="/people"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-ink-mute transition-colors hover:text-ink"
          >
            Ver todas
            <span aria-hidden className="h-px w-6 bg-current" />
          </Link>
        </div>
      </Section>

      {/* 5 — Places */}
      <Section eyebrow="Lugares" className="mt-28">
        <ul className="space-y-6">
          {placesPreview.map((pl, i) => {
            const count = memoriesByPlace(pl.id).length;
            return (
              <motion.li
                key={pl.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
              >
                <Link
                  to="/place/$id"
                  params={{ id: pl.id }}
                  className="group block overflow-hidden rounded-[16px] bg-surface"
                >
                  <div className="relative">
                    <div className="aspect-[16/10] overflow-hidden bg-surface-muted">
                      <img
                        src={pl.cover}
                        alt={pl.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-active:scale-[0.995]"
                      />
                    </div>
                  </div>
                  <div className="flex items-end justify-between gap-4 px-1 pt-4">
                    <div>
                      <h3 className="text-display text-[20px] leading-tight text-ink">
                        {pl.name}
                      </h3>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-ink-mute">
                        {count} {count === 1 ? "memória" : "memórias"}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] uppercase tracking-[0.24em] text-ink-mute transition-colors group-hover:text-ink">
                      abrir
                    </span>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </Section>

      {/* 6 — Closing */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mx-auto mt-32 max-w-md px-10 text-center"
      >
        <p className="text-display text-[20px] leading-[1.4] text-ink-soft italic">
          “A vida é feita de momentos<br />que merecem ser lembrados.”
        </p>
        <div className="mx-auto mt-8 h-px w-10 bg-line" />
      </motion.section>
    </div>
  );
}

function Section({
  eyebrow,
  children,
  className = "",
}: {
  eyebrow: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mx-auto max-w-md px-6 ${className}`}>
      <header className="mb-8 flex items-baseline justify-between">
        <p className="text-[10px] uppercase tracking-[0.32em] text-ink-mute">
          {eyebrow}
        </p>
      </header>
      {children}
    </section>
  );
}
