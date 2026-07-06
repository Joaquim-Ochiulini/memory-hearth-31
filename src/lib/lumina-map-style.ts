/**
 * Lumina map style — warm, paper-like, muted. Keeps streets & rivers
 * recognisable so users navigate with confidence, but drops POI noise
 * and desaturates the palette to sit under the Lumina identity.
 */
export const luminaMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#F3EEE6" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#7A746E" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#FFFCF8" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },

  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#E2D9CC" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#5C544C" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#4A423B" }] },

  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#DFE3D0" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#7A8A6A" }] },

  { featureType: "road", elementType: "geometry", stylers: [{ color: "#FFFCF8" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#EAE2D4" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road.arterial", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#8A8078" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#F4E9D6" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#E4D5B8" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#8A6A3D" }] },

  { featureType: "transit", stylers: [{ visibility: "off" }] },

  { featureType: "water", elementType: "geometry", stylers: [{ color: "#C7D6DA" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#6A8290" }] },
];

/** Data URI for a Lumina-styled marker: paper circle, accent ring, count. */
export function luminaMarkerIcon(count: number): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="52" height="60" viewBox="0 0 52 60">
  <defs>
    <filter id="s" x="-30%" y="-20%" width="160%" height="160%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.2"/>
      <feOffset dy="1.5"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.28"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <g filter="url(#s)">
    <circle cx="26" cy="24" r="20" fill="#FFFCF8" stroke="#B08B57" stroke-width="1.25"/>
    <circle cx="26" cy="24" r="16" fill="none" stroke="#E9E3DB" stroke-width="0.75"/>
    <text x="26" y="29" text-anchor="middle" font-family="'Cormorant Garamond', Georgia, serif"
          font-size="17" font-style="italic" fill="#2B2623">${count}</text>
    <path d="M26 46 L22 52 L30 52 Z" fill="#FFFCF8" stroke="#B08B57" stroke-width="1.25"/>
  </g>
</svg>`.trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
