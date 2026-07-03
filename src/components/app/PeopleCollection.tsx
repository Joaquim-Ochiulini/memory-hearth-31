import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { Person } from "@/features/memories/data";
import { memoriesByPerson } from "@/features/memories/data";

/**
 * PeopleCollection — a quiet grid of round portraits.
 * Deliberately not a list: faces first, name second.
 */
export function PeopleCollection({ people }: { people: Person[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-9">
      {people.map((p, i) => {
        const count = memoriesByPerson(p.id).length;
        return (
          <li key={p.id}>
            <Link
              to="/person/$id"
              params={{ id: p.id }}
              className="group flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="relative aspect-square w-full overflow-hidden rounded-full bg-surface-muted"
              >
                <img
                  src={p.avatar}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-active:scale-[0.98]"
                />
              </motion.div>
              <p className="mt-4 text-display text-[17px] leading-tight text-ink">
                {p.name}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-ink-mute">
                {count} {count === 1 ? "memória" : "memórias"}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
