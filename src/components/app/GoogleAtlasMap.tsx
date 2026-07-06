import { useEffect, useRef } from "react";
import type { Place } from "@/features/memories/data";
import { useGoogleMaps } from "@/hooks/use-google-maps";
import { luminaMapStyle, luminaMarkerIcon } from "@/lib/lumina-map-style";
import { Plus, Minus, Loader2 } from "lucide-react";

export interface AtlasPlace extends Place {
  memoryCount: number;
}

interface Props {
  places: AtlasPlace[];
  activeId: string | null;
  onSelect: (id: string) => void;
  focus?: { lat: number; lng: number; zoom?: number } | null;
}

// Persist camera across mounts so returning from a Place feels seamless.
let savedCamera: { center: google.maps.LatLngLiteral; zoom: number } | null =
  null;

export function GoogleAtlasMap({ places, activeId, onSelect, focus }: Props) {
  const status = useGoogleMaps();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());

  // Initialise the map once.
  useEffect(() => {
    if (status !== "ready" || !containerRef.current || mapRef.current) return;

    const initial =
      savedCamera ??
      (() => {
        // Fit an initial camera around all pins.
        const bounds = new google.maps.LatLngBounds();
        for (const p of places) bounds.extend({ lat: p.lat, lng: p.lng });
        const center = bounds.getCenter().toJSON();
        return { center, zoom: 3.4 };
      })();

    const map = new google.maps.Map(containerRef.current, {
      center: initial.center,
      zoom: initial.zoom,
      minZoom: 2,
      maxZoom: 18,
      disableDefaultUI: true,
      gestureHandling: "greedy", // 1-finger pan on touch, pinch zoom, wheel zoom
      clickableIcons: false,
      backgroundColor: "#F3EEE6",
      styles: luminaMapStyle,
      keyboardShortcuts: false,
    });
    mapRef.current = map;

    map.addListener("idle", () => {
      const c = map.getCenter();
      const z = map.getZoom();
      if (c && z != null) savedCamera = { center: c.toJSON(), zoom: z };
    });
  }, [status, places]);

  // Sync markers whenever data changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== "ready") return;

    const existing = markersRef.current;

    // Remove markers no longer in the set.
    for (const [id, m] of existing) {
      if (!places.find((p) => p.id === id)) {
        m.setMap(null);
        existing.delete(id);
      }
    }

    for (const p of places) {
      let marker = existing.get(p.id);
      if (!marker) {
        marker = new google.maps.Marker({
          map,
          position: { lat: p.lat, lng: p.lng },
          title: p.name,
          icon: {
            url: luminaMarkerIcon(p.memoryCount),
            scaledSize: new google.maps.Size(52, 60),
            anchor: new google.maps.Point(26, 52),
          },
          optimized: false,
          zIndex: 10,
        });
        marker.addListener("click", () => onSelect(p.id));
        existing.set(p.id, marker);
      }
    }
  }, [places, status, onSelect]);

  // Highlight active marker & pan to it gently.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    for (const [id, marker] of markersRef.current) {
      marker.setZIndex(id === activeId ? 999 : 10);
    }
    if (activeId) {
      const p = places.find((pp) => pp.id === activeId);
      if (p) map.panTo({ lat: p.lat, lng: p.lng });
    }
  }, [activeId, places]);

  // Programmatic focus (search result, explore).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focus) return;
    map.panTo({ lat: focus.lat, lng: focus.lng });
    if (focus.zoom != null) {
      const current = map.getZoom() ?? 4;
      if (Math.abs(current - focus.zoom) > 0.4) {
        map.setZoom(focus.zoom);
      }
    }
  }, [focus]);

  const zoom = (delta: number) => {
    const map = mapRef.current;
    if (!map) return;
    const z = (map.getZoom() ?? 4) + delta;
    map.setZoom(Math.max(2, Math.min(18, z)));
  };

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="absolute inset-0 bg-[#F3EEE6]" />

      {status !== "ready" && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          {status === "error" ? (
            <p className="max-w-[240px] text-center text-[13px] text-ink-soft">
              Não foi possível abrir o mapa agora.
            </p>
          ) : (
            <Loader2
              className="h-5 w-5 animate-spin text-ink-mute"
              strokeWidth={1.5}
            />
          )}
        </div>
      )}

      {/* Zoom controls — alternative, not primary */}
      <div
        className="absolute right-4 z-20 flex flex-col overflow-hidden rounded-full border border-line-soft bg-surface/90 shadow-paper backdrop-blur-md"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 6.5rem)" }}
      >
        <button
          type="button"
          onClick={() => zoom(1)}
          aria-label="Aproximar"
          className="grid h-11 w-11 place-items-center text-ink transition-colors hover:bg-surface-muted"
        >
          <Plus className="h-4 w-4" strokeWidth={1.6} />
        </button>
        <span className="mx-2 h-px bg-line-soft" />
        <button
          type="button"
          onClick={() => zoom(-1)}
          aria-label="Afastar"
          className="grid h-11 w-11 place-items-center text-ink transition-colors hover:bg-surface-muted"
        >
          <Minus className="h-4 w-4" strokeWidth={1.6} />
        </button>
      </div>
    </div>
  );
}
