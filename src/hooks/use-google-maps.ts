import { useEffect, useState } from "react";

type Status = "idle" | "loading" | "ready" | "error";

let promise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (promise) return promise;

  const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as
    | string
    | undefined;
  const channel = import.meta.env
    .VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined;

  promise = new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if ((window as any).google?.maps) return resolve();
    if (!key) return reject(new Error("Missing Google Maps browser key"));

    const cbName = "__luminaInitMap";
    (window as any)[cbName] = () => resolve();

    const script = document.createElement("script");
    const params = new URLSearchParams({
      key,
      loading: "async",
      callback: cbName,
      v: "weekly",
    });
    if (channel) params.set("channel", channel);
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });

  return promise;
}

export function useGoogleMaps() {
  const [status, setStatus] = useState<Status>(() =>
    typeof window !== "undefined" && (window as any).google?.maps
      ? "ready"
      : "idle",
  );

  useEffect(() => {
    if (status === "ready") return;
    setStatus("loading");
    loadScript()
      .then(() => setStatus("ready"))
      .catch(() => setStatus("error"));
  }, [status]);

  return status;
}
