import { motion } from "motion/react";
import type { Place } from "@/features/memories/data";

/**
 * StylisedMap — a full-screen, hand-drawn feeling map.
 * We deliberately avoid a real geographical map here: the app is an
 * emotional album, not a navigation tool. Curves suggest coastline,
 * dotted lines suggest paths, and markers hold the memories.
 */
export function StylisedMap({
  places,
  activeId,
  onSelect,
}: {
  places: Place[];
  activeId?: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[oklch(0.965_0.012_82)]">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <pattern id="grain" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.25" fill="oklch(0.85 0.01 80)" opacity="0.4" />
          </pattern>
          <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.955 0.014 82)" />
            <stop offset="100%" stopColor="oklch(0.93 0.018 78)" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#grain)" />
        {/* Abstract landmasses */}
        <path
          d="M-5,55 C 15,40 30,58 45,50 C 60,42 70,60 90,52 L 110,110 L -10,110 Z"
          fill="url(#land)"
          opacity="0.9"
        />
        <path
          d="M20,10 C 35,20 55,8 80,18 C 92,22 100,15 110,20 L 110,-5 L 15,-5 Z"
          fill="url(#land)"
          opacity="0.55"
        />
        {/* Contour lines */}
        {[65, 72, 79, 86].map((y, i) => (
          <path
            key={i}
            d={`M-5,${y} C 20,${y - 4} 40,${y + 3} 60,${y - 2} S 95,${y + 2} 110,${y - 1}`}
            fill="none"
            stroke="oklch(0.82 0.014 78)"
            strokeWidth="0.15"
            opacity="0.6"
          />
        ))}
        {/* Dotted path between two anchor places for narrative */}
        <path
          d="M20,55 Q 40,45 55,50 T 85,40"
          fill="none"
          stroke="oklch(0.55 0.012 60)"
          strokeWidth="0.25"
          strokeDasharray="0.6 1.2"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>

      {/* Markers */}
      {places.map((p, i) => {
        const active = p.id === activeId;
        return (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -translate-x-1/2 -translate-y-full outline-none"
            style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
            aria-label={p.name}
          >
            <span
              className={`grid h-8 w-8 place-items-center rounded-full border transition-all duration-200 ${
                active
                  ? "scale-110 border-ink bg-ink text-primary-foreground shadow-lift"
                  : "border-line-soft bg-surface text-ink shadow-paper"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
            </span>
            <span className="mx-auto mt-1 block h-2 w-[1px] bg-ink/40" />
            <span
              className={`mt-1 block whitespace-nowrap text-[10px] uppercase tracking-[0.16em] transition-colors ${
                active ? "text-ink" : "text-ink-soft"
              }`}
            >
              {p.name}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
