import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import type { Place } from "@/features/memories/data";

/**
 * AtlasMap — the Lumina atlas.
 *
 * A living, gesture-driven map:
 *  · one-finger drag pans in any direction
 *  · two-finger pinch zooms in/out around the pinch centroid
 *  · double-tap zooms in around the tap point
 *  · +/− buttons remain as a discreet fallback
 *
 * Zoom range 1 → 4. Markers stay screen-sized and cluster tighter
 * as the map is zoomed in. Camera state (tx, ty, scale) is preserved
 * across navigation so returning from a place restores the same view.
 */

type Marker = {
  id: string;
  x: number; // normalised 0-1 in map space
  y: number;
  count: number;
  label: string;
  covers: string[];
  singlePlaceId?: string;
};

type Camera = { tx: number; ty: number; scale: number };

// Module-level cache — survives route changes within the session.
let savedCamera: Camera | null = null;

const MIN_SCALE = 1;
const MAX_SCALE = 4;

function cluster(
  places: (Place & { memoryCount: number })[],
  threshold: number,
): Marker[] {
  const remaining = [...places];
  const groups: (Place & { memoryCount: number })[][] = [];
  while (remaining.length) {
    const seed = remaining.shift()!;
    const group = [seed];
    for (let i = remaining.length - 1; i >= 0; i--) {
      const p = remaining[i];
      if (Math.hypot(p.x - seed.x, p.y - seed.y) < threshold) {
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [camera, setCameraState] = useState<Camera>(
    () => savedCamera ?? { tx: 0, ty: 0, scale: 1 },
  );
  // Live ref for gesture math — avoids stale-state closures inside handlers.
  const cameraRef = useRef<Camera>(camera);
  const setCamera = useCallback((next: Camera) => {
    cameraRef.current = next;
    savedCamera = next;
    setCameraState(next);
  }, []);

  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  const clampScale = (s: number) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, s));

  // Soft-constrain translation so the map cannot be dragged completely out
  // of view. Bounds grow with the current scale.
  const clampCamera = useCallback((cam: Camera): Camera => {
    const el = containerRef.current;
    if (!el) return cam;
    const { width, height } = el.getBoundingClientRect();
    const overflowX = (width * (cam.scale - 1)) / 2;
    const overflowY = (height * (cam.scale - 1)) / 2;
    return {
      scale: cam.scale,
      tx: Math.max(-overflowX, Math.min(overflowX, cam.tx)),
      ty: Math.max(-overflowY, Math.min(overflowY, cam.ty)),
    };
  }, []);

  // Zoom around a specific screen point, keeping that point stationary.
  const zoomAt = useCallback(
    (nextScale: number, screenX: number, screenY: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = screenX - rect.left - rect.width / 2;
      const cy = screenY - rect.top - rect.height / 2;
      const cur = cameraRef.current;
      const target = clampScale(nextScale);
      const ratio = target / cur.scale;
      const next: Camera = {
        scale: target,
        tx: cx - (cx - cur.tx) * ratio,
        ty: cy - (cy - cur.ty) * ratio,
      };
      setCamera(clampCamera(next));
    },
    [clampCamera, setCamera],
  );

  // ---- Gesture handling (unified pointer events for touch + mouse) --------
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<
    | { kind: "none" }
    | { kind: "pan"; lastX: number; lastY: number; startedAt: number; totalMove: number }
    | {
        kind: "pinch";
        startDist: number;
        startCam: Camera;
        startCenter: { x: number; y: number };
      }
  >({ kind: "none" });
  const lastTap = useRef<{ t: number; x: number; y: number } | null>(null);

  const getTwoPoints = () => {
    const pts = Array.from(pointers.current.values());
    return pts.length >= 2 ? [pts[0], pts[1]] : null;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 1) {
      gesture.current = {
        kind: "pan",
        lastX: e.clientX,
        lastY: e.clientY,
        startedAt: performance.now(),
        totalMove: 0,
      };
    } else if (pointers.current.size >= 2) {
      const two = getTwoPoints();
      if (two) {
        const dx = two[0].x - two[1].x;
        const dy = two[0].y - two[1].y;
        gesture.current = {
          kind: "pinch",
          startDist: Math.hypot(dx, dy) || 1,
          startCam: { ...cameraRef.current },
          startCenter: {
            x: (two[0].x + two[1].x) / 2,
            y: (two[0].y + two[1].y) / 2,
          },
        };
      }
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const g = gesture.current;
    if (g.kind === "pan" && pointers.current.size === 1) {
      const dx = e.clientX - g.lastX;
      const dy = e.clientY - g.lastY;
      g.lastX = e.clientX;
      g.lastY = e.clientY;
      g.totalMove += Math.abs(dx) + Math.abs(dy);
      const cur = cameraRef.current;
      setCamera(clampCamera({ ...cur, tx: cur.tx + dx, ty: cur.ty + dy }));
    } else if (g.kind === "pinch") {
      const two = getTwoPoints();
      if (!two) return;
      const dx = two[0].x - two[1].x;
      const dy = two[0].y - two[1].y;
      const dist = Math.hypot(dx, dy) || 1;
      const ratio = dist / g.startDist;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerNow = {
        x: (two[0].x + two[1].x) / 2,
        y: (two[0].y + two[1].y) / 2,
      };
      // Zoom around the original pinch centre, while also translating so
      // the centroid follows the fingers.
      const cx = g.startCenter.x - rect.left - rect.width / 2;
      const cy = g.startCenter.y - rect.top - rect.height / 2;
      const nextScale = clampScale(g.startCam.scale * ratio);
      const zoomed: Camera = {
        scale: nextScale,
        tx:
          cx -
          (cx - g.startCam.tx) * (nextScale / g.startCam.scale) +
          (centerNow.x - g.startCenter.x),
        ty:
          cy -
          (cy - g.startCam.ty) * (nextScale / g.startCam.scale) +
          (centerNow.y - g.startCenter.y),
      };
      setCamera(clampCamera(zoomed));
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    const g = gesture.current;
    const wasPan = g.kind === "pan";
    const movedLittle = wasPan && (g as { totalMove: number }).totalMove < 8;
    pointers.current.delete(e.pointerId);

    // Double-tap detection when a short, non-moving single-pointer gesture ends.
    if (movedLittle && pointers.current.size === 0) {
      const now = performance.now();
      const prev = lastTap.current;
      if (
        prev &&
        now - prev.t < 300 &&
        Math.hypot(e.clientX - prev.x, e.clientY - prev.y) < 24
      ) {
        zoomAt(cameraRef.current.scale * 1.8, e.clientX, e.clientY);
        lastTap.current = null;
      } else {
        lastTap.current = { t: now, x: e.clientX, y: e.clientY };
      }
    }

    if (pointers.current.size === 0) {
      gesture.current = { kind: "none" };
    } else if (pointers.current.size === 1) {
      const only = Array.from(pointers.current.values())[0];
      gesture.current = {
        kind: "pan",
        lastX: only.x,
        lastY: only.y,
        startedAt: performance.now(),
        totalMove: 0,
      };
    }
  };

  // Wheel / trackpad zoom for desktop use.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && Math.abs(e.deltaY) < 2) return;
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.0015);
      zoomAt(cameraRef.current.scale * factor, e.clientX, e.clientY);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const zoomButton = (dir: 1 | -1) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const factor = dir === 1 ? 1.6 : 1 / 1.6;
    zoomAt(
      cameraRef.current.scale * factor,
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
    );
  };

  // Markers reactively cluster based on current scale.
  const markers = useMemo(() => {
    const threshold = 0.22 / camera.scale;
    if (threshold < 0.08) {
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
    return cluster(places, threshold);
  }, [places, camera.scale]);

  const handleMarkerClick = (m: Marker) => {
    if (m.singlePlaceId) {
      onOpen(m.singlePlaceId);
    } else {
      // Zoom into the cluster centre.
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Convert marker map coords → current screen coords.
      const mapPx = {
        x: (m.x - 0.5) * rect.width * camera.scale + camera.tx + rect.width / 2,
        y: (m.y - 0.5) * rect.height * camera.scale + camera.ty + rect.height / 2,
      };
      zoomAt(camera.scale * 1.8, rect.left + mapPx.x, rect.top + mapPx.y);
    }
  };

  const hint =
    camera.scale < 1.4
      ? "Arraste para explorar · pinça para aproximar"
      : camera.scale < 2.6
        ? "Aproxime mais para ver as fotos"
        : "Toque num lugar para abri-lo";

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full touch-none select-none overflow-hidden bg-[oklch(0.965_0.012_82)]"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      style={{ touchAction: "none" }}
    >
      <div
        className="absolute left-0 top-0 h-full w-full origin-center will-change-transform"
        style={{
          transform: `translate3d(${camera.tx}px, ${camera.ty}px, 0) scale(${camera.scale})`,
          transition: gesture.current.kind === "none" ? "transform 260ms cubic-bezier(0.22,1,0.36,1)" : "none",
        }}
      >
        <MapCanvas />

        {markers.map((m, i) => {
          const isCluster = !m.singlePlaceId;
          return (
            <motion.button
              key={m.id}
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                handleMarkerClick(m);
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.32,
                delay: Math.min(0.24, 0.02 + i * 0.02),
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                left: `${m.x * 100}%`,
                top: `${m.y * 100}%`,
                transform: `translate(-50%, -50%) scale(${1 / camera.scale})`,
                transformOrigin: "center",
              }}
              className="absolute outline-none"
              aria-label={m.label}
            >
              <MarkerShape zoom={camera.scale} marker={m} isCluster={isCluster} />
              {camera.scale >= 1.6 && (
                <span className="mt-2 block whitespace-nowrap text-center text-[10px] uppercase tracking-[0.22em] text-ink-soft">
                  {m.label}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Zoom control — pill in the bottom-right, above the tab bar */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-end px-5"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 88px)" }}
      >
        <div className="pointer-events-auto flex flex-col overflow-hidden rounded-full border border-line-soft bg-surface/95 shadow-paper backdrop-blur-md">
          <button
            type="button"
            onClick={() => zoomButton(1)}
            disabled={camera.scale >= MAX_SCALE - 0.01}
            className="grid h-11 w-11 place-items-center text-ink transition-colors hover:bg-surface-muted disabled:opacity-30"
            aria-label="Aproximar"
          >
            <span className="text-lg leading-none">+</span>
          </button>
          <span className="h-px w-full bg-line-soft" />
          <button
            type="button"
            onClick={() => zoomButton(-1)}
            disabled={camera.scale <= MIN_SCALE + 0.01}
            className="grid h-11 w-11 place-items-center text-ink transition-colors hover:bg-surface-muted disabled:opacity-30"
            aria-label="Afastar"
          >
            <span className="text-lg leading-none">−</span>
          </button>
        </div>
      </div>

      <p
        className="pointer-events-none absolute inset-x-0 z-20 text-center text-[10px] uppercase tracking-[0.28em] text-ink-mute"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 74px)" }}
      >
        {hint}
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
  if (zoom >= 2.6 && !isCluster) {
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

  if (!isCluster && marker.count === 1) {
    return (
      <span className="relative block">
        <span className="absolute inset-0 -m-2 rounded-full bg-accent/15" />
        <span className="relative block h-3 w-3 rounded-full bg-accent ring-2 ring-surface" />
      </span>
    );
  }

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
