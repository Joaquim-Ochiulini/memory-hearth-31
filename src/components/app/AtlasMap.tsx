import { useMemo, useRef, useState } from "react";
import { motion, useMotionValue } from "motion/react";
import type { Place } from "@/features/memories/data";

/**
 * AtlasMap — the Lumina atlas.
 *
 * Not a real geographical map: this is an emotional atlas. Warm paper
 * background, hand-drawn coastline suggestions, dotted travel lines.
 *
 * Three zoom levels:
 *   z = 1   nearby places collapse into an elegant cluster with a count
 *   z = 2   every place shows its own numbered marker
 *   z = 3   markers become small circular thumbnails of the cover photo
 *
 * Panning: drag when zoom > 1.
 */

type Marker = {
  id: string;
  x: number;
  y: number;
  count: number;
  label: string;
  covers: string[];
  singlePlaceId?: string;
};

function cluster(places: (Place & { memoryCount: number })[], threshold: number): Marker[] {
  const remaining = [...places];
  const groups: (Place & { memoryCount: number })[][] = [];
  while (remaining.length) {
    const seed = remaining.shift()!;
    const group = [seed];
    for (let i = remaining.length - 1; i >= 0; i--) {
      const p = remaining[i];
      const dx = p.x - seed.x;
      const dy = p.y - seed.y;
      if (Math.hypot(dx, dy) < threshold) {
        group.push(p);
        remaining.splice(i, 1);
      }
    }
    groups.push(group);
  }
  return groups.map((g) => {
    const cx = g.reduce((s, p) => s + p.x, 0) / g.length;
    const cy = g.reduce((s, p) => s + p.y, 0) / g.length;
    const totalMemories = g.reduce((s, p) => s + p.memoryCount, 0);
    return {
      id: g.map((p) => p.id).join("+"),
      x: cx,
      y: cy,
      count: totalMemories,
      label: g.length === 1 ? g[0].name : g[0].region,
      covers: g.slice(0, 3).map((p) => p.cover),
      singlePlaceId: g.length === 1 ? g[0].id : undefined,
    };
  });
}

export function AtlasMap({
  places,
  onOpen,
}: {
  places: (Place & { memoryCount: number })[];
  onOpen: (placeId: string) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  const markers = useMemo(() => {
    if (zoom >= 2) {
      // Individual markers per place at zoom 2 and 3.
      return places.map<Marker>((p) => ({
        id: p.id,
        x: p.x,
        y: p.y,
        count: p.memoryCount,
        label: p.name,
        covers: [p.cover],
        singlePlaceId: p.id,
      }));
    }
    return cluster(places, 0.22);
  }, [places, zoom]);

  const setZ = (next: number) => {
    const clamped = Math.max(1, Math.min(3, next));
    if (clamped === 1) {
      dragX.set(0);
      dragY.set(0);
    }
    setZoom(clamped);
  };

  const handleClick = (m: Marker) => {
    if (m.singlePlaceId) {
      onOpen(m.singlePlaceId);
    } else {
      setZ(zoom + 1);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-[oklch(0.965_0.012_82)]"
      onDoubleClick={() => setZ(zoom + 1)}
    >
      {/* Draggable world */}
      <motion.div
        drag={zoom > 1}
        dragConstraints={containerRef}
        dragElastic={0.06}
        dragTransition={{ power: 0.2, timeConstant: 260 }}
        style={{ x: dragX, y: dragY }}
        className="absolute inset-0 origin-center"
      >
        <motion.div
          initial={false}
          animate={{ scale: zoom }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-full w-full"
        >
          <MapCanvas />

          {markers.map((m, i) => {
            const isCluster = !m.singlePlaceId;
            return (
              <motion.button
                key={m.id + "-" + zoom}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick(m);
                }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.35,
                  delay: 0.05 + i * 0.04,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  left: `${m.x * 100}%`,
                  top: `${m.y * 100}%`,
                  transform: `translate(-50%, -50%) scale(${1 / zoom})`,
                  transformOrigin: "center",
                }}
                className="absolute outline-none"
                aria-label={m.label}
              >
                <MarkerShape zoom={zoom} marker={m} isCluster={isCluster} />
                {zoom >= 2 && (
                  <span className="mt-2 block whitespace-nowrap text-center text-[10px] uppercase tracking-[0.22em] text-ink-soft">
                    {m.label}
                  </span>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Zoom control — pill in the bottom-right, above the tab bar */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-end px-5"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 88px)" }}
      >
        <div className="pointer-events-auto flex flex-col overflow-hidden rounded-full border border-line-soft bg-surface/95 shadow-paper backdrop-blur-md">
          <button
            type="button"
            onClick={() => setZ(zoom + 1)}
            disabled={zoom >= 3}
            className="grid h-11 w-11 place-items-center text-ink transition-colors hover:bg-surface-muted disabled:opacity-30"
            aria-label="Aproximar"
          >
            <span className="text-lg leading-none">+</span>
          </button>
          <span className="h-px w-full bg-line-soft" />
          <button
            type="button"
            onClick={() => setZ(zoom - 1)}
            disabled={zoom <= 1}
            className="grid h-11 w-11 place-items-center text-ink transition-colors hover:bg-surface-muted disabled:opacity-30"
            aria-label="Afastar"
          >
            <span className="text-lg leading-none">−</span>
          </button>
        </div>
      </div>

      {/* Zoom hint */}
      <p
        className="pointer-events-none absolute inset-x-0 z-20 text-center text-[10px] uppercase tracking-[0.28em] text-ink-mute"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 74px)" }}
      >
        {zoom === 1
          ? "Toque num agrupamento para aproximar"
          : zoom === 2
            ? "Aproxime para ver as fotos dos lugares"
            : "Toque num lugar para abri-lo"}
      </p>
    </div>
  );
}

function MarkerShape({
  zoom,
  marker,
  isCluster,
}: {
  zoom: number;
  marker: Marker;
  isCluster: boolean;
}) {
  if (zoom >= 3 && !isCluster) {
    return (
      <span className="block h-14 w-14 overflow-hidden rounded-full border-2 border-surface bg-surface shadow-lift ring-1 ring-line-soft">
        <img
          src={marker.covers[0]}
          alt=""
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

  // Single memory at this place, low/mid zoom → small elegant dot
  if (!isCluster && marker.count === 1) {
    return (
      <span className="relative block">
        <span className="absolute inset-0 -m-2 rounded-full bg-accent/15" />
        <span className="relative block h-3 w-3 rounded-full bg-accent ring-2 ring-surface" />
      </span>
    );
  }

  // Multiple memories or cluster → numbered pill
  const size = isCluster ? 44 : 36;
  return (
    <span
      className="relative grid place-items-center rounded-full border border-line-soft bg-surface font-display text-ink shadow-lift"
      style={{ height: size, width: size }}
    >
      <span className="absolute inset-0 -m-1.5 rounded-full bg-accent/10" />
      <span className="relative text-[13px] leading-none">{marker.count}</span>
    </span>
  );
}

function MapCanvas() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <pattern id="atlas-grain" width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.22" fill="oklch(0.85 0.01 80)" opacity="0.35" />
        </pattern>
        <linearGradient id="atlas-land" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.955 0.014 82)" />
          <stop offset="100%" stopColor="oklch(0.925 0.02 76)" />
        </linearGradient>
        <linearGradient id="atlas-land-2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.94 0.016 80)" />
          <stop offset="100%" stopColor="oklch(0.9 0.024 74)" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#atlas-grain)" />
      <path
        d="M-5,58 C 12,44 26,60 42,52 C 58,44 68,62 92,54 L 110,110 L -10,110 Z"
        fill="url(#atlas-land)"
        opacity="0.9"
      />
      <path
        d="M22,8 C 36,20 54,6 78,18 C 90,22 100,14 110,20 L 110,-5 L 15,-5 Z"
        fill="url(#atlas-land-2)"
        opacity="0.55"
      />
      {[62, 70, 78, 86].map((y, i) => (
        <path
          key={i}
          d={`M-5,${y} C 20,${y - 4} 40,${y + 3} 60,${y - 2} S 95,${y + 2} 110,${y - 1}`}
          fill="none"
          stroke="oklch(0.82 0.014 78)"
          strokeWidth="0.15"
          opacity="0.55"
        />
      ))}
      <path
        d="M20,58 Q 40,48 55,52 T 85,42"
        fill="none"
        stroke="oklch(0.55 0.012 60)"
        strokeWidth="0.22"
        strokeDasharray="0.6 1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M30,68 Q 46,72 60,64 T 88,58"
        fill="none"
        stroke="oklch(0.55 0.012 60)"
        strokeWidth="0.18"
        strokeDasharray="0.5 1.4"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}
